import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimits } from "../server/rate-limit";

describe("Rate Limiting en Verificación (server/rate-limit.ts)", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("RNF-04: Permite hasta 30 consultas por minuto por IP y bloquea la 31", () => {
    const testIp = "192.168.1.100";

    // 30 peticiones permitidas
    for (let i = 1; i <= 30; i++) {
      const result = checkRateLimit(testIp, 30, 60_000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(30 - i);
    }

    // La petición 31 debe ser bloqueada
    const blocked = checkRateLimit(testIp, 30, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);

    // Otra IP diferente debe seguir teniendo sus 30 créditos
    const otherIp = "192.168.1.200";
    const otherResult = checkRateLimit(otherIp, 30, 60_000);
    expect(otherResult.allowed).toBe(true);
    expect(otherResult.remaining).toBe(29);
  });
});
