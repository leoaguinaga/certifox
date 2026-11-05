import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { env } from "@/server/core/env";
import { logger } from "@/server/core/logger";
import { runMaintenance } from "@/server/modules/jobs/jobs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: Request): boolean {
  if (!env.CRON_SECRET) return env.NODE_ENV !== "production";
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${env.CRON_SECRET}`;
  return header.length === expected.length && timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}

/**
 * Red de seguridad de los jobs (Vercel Cron, ver vercel.json):
 *  - procesa eventos del outbox pendientes o con reintento
 *  - limpia subidas abandonadas y sesiones vencidas
 */
export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const started = Date.now();
  const summary = { ...(await runMaintenance()), ms: Date.now() - started };
  logger.info("cron.done", summary);
  return NextResponse.json(summary);
}
