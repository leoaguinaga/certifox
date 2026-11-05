// Debe ejecutarse antes de importar server/core/env y server/core/db.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  delete process.env.DATABASE_READ_REPLICA_URL;
}
// Sin integraciones externas en tests.
for (const key of ["R2_ACCOUNT_ID", "UPSTASH_REDIS_REST_URL", "RESEND_API_KEY"]) delete process.env[key];
