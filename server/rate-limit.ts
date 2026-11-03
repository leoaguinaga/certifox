import "server-only";

interface RateLimitRecord {
  timestamps: number[];
}

const ipMap = new Map<string, RateLimitRecord>();

/**
 * Validador de rate limit en memoria (sliding window).
 * Regla RNF-04: Límite de 30 consultas/minuto por IP en la verificación de certificados.
 */
export function checkRateLimit(
  ip: string,
  limit = 30,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const cutoff = now - windowMs;

  const record = ipMap.get(ip) ?? { timestamps: [] };
  // Filtrar timestamps fuera de la ventana de 1 minuto
  const recentTimestamps = record.timestamps.filter((ts) => ts > cutoff);

  if (recentTimestamps.length >= limit) {
    ipMap.set(ip, { timestamps: recentTimestamps });
    return { allowed: false, remaining: 0 };
  }

  recentTimestamps.push(now);
  ipMap.set(ip, { timestamps: recentTimestamps });

  // Limpieza periódica de memoria cuando supere 5,000 IPs
  if (ipMap.size > 5_000) {
    for (const [key, val] of ipMap.entries()) {
      const active = val.timestamps.filter((ts) => ts > cutoff);
      if (active.length === 0) {
        ipMap.delete(key);
      } else {
        ipMap.set(key, { timestamps: active });
      }
    }
  }

  return { allowed: true, remaining: limit - recentTimestamps.length };
}

/**
 * Función para reiniciar el rate limit (útil para tests).
 */
export function resetRateLimits() {
  ipMap.clear();
}
