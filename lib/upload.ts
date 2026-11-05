/**
 * Subida directa del navegador a Cloudflare R2 (3 pasos):
 *  1. POST /api/upload/presigned → registra el archivo y devuelve URL prefirmada
 *  2. PUT directo a R2 (el archivo nunca pasa por el servidor de la app)
 *  3. POST /api/upload/confirm   → el servidor verifica el objeto y lo marca READY
 * Devuelve el `fileId` que luego se envía a la Server Action (portada, avatar, etc.).
 */
export type UploadKind =
  | "COURSE_COVER"
  | "USER_AVATAR"
  | "ORGANIZATION_LOGO"
  | "LESSON_VIDEO"
  | "LESSON_RESOURCE"
  | "SUBMISSION_ATTACHMENT";

export interface UploadOptions {
  kind: UploadKind;
  file: File;
}

async function errorMessage(res: Response, fallback: string): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return data.error || fallback;
}

export async function uploadFile({ kind, file }: UploadOptions): Promise<{ fileId: string; url: string | null }> {
  const presigned = await fetch("/api/upload/presigned", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, mimeType: file.type, sizeBytes: file.size, originalName: file.name }),
  });
  if (!presigned.ok) throw new Error(await errorMessage(presigned, "No se pudo autorizar la subida del archivo."));
  const { fileId, uploadUrl } = (await presigned.json()) as { fileId: string; uploadUrl: string };

  const put = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!put.ok) throw new Error("Error al transmitir el archivo al almacenamiento.");

  const confirm = await fetch("/api/upload/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileId }),
  });
  if (!confirm.ok) throw new Error(await errorMessage(confirm, "No se pudo verificar el archivo subido."));
  return (await confirm.json()) as { fileId: string; url: string | null };
}
