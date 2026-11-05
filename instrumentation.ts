import type { Instrumentation } from "next";

/**
 * O2: todo error de servidor no capturado (render, route handler, action) se registra
 * como JSON estructurado con su digest y el x-request-id. Un log drain de Vercel
 * (Axiom, Datadog, Better Stack, Sentry) lo convierte en alertas sin cambiar código.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const error = err as Error & { digest?: string };
  const headers = request.headers as Record<string, string | string[] | undefined>;
  console.error(
    JSON.stringify({
      level: "error",
      time: new Date().toISOString(),
      service: "certifox",
      msg: "request.unhandled_error",
      errName: error?.name,
      errMessage: error?.message,
      digest: error?.digest,
      errStack: error?.stack?.split("\n").slice(0, 8).join("\n"),
      method: request.method,
      path: request.path,
      requestId: headers["x-request-id"],
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
    })
  );
};
