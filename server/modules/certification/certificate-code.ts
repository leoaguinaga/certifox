import { createHash, randomBytes } from "node:crypto";

/**
 * S1: códigos de certificado con 80 bits aleatorios en Crockford base32
 * (sin I, L, O, U → sin ambigüedad al dictarlos o leerlos de un papel).
 * Formato: CFX-XXXX-XXXX-XXXX-XXXX  (2^80 ≈ 1,2 × 10^24 combinaciones).
 * Los códigos antiguos (CFX-AAAA-NNNN) siguen siendo válidos para verificación.
 */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const CERTIFICATE_CODE_BITS = 80;

export function generateCertificateCode(bytes: Uint8Array = randomBytes(CERTIFICATE_CODE_BITS / 8)): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return `CFX-${out.match(/.{1,4}/g)!.join("-")}`;
}

/** Normaliza lo que escribe un usuario: mayúsculas, sin espacios. */
export function normalizeCertificateCode(input: string): string {
  return decodeURIComponent(input).trim().toUpperCase().replace(/\s+/g, "");
}

/** Formato plausible antes de tocar la BD (corta enumeración con basura y payloads largos). */
export function isPlausibleCertificateCode(code: string): boolean {
  return /^CFX-[0-9A-Z-]{4,40}$/.test(code);
}

/** Huella SHA-256 del contenido certificado (snapshot inmutable). */
export function certificateFingerprint(data: {
  code: string;
  holderName: string;
  courseTitle: string;
  hours: number;
  organizationId: string;
  enrollmentId: string;
  issuedAt: Date;
}): string {
  const payload = [
    data.code,
    data.holderName,
    data.courseTitle,
    data.hours,
    data.organizationId,
    data.enrollmentId,
    data.issuedAt.toISOString(),
  ].join("|");
  return createHash("sha256").update(payload).digest("hex");
}
