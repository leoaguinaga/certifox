/**
 * Build de Vercel (Vercel usa el script `vercel-build` si existe).
 *
 * O1: aplica las migraciones pendientes ANTES del build, pero solo cuando el deploy
 * tiene su propia base de datos:
 *   - Production siempre (VERCEL_ENV=production)
 *   - Preview solo si MIGRATE_ON_BUILD=1 (p. ej. con la integración Neon ↔ Vercel,
 *     que crea una rama de BD por preview). Así un preview nunca migra producción.
 */
import { spawnSync } from "node:child_process";

function run(cmd: string, args: string[]) {
  const res = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

const shouldMigrate = process.env.VERCEL_ENV === "production" || process.env.MIGRATE_ON_BUILD === "1";

if (shouldMigrate) {
  console.log("▶ Aplicando migraciones (prisma migrate deploy)…");
  run("pnpm", ["db:deploy"]);
} else {
  console.log(`⏭  Migraciones omitidas (VERCEL_ENV=${process.env.VERCEL_ENV ?? "local"}; usa MIGRATE_ON_BUILD=1 para forzarlas)`);
}

run("pnpm", ["build"]);
