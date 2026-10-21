import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy en Next.js 16 para redirecciones optimistas de UX.
 * IMPORTANTE (Regla A1): Este proxy solo redirige por UX;
 * la verdadera barrera de seguridad reside en server/policies.ts.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  // Si intenta entrar al campus sin cookie de sesión, redirige al login
  if (pathname.startsWith("/campus")) {
    if (!sessionCookie) {
      const loginUrl = new URL("/ingresar", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Si ya tiene sesión e intenta entrar a /ingresar, redirige a /campus
  if (pathname === "/ingresar" && sessionCookie) {
    return NextResponse.redirect(new URL("/campus", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/campus/:path*", "/ingresar"],
};
