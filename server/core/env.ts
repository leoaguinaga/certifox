import "server-only";
import { z } from "zod";

/**
 * Configuración validada del servidor.
 *
 * - En producción (runtime) las variables críticas son OBLIGATORIAS: si faltan, el
 *   proceso falla al arrancar en vez de usar valores inseguros por defecto.
 * - Durante `next build` y en desarrollo/tests se permiten defaults locales.
 * - Todas las integraciones externas (R2, Upstash, Resend, cron) son opcionales:
 *   si no están configuradas, el sistema usa un modo degradado seguro y lo registra.
 */
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const isProductionRuntime =
  process.env.NODE_ENV === "production" && !isBuildPhase && process.env.SKIP_ENV_VALIDATION !== "1";

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined));

const csv = optionalString.transform((v) =>
  v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []
);

/** Obligatoria en producción; con default local en desarrollo, build y tests. */
const devDefault = (schema: z.ZodString, fallback: string) =>
  isProductionRuntime ? schema : schema.default(fallback);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Base de datos
  DATABASE_URL: devDefault(z.string().url(), "postgresql://postgres:postgres@localhost:5432/certifox"),
  DATABASE_READ_REPLICA_URL: optionalString,

  // Auth
  BETTER_AUTH_SECRET: devDefault(
    z.string().min(32, "BETTER_AUTH_SECRET debe tener al menos 32 caracteres"),
    "dev-only-secret-certifox-not-for-production-use"
  ),
  BETTER_AUTH_URL: devDefault(z.string().url(), "http://localhost:3000"),
  /** Orígenes extra permitidos (CSV). Admite comodines de subdominio: https://*.certifox.pe */
  TRUSTED_ORIGINS: csv,

  // Multi-tenant
  /** Dominio raíz (sin protocolo). <slug>.ROOT_DOMAIN resuelve la organización. */
  ROOT_DOMAIN: optionalString,
  NEXT_PUBLIC_APP_URL: optionalString,

  // Cloudflare R2
  R2_ACCOUNT_ID: optionalString,
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  /** Bucket público (servido por NEXT_PUBLIC_MEDIA_URL). */
  R2_BUCKET: z.string().default("certifox-media"),
  /** Bucket privado (sin dominio público): PDFs de certificados, adjuntos. */
  R2_PRIVATE_BUCKET: z.string().default("certifox-private"),
  NEXT_PUBLIC_MEDIA_URL: z.string().default("https://media.certifox.edu"),

  // Rate limit / KV distribuido
  UPSTASH_REDIS_REST_URL: optionalString,
  UPSTASH_REDIS_REST_TOKEN: optionalString,

  // Jobs
  CRON_SECRET: optionalString,

  // Email
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: z.string().default("Certifox <no-reply@certifox.pe>"),

  // Observabilidad
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`❌ Variables de entorno inválidas:\n${issues}`);
  }
  return parsed.data;
}

export const env = loadEnv();

export const features = {
  r2: Boolean(env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY),
  redis: Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
  email: Boolean(env.RESEND_API_KEY),
  readReplica: Boolean(env.DATABASE_READ_REPLICA_URL),
} as const;

export const isProduction = env.NODE_ENV === "production";

export function appUrl(): string {
  return (env.NEXT_PUBLIC_APP_URL || env.BETTER_AUTH_URL).replace(/\/$/, "");
}
