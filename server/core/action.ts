import "server-only";
import { z } from "zod";
import { isDomainError, unauthenticated } from "./errors";
import { getRequestContext, type AuthedContext, type RequestContext } from "./request-context";
import { enforce, RATE_LIMITS, type RateLimitRule } from "./rate-limit";
import { logger } from "./logger";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string; requestId?: string };

type RateLimitOption = { rule: RateLimitRule; by?: "user" | "ip"; name: string };

interface BaseOptions<S extends z.ZodTypeAny> {
  name: string;
  schema: S;
  /** Por defecto: límite genérico de mutaciones por usuario. `false` lo desactiva. */
  rateLimit?: RateLimitOption | false;
}

interface AuthedOptions<S extends z.ZodTypeAny, T> extends BaseOptions<S> {
  auth?: "user";
  handler: (ctx: AuthedContext, input: z.output<S>) => Promise<T>;
}

interface PublicOptions<S extends z.ZodTypeAny, T> extends BaseOptions<S> {
  auth: "public";
  handler: (ctx: RequestContext, input: z.output<S>) => Promise<T>;
}

/**
 * Pipeline uniforme de toda Server Action:
 *   1. zod.parse(input)            → error VALIDATION con el primer mensaje
 *   2. contexto (sesión memoizada + organización activa + requestId)
 *   3. rate limit distribuido
 *   4. handler (casos de uso de server/modules)
 *   5. DomainError → mensaje al usuario; cualquier otro error → log + mensaje genérico
 *
 * Uso dentro de un archivo "use server":
 *   export async function fooAction(input: FooInput) { return runAction({ ... }, input); }
 */
export async function runAction<S extends z.ZodTypeAny, T>(
  opts: AuthedOptions<S, T> | PublicOptions<S, T>,
  rawInput: unknown
): Promise<ActionResult<T>> {
  const parsed = opts.schema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, code: "VALIDATION", error: parsed.error.issues[0]?.message ?? "Datos no válidos" };
  }

  let ctx: RequestContext | undefined;
  try {
    ctx = await getRequestContext();
    if (opts.auth !== "public" && !ctx.user) throw unauthenticated();

    const limit = opts.rateLimit === undefined ? { rule: RATE_LIMITS.mutation, name: "mutation" } : opts.rateLimit;
    if (limit) {
      const subject = limit.by === "ip" || !ctx.user ? `ip:${ctx.ip}` : `u:${ctx.user.id}`;
      await enforce(`action:${limit.name}:${subject}`, limit.rule);
    }

    const started = Date.now();
    const data = await (opts.handler as (c: RequestContext, i: unknown) => Promise<T>)(ctx, parsed.data);
    ctx.log.info("action.ok", { action: opts.name, ms: Date.now() - started });
    return { success: true, data };
  } catch (err) {
    const log = ctx?.log ?? logger;
    if (isDomainError(err)) {
      log.info("action.rejected", { action: opts.name, code: err.code, msg: err.message });
      return { success: false, code: err.code, error: err.message };
    }
    log.error("action.failed", { action: opts.name, err });
    return {
      success: false,
      code: "INTERNAL",
      error: "Ocurrió un error inesperado. Intenta nuevamente o contacta a soporte.",
      requestId: ctx?.requestId,
    };
  }
}

/** Esquema vacío para acciones sin parámetros. */
export const noInput = z.undefined().or(z.object({}).strict()).optional();
