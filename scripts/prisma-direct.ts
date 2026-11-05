/**
 * Ejecuta el CLI de Prisma contra la conexión DIRECTA a Postgres, derivada de
 * `DATABASE_URL` (ver lib/database-url.ts). Así el proyecto solo necesita una
 * variable de entorno para runtime y migraciones.
 *
 * Uso: tsx scripts/prisma-direct.ts migrate deploy
 *      tsx scripts/prisma-direct.ts --run scripts/otro-script.ts [args]   (script propio con la URL directa)
 */
import { spawnSync } from "node:child_process";
import { resolveDirectDatabaseUrl } from "../lib/database-url";

// Mismo orden de precedencia que Next.js; nunca sobrescribe variables ya definidas.
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // El archivo no existe: en CI/Vercel las variables vienen del entorno.
  }
}

const directUrl = resolveDirectDatabaseUrl();
if (!directUrl) {
  console.error("❌ DATABASE_URL no está definida.");
  process.exit(1);
}

const args = process.argv.slice(2);
const [bin, binArgs] = args[0] === "--run" ? ["tsx", args.slice(1)] : ["prisma", args];

const result = spawnSync(bin, binArgs, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, DATABASE_URL: directUrl },
});

process.exit(result.status ?? 1);
