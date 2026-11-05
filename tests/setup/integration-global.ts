import { execSync } from "node:child_process";

/** Aplica las migraciones reales sobre la BD de test (valida también el SQL de migración). */
export default function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    console.warn("⚠️  TEST_DATABASE_URL no definida: los tests de integración se omiten.");
    return;
  }
  execSync("pnpm exec prisma migrate reset --force --skip-seed --skip-generate", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
}
