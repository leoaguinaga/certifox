import "server-only";

/**
 * Logger estructurado (JSON por línea). Vercel/Neon/Cloudflare lo indexan tal cual
 * y cualquier log drain (Axiom, Datadog, Better Stack) lo consume sin parsers.
 */
type Level = "debug" | "info" | "warn" | "error";
const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const minLevel: Level = (process.env.LOG_LEVEL as Level) || (process.env.NODE_ENV === "production" ? "info" : "debug");

export type LogFields = Record<string, unknown>;

function serializeError(err: unknown): LogFields {
  if (err instanceof Error) {
    const extra = err as unknown as { code?: unknown; digest?: unknown };
    return {
      errName: err.name,
      errMessage: err.message,
      errStack: err.stack?.split("\n").slice(0, 8).join("\n"),
      ...(typeof extra.code === "string" ? { errCode: extra.code } : {}),
      ...(typeof extra.digest === "string" ? { digest: extra.digest } : {}),
    };
  }
  return { errMessage: String(err) };
}

function write(level: Level, msg: string, fields?: LogFields) {
  if (ORDER[level] < ORDER[minLevel]) return;
  const { err, ...rest } = fields ?? {};
  const line = JSON.stringify({
    level,
    time: new Date().toISOString(),
    msg,
    ...rest,
    ...(err !== undefined ? serializeError(err) : {}),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export interface Logger {
  debug(msg: string, fields?: LogFields): void;
  info(msg: string, fields?: LogFields): void;
  warn(msg: string, fields?: LogFields): void;
  error(msg: string, fields?: LogFields): void;
  child(bindings: LogFields): Logger;
}

function create(bindings: LogFields = {}): Logger {
  const merge = (f?: LogFields) => ({ ...bindings, ...f });
  return {
    debug: (m, f) => write("debug", m, merge(f)),
    info: (m, f) => write("info", m, merge(f)),
    warn: (m, f) => write("warn", m, merge(f)),
    error: (m, f) => write("error", m, merge(f)),
    child: (b) => create({ ...bindings, ...b }),
  };
}

export const logger = create({ service: "certifox" });
