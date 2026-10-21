import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().default("postgresql://postgres:postgres@localhost:5432/certifox"),
  DIRECT_URL: z.string().url().default("postgresql://postgres:postgres@localhost:5432/certifox"),
  BETTER_AUTH_SECRET: z.string().min(16).default("dev-secret-certifox-development-key-32b"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  R2_ACCOUNT_ID: z.string().optional().default(""),
  R2_ACCESS_KEY_ID: z.string().optional().default(""),
  R2_SECRET_ACCESS_KEY: z.string().optional().default(""),
  R2_BUCKET: z.string().optional().default("certifox-media"),
  NEXT_PUBLIC_MEDIA_URL: z.string().default("https://media.certifox.edu"),
  NEXT_PUBLIC_PAYMENT_WHATSAPP: z.string().default("51999999999"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET: process.env.R2_BUCKET,
  NEXT_PUBLIC_MEDIA_URL: process.env.NEXT_PUBLIC_MEDIA_URL,
  NEXT_PUBLIC_PAYMENT_WHATSAPP: process.env.NEXT_PUBLIC_PAYMENT_WHATSAPP,
});
