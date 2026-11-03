import "server-only";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { env } from "@/lib/env";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB (AC-20)

export interface PresignedUploadRequest {
  type: "cover" | "avatar";
  mimeType: string;
  sizeBytes: number;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
  expiresInSeconds: number;
}

function getExtensionFromMime(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      throw new Error(`Tipo de archivo no permitido: ${mimeType}`);
  }
}

/**
 * Valida los parámetros del archivo antes de generar la subida a Cloudflare R2 (AC-20).
 */
export function validateUploadParams(request: PresignedUploadRequest): void {
  if (!ALLOWED_MIME_TYPES.includes(request.mimeType as AllowedMimeType)) {
    throw new Error(
      `Tipo MIME inválido '${request.mimeType}'. Solo se admiten formatos JPEG, PNG y WEBP.`
    );
  }

  if (request.sizeBytes <= 0) {
    throw new Error("El archivo no puede estar vacío.");
  }

  if (request.sizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `El archivo excede el tamaño máximo permitido de 2 MB (recibido: ${(request.sizeBytes / 1024 / 1024).toFixed(2)} MB).`
    );
  }
}

/**
 * Cliente S3 configurado para Cloudflare R2.
 */
function getR2Client(): S3Client | null {
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Genera una URL prefirmada segura para subir archivos directamente a R2 (AC-20).
 * El nombre del archivo es generado criptográficamente en el servidor para evitar colisiones y path traversal.
 */
export async function generatePresignedUploadUrl(
  request: PresignedUploadRequest
): Promise<PresignedUploadResponse> {
  validateUploadParams(request);

  const ext = getExtensionFromMime(request.mimeType);
  const folder = request.type === "cover" ? "covers" : "avatars";
  const fileKey = `${folder}/${randomUUID()}.${ext}`;
  const expiresInSeconds = 300; // 5 minutos

  const r2Client = getR2Client();

  if (r2Client) {
    const bucket = env.R2_BUCKET || "certifox-media";
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileKey,
      ContentType: request.mimeType,
      ContentLength: request.sizeBytes,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, {
      expiresIn: expiresInSeconds,
    });

    const publicUrl = `${env.NEXT_PUBLIC_MEDIA_URL.replace(/\/$/, "")}/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
      publicUrl,
      expiresInSeconds,
    };
  }

  // Modo local de desarrollo sin credenciales R2
  const localUploadUrl = `/api/upload/local?key=${encodeURIComponent(fileKey)}`;
  const publicUrl = `/images/${folder === "covers" ? "courses/course-default.svg" : "avatars/default.svg"}`;

  return {
    uploadUrl: localUploadUrl,
    fileKey,
    publicUrl,
    expiresInSeconds,
  };
}
