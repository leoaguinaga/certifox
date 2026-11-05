/**
 * Errores de dominio. Solo estos se muestran al usuario; cualquier otro error se
 * registra con su requestId y el cliente recibe un mensaje genérico.
 */
export type DomainErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "PRECONDITION_FAILED";

const STATUS_BY_CODE: Record<DomainErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION: 400,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  PRECONDITION_FAILED: 412,
};

export class DomainError extends Error {
  readonly code: DomainErrorCode;
  readonly statusCode: number;

  constructor(code: DomainErrorCode, message: string) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.statusCode = STATUS_BY_CODE[code];
  }
}

export class AuthorizationError extends DomainError {
  constructor(message = "No autorizado para realizar esta acción", code: "UNAUTHENTICATED" | "FORBIDDEN" = "FORBIDDEN") {
    super(code, message);
    this.name = "AuthorizationError";
  }
}

export const unauthenticated = (msg = "Debes iniciar sesión para continuar") =>
  new AuthorizationError(msg, "UNAUTHENTICATED");
export const forbidden = (msg = "No tienes permiso para realizar esta acción") => new AuthorizationError(msg, "FORBIDDEN");
export const notFound = (msg = "Recurso no encontrado") => new DomainError("NOT_FOUND", msg);
export const invalid = (msg: string) => new DomainError("VALIDATION", msg);
export const conflict = (msg: string) => new DomainError("CONFLICT", msg);
export const preconditionFailed = (msg: string) => new DomainError("PRECONDITION_FAILED", msg);
export const rateLimited = (msg = "Demasiadas solicitudes. Intenta nuevamente en unos segundos.") =>
  new DomainError("RATE_LIMITED", msg);

export function isDomainError(err: unknown): err is DomainError {
  return err instanceof DomainError;
}

/** Violación de restricción única de Prisma (P2002). */
export function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === "P2002";
}
