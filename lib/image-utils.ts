/**
 * AC-24: Sanitizador defensivo para evitar carga de dominios de terceros en Next/Image.
 */
export function sanitizeMediaUrl(
  url: string | null | undefined,
  fallback: string = "/images/courses/course-default.svg"
): string {
  if (!url || typeof url !== "string") {
    return fallback;
  }

  // Si proviene de dominios externos no permitidos, reemplazar por asset local
  if (
    url.includes("googleusercontent.com") ||
    url.includes("unsplash.com")
  ) {
    if (fallback.includes("avatar")) {
      return "/images/avatars/default.svg";
    }
    return "/images/courses/course-default.svg";
  }

  return url;
}
