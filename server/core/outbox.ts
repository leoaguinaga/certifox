import "server-only";
import { Prisma } from "@prisma/client";
import { db, type DbClient } from "./db";
import { logger } from "./logger";

/**
 * Patrón outbox transaccional.
 *
 * Los casos de uso escriben el evento en la MISMA transacción que el cambio de dominio
 * (`enqueue(tx, ...)`): si la transacción se revierte, no hay evento; si confirma, el
 * evento se procesará con certeza (reintentos con backoff exponencial).
 *
 * Los eventos se procesan:
 *   1. justo después de responder (`after()`), para baja latencia, y
 *   2. por el cron `/api/internal/outbox` como red de seguridad.
 * Varios workers pueden correr en paralelo: el reclamo usa FOR UPDATE SKIP LOCKED.
 */
export type OutboxEventType =
  | "certificate.issued"
  | "certificate.revoked"
  | "enrollment.requested"
  | "enrollment.activated"
  | "file.delete";

export interface OutboxEvent {
  id: string;
  type: OutboxEventType;
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
}

export type OutboxHandler = (event: OutboxEvent) => Promise<void>;
export type OutboxHandlers = Partial<Record<OutboxEventType, OutboxHandler>>;

export async function enqueue(
  client: DbClient,
  type: OutboxEventType,
  payload: Record<string, unknown>,
  opts: { delaySeconds?: number } = {}
): Promise<void> {
  await client.outboxEvent.create({
    data: {
      type,
      payload: payload as Prisma.InputJsonValue,
      availableAt: new Date(Date.now() + (opts.delaySeconds ?? 0) * 1000),
    },
  });
}

const STALE_LOCK_MINUTES = 5;

export function backoffSeconds(attempts: number): number {
  return Math.min(3600, 30 * 2 ** Math.max(0, attempts - 1));
}

async function claim(limit: number): Promise<OutboxEvent[]> {
  const rows = await db.$queryRaw<
    { id: string; type: string; payload: unknown; attempts: number; maxAttempts: number }[]
  >`
    UPDATE "outbox_events" SET "status" = 'PROCESSING', "lockedAt" = NOW(), "attempts" = "attempts" + 1
    WHERE "id" IN (
      SELECT "id" FROM "outbox_events"
      WHERE ("status" = 'PENDING' AND "availableAt" <= NOW())
         OR ("status" = 'PROCESSING' AND "lockedAt" < NOW() - (${STALE_LOCK_MINUTES} * INTERVAL '1 minute'))
      ORDER BY "availableAt" ASC
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING "id", "type", "payload", "attempts", "maxAttempts"
  `;
  return rows.map((r) => ({
    id: r.id,
    type: r.type as OutboxEventType,
    payload: (r.payload ?? {}) as Record<string, unknown>,
    attempts: r.attempts,
    maxAttempts: r.maxAttempts,
  }));
}

export async function drainOutbox(
  handlers: OutboxHandlers,
  opts: { limit?: number; maxBatches?: number } = {}
): Promise<{ processed: number; failed: number }> {
  let processed = 0;
  let failed = 0;
  const limit = opts.limit ?? 20;

  for (let batch = 0; batch < (opts.maxBatches ?? 5); batch++) {
    const events = await claim(limit);
    if (events.length === 0) break;

    for (const event of events) {
      const handler = handlers[event.type];
      const log = logger.child({ outboxId: event.id, type: event.type, attempt: event.attempts });
      try {
        if (!handler) throw new Error(`Sin handler para ${event.type}`);
        await handler(event);
        await db.outboxEvent.update({
          where: { id: event.id },
          data: { status: "DONE", processedAt: new Date(), lockedAt: null, lastError: null },
        });
        processed++;
      } catch (err) {
        failed++;
        const exhausted = event.attempts >= event.maxAttempts;
        log.error(exhausted ? "outbox.dead_letter" : "outbox.retry", { err });
        await db.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: exhausted ? "FAILED" : "PENDING",
            lockedAt: null,
            lastError: err instanceof Error ? err.message.slice(0, 1000) : String(err),
            availableAt: new Date(Date.now() + backoffSeconds(event.attempts) * 1000),
          },
        });
      }
    }
    if (events.length < limit) break;
  }
  return { processed, failed };
}
