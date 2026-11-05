import "server-only";
import { forbidden, redirect } from "next/navigation";
import { getRequestContext, type AuthedContext } from "./request-context";
import { campusView } from "./roles";

/** Para Server Components del campus: contexto autenticado o redirección al login. */
export async function campusContext(from: string): Promise<AuthedContext & { view: "INSTRUCTOR" | "STUDENT" }> {
  const ctx = await getRequestContext();
  if (!ctx.user) redirect(`/ingresar?from=${encodeURIComponent(from)}`);
  return Object.assign(ctx as AuthedContext, { view: campusView(ctx) });
}

/** Páginas exclusivas del staff de la organización activa: 403 para el resto (AC-09). */
export async function staffContext(from: string) {
  const ctx = await campusContext(from);
  if (ctx.view !== "INSTRUCTOR") forbidden();
  return ctx;
}

/** Lee `?cursor=` de forma segura para paginación en páginas. */
export function cursorParam(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && /^[a-z0-9]{10,40}$/i.test(v) ? v : undefined;
}
