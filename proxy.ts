import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (Next.js 16):
 *  1. Asigna un x-request-id a cada request (correlación de logs de punta a punta).
 *  2. Redirección optimista de /campus sin cookie de sesión (solo UX).
 * La barrera real de seguridad está en server/core/policies.ts.
 */
export function proxy(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/campus")) {
    const hasSession =
      request.cookies.has("better-auth.session_token") || request.cookies.has("__Secure-better-auth.session_token");
    if (!hasSession) {
      const loginUrl = new URL("/ingresar", request.url);
      loginUrl.searchParams.set("from", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.headers.set("x-request-id", requestId);
      return res;
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("x-request-id", requestId);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
