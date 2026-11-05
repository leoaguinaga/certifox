import "server-only";
import { Prisma, PrismaClient } from "@prisma/client";
import { env } from "./env";

/**
 * Cliente Prisma único por proceso (reutilizado entre invocaciones en caliente).
 *
 * - `db`: primario (lecturas y escrituras). Usa DATABASE_URL (pooler de Neon).
 * - `dbRead`: réplica de lectura opcional (DATABASE_READ_REPLICA_URL) para listados
 *   pesados y reportes que toleran unos segundos de retraso. Sin réplica = `db`.
 *
 * Regla de dependencias: solo los repositorios/servicios de server/modules importan esto.
 */
type Clients = { primary?: PrismaClient; replica?: PrismaClient };
const globalForPrisma = globalThis as unknown as { __certifoxPrisma?: Clients };
const clients: Clients = globalForPrisma.__certifoxPrisma ?? {};

function createClient(url: string): PrismaClient {
  return new PrismaClient({
    datasourceUrl: url,
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db: PrismaClient = (clients.primary ??= createClient(env.DATABASE_URL));
export const dbRead: PrismaClient = env.DATABASE_READ_REPLICA_URL
  ? (clients.replica ??= createClient(env.DATABASE_READ_REPLICA_URL))
  : db;

if (env.NODE_ENV !== "production") globalForPrisma.__certifoxPrisma = clients;

/** Cliente dentro de una transacción interactiva. */
export type Tx = Prisma.TransactionClient;
/** Acepta tanto el cliente raíz como uno transaccional. */
export type DbClient = PrismaClient | Tx;

/**
 * Ejecuta `fn` en una transacción. Nivel ReadCommitted por defecto (el de Postgres);
 * las transiciones de estado se protegen con `updateMany where status = ...`.
 */
export function transaction<T>(fn: (tx: Tx) => Promise<T>, opts?: { timeoutMs?: number }): Promise<T> {
  return db.$transaction(fn, { timeout: opts?.timeoutMs ?? 10_000, maxWait: 5_000 });
}
