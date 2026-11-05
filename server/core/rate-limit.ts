import "server-only";
import { incrementWindow } from "./kv";
import { rateLimited } from "./errors";

export interface RateLimitRule {
  /** Ventana en segundos. */
  window: number;
  /** Máximo de solicitudes por ventana. */
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number | null;
}

/** Reglas centralizadas para que se puedan ajustar en un solo lugar. */
export const RATE_LIMITS = {
  /** RNF-04: verificación pública de certificados. */
  verifyCertificate: { window: 60, max: 30 },
  certificatePdf: { window: 60, max: 10 },
  /** Mutaciones autenticadas genéricas (por usuario). */
  mutation: { window: 60, max: 60 },
  enrollmentRequest: { window: 3600, max: 10 },
  uploadPresign: { window: 3600, max: 60 },
  ticketCreate: { window: 3600, max: 10 },
} satisfies Record<string, RateLimitRule>;

/**
 * Rate limit distribuido de ventana fija (Upstash Redis; memoria como fallback).
 * La interfaz coincide con `customStorage.consume` de Better Auth para compartir backend.
 */
export async function consume(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
  const { count, ttlMs } = await incrementWindow(`rl:${key}`, rule.window);
  if (count > rule.max) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil(ttlMs / 1000) };
  }
  return { allowed: true, remaining: rule.max - count, retryAfter: null };
}

/** Igual que `consume` pero lanza DomainError RATE_LIMITED. */
export async function enforce(key: string, rule: RateLimitRule): Promise<void> {
  const res = await consume(key, rule);
  if (!res.allowed) throw rateLimited();
}
