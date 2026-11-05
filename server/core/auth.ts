import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";
import { env } from "./env";
import { consume } from "./rate-limit";

function trustedOrigins(): string[] {
  const origins = new Set<string>([env.BETTER_AUTH_URL, ...env.TRUSTED_ORIGINS]);
  if (env.NEXT_PUBLIC_APP_URL) origins.add(env.NEXT_PUBLIC_APP_URL);
  if (env.ROOT_DOMAIN) {
    origins.add(`https://${env.ROOT_DOMAIN}`);
    origins.add(`https://*.${env.ROOT_DOMAIN}`);
  }
  return [...origins];
}

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: trustedOrigins(),
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    // D4: la sesión se valida desde una cookie firmada durante 5 min; evita
    // consultar la tabla `sessions` en cada request. Revocar sesiones tarda ≤ 5 min.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  rateLimit: {
    enabled: env.NODE_ENV === "production",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 10 },
      "/sign-up/email": { window: 3600, max: 10 },
      "/change-password": { window: 600, max: 5 },
    },
    // S5/S7: mismo backend distribuido que el resto de la app (Upstash; memoria si falta).
    customStorage: { consume: (key, rule) => consume(`auth:${key}`, rule) },
  },
  advanced: {
    ipAddress: { ipAddressHeaders: ["cf-connecting-ip", "x-real-ip", "x-forwarded-for"] },
    ...(env.ROOT_DOMAIN
      ? { crossSubDomainCookies: { enabled: true, domain: `.${env.ROOT_DOMAIN}` } }
      : {}),
  },
  user: {
    additionalFields: {
      // AC-23: el registro público nunca puede asignar privilegios.
      platformRole: { type: "string", defaultValue: "USER", input: false },
      documentType: { type: "string", required: false },
      documentNumber: { type: "string", required: false },
      institution: { type: "string", required: false },
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
