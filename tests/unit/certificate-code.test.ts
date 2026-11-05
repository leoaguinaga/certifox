import { describe, expect, it } from "vitest";
import {
  CERTIFICATE_CODE_BITS,
  certificateFingerprint,
  generateCertificateCode,
  isPlausibleCertificateCode,
  normalizeCertificateCode,
} from "@/server/modules/certification/certificate-code";
import { effectiveStatus } from "@/server/modules/certification/verification.service";

describe("códigos de certificado (S1)", () => {
  it("tienen ≥ 80 bits y formato Crockford agrupado", () => {
    expect(CERTIFICATE_CODE_BITS).toBeGreaterThanOrEqual(80);
    const code = generateCertificateCode();
    expect(code).toMatch(/^CFX-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
    // 16 símbolos base32 × 5 bits = 80 bits
    expect(code.replace(/^CFX-|-/g, "")).toHaveLength(16);
  });

  it("es determinista respecto de los bytes y no repite en 10k muestras", () => {
    expect(generateCertificateCode(new Uint8Array(10))).toBe("CFX-0000-0000-0000-0000");
    expect(generateCertificateCode(new Uint8Array(10).fill(255))).toBe("CFX-ZZZZ-ZZZZ-ZZZZ-ZZZZ");
    const set = new Set(Array.from({ length: 10_000 }, () => generateCertificateCode()));
    expect(set.size).toBe(10_000);
  });

  it("normaliza entrada y descarta basura antes de consultar la BD", () => {
    expect(normalizeCertificateCode(" cfx-2025-9831 ")).toBe("CFX-2025-9831");
    expect(isPlausibleCertificateCode("CFX-2025-9831")).toBe(true); // códigos antiguos siguen siendo válidos
    expect(isPlausibleCertificateCode("'; DROP TABLE")).toBe(false);
    expect(isPlausibleCertificateCode("CFX-" + "A".repeat(200))).toBe(false);
  });

  it("la huella cambia si cambia cualquier dato certificado", () => {
    const base = {
      code: "CFX-1",
      holderName: "Ana",
      courseTitle: "Curso",
      hours: 10,
      organizationId: "o",
      enrollmentId: "e",
      issuedAt: new Date("2026-01-01T00:00:00Z"),
    };
    expect(certificateFingerprint(base)).toMatch(/^[a-f0-9]{64}$/);
    expect(certificateFingerprint(base)).toBe(certificateFingerprint({ ...base }));
    expect(certificateFingerprint(base)).not.toBe(certificateFingerprint({ ...base, holderName: "Ana M." }));
  });

  it("estado efectivo: vencimiento calculado al leer (RF-23)", () => {
    const now = new Date("2026-06-01");
    expect(effectiveStatus("VALID", new Date("2027-01-01"), now)).toBe("valido");
    expect(effectiveStatus("VALID", new Date("2026-01-01"), now)).toBe("expirado");
    expect(effectiveStatus("REVOKED", null, now)).toBe("revocado");
    expect(effectiveStatus("OBSERVED", null, now)).toBe("observado");
  });
});
