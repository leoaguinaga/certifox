import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isDomainError } from "./errors";
import { logger } from "./logger";

/** Traduce errores a respuestas HTTP para Route Handlers (mismo criterio que runAction). */
export function handleRouteError(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    return NextResponse.json({ error: err.issues[0]?.message ?? "Datos no válidos", code: "VALIDATION" }, { status: 400 });
  }
  if (isDomainError(err)) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
  }
  logger.error("route.failed", { err });
  return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 });
}
