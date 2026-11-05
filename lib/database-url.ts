/**
 * Deriva la URL de conexión directa (sin pooler) a partir de `DATABASE_URL`.
 *
 * Certifox usa una sola variable: `DATABASE_URL` (la del pooler de Neon).
 * El runtime serverless la usa tal cual; las herramientas que necesitan una
 * sesión Postgres real (Prisma Migrate usa advisory locks de sesión, que no
 * funcionan sobre PgBouncer en modo transacción) obtienen la URL directa
 * quitando el sufijo `-pooler` del endpoint, que es la convención de Neon:
 *
 *   ep-foo-123-pooler.us-east-1.aws.neon.tech  →  ep-foo-123.us-east-1.aws.neon.tech
 *
 * Si la URL no es de un pooler de Neon (p. ej. Postgres local) se devuelve sin
 * cambios. `DIRECT_URL` sigue aceptándose como override opcional para
 * proveedores cuyo host directo no se pueda derivar.
 */
export function toDirectDatabaseUrl(databaseUrl: string): string {
  let url: URL;
  try {
    url = new URL(databaseUrl);
  } catch {
    return databaseUrl;
  }

  const [endpoint, ...rest] = url.hostname.split(".");
  const isNeon = url.hostname.endsWith(".neon.tech");

  if (isNeon && endpoint.endsWith("-pooler")) {
    url.hostname = [endpoint.slice(0, -"-pooler".length), ...rest].join(".");
  }

  // Parámetros que solo tienen sentido detrás de PgBouncer.
  url.searchParams.delete("pgbouncer");

  return url.toString();
}

export function resolveDirectDatabaseUrl(
  env: Record<string, string | undefined> = process.env
): string | undefined {
  if (env.DIRECT_URL) return env.DIRECT_URL;
  if (env.DATABASE_URL) return toDirectDatabaseUrl(env.DATABASE_URL);
  return undefined;
}
