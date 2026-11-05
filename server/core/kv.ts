import "server-only";
import { env, features } from "./env";
import { logger } from "./logger";

/**
 * KV mínimo sobre Upstash Redis (API REST, sin dependencias ni conexiones TCP:
 * ideal para serverless). Si no está configurado, usa memoria del proceso y lo avisa:
 * en ese modo los límites NO se comparten entre instancias.
 */
type Command = (string | number)[];

async function upstashPipeline(commands: Command[]): Promise<unknown[]> {
  const res = await fetch(`${env.UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash respondió ${res.status}`);
  const data = (await res.json()) as { result?: unknown; error?: string }[];
  return data.map((d) => {
    if (d.error) throw new Error(`Upstash: ${d.error}`);
    return d.result;
  });
}

// ---------------------------------------------------------------------------
// Fallback en memoria (desarrollo / tests / degradado)
// ---------------------------------------------------------------------------
const memory = new Map<string, { count: number; expiresAt: number }>();
let warned = false;

function memoryIncr(key: string, windowSec: number): { count: number; ttlMs: number } {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.expiresAt <= now) {
    memory.set(key, { count: 1, expiresAt: now + windowSec * 1000 });
    if (memory.size > 10_000) {
      for (const [k, v] of memory) if (v.expiresAt <= now) memory.delete(k);
    }
    return { count: 1, ttlMs: windowSec * 1000 };
  }
  entry.count += 1;
  return { count: entry.count, ttlMs: entry.expiresAt - now };
}

/**
 * Incrementa un contador de ventana fija y devuelve el valor y el TTL restante.
 * INCR + EXPIRE NX en un solo round-trip: atómico respecto a la ventana.
 */
export async function incrementWindow(key: string, windowSec: number): Promise<{ count: number; ttlMs: number }> {
  if (!features.redis) {
    if (!warned && env.NODE_ENV === "production") {
      warned = true;
      logger.warn("kv.memory_fallback", { reason: "UPSTASH_REDIS_REST_URL/TOKEN no configurados" });
    }
    return memoryIncr(key, windowSec);
  }
  try {
    const [count, , ttl] = (await upstashPipeline([
      ["INCR", key],
      ["EXPIRE", key, windowSec, "NX"],
      ["PTTL", key],
    ])) as [number, number, number];
    return { count, ttlMs: ttl > 0 ? ttl : windowSec * 1000 };
  } catch (err) {
    // Fail-open controlado: si Redis cae no tumbamos la app; se usa memoria local.
    logger.error("kv.upstash_error", { err });
    return memoryIncr(key, windowSec);
  }
}

export function resetMemoryKv() {
  memory.clear();
}
