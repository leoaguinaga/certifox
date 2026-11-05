import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/server/core/db";
import { drainOutbox, enqueue } from "@/server/core/outbox";
import { hasDb, resetDb } from "./helpers";

describe.skipIf(!hasDb)("outbox transaccional (Postgres real)", () => {
  beforeEach(resetDb);

  it("si la transacción se revierte, el evento no existe", async () => {
    await expect(
      db.$transaction(async (tx) => {
        await enqueue(tx, "file.delete", { fileId: "x" });
        throw new Error("rollback");
      })
    ).rejects.toThrow("rollback");
    expect(await db.outboxEvent.count()).toBe(0);
  });

  it("procesa eventos y los marca DONE", async () => {
    await enqueue(db, "enrollment.activated", { enrollmentId: "e1" });
    const handler = vi.fn(async () => {});
    expect(await drainOutbox({ "enrollment.activated": handler })).toEqual({ processed: 1, failed: 0 });
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ payload: { enrollmentId: "e1" }, attempts: 1 }));
    expect((await db.outboxEvent.findFirstOrThrow()).status).toBe("DONE");
  });

  it("reintenta con backoff y pasa a FAILED al agotar intentos", async () => {
    await enqueue(db, "file.delete", { fileId: "f" });
    await db.outboxEvent.updateMany({ data: { maxAttempts: 2 } });
    const failing = { "file.delete": vi.fn(async () => { throw new Error("R2 caído"); }) };

    await drainOutbox(failing);
    let ev = await db.outboxEvent.findFirstOrThrow();
    expect(ev).toMatchObject({ status: "PENDING", attempts: 1, lastError: "R2 caído" });
    expect(ev.availableAt.getTime()).toBeGreaterThan(Date.now());

    await db.outboxEvent.updateMany({ data: { availableAt: new Date(0) } });
    await drainOutbox(failing);
    ev = await db.outboxEvent.findFirstOrThrow();
    expect(ev).toMatchObject({ status: "FAILED", attempts: 2 });
  });

  it("workers concurrentes no procesan dos veces el mismo evento (SKIP LOCKED)", async () => {
    for (let i = 0; i < 30; i++) await enqueue(db, "enrollment.requested", { i });
    const seen: number[] = [];
    const handler = vi.fn(async (e: { payload: Record<string, unknown> }) => {
      seen.push(Number(e.payload.i));
      await new Promise((r) => setTimeout(r, 5));
    });
    await Promise.all(Array.from({ length: 4 }, () => drainOutbox({ "enrollment.requested": handler }, { limit: 5 })));
    expect(seen).toHaveLength(30);
    expect(new Set(seen).size).toBe(30);
  });
});
