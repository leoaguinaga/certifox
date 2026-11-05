import "server-only";
import { randomUUID } from "node:crypto";
import type { File as FileRow, FileKind, FileVisibility } from "@prisma/client";
import { db, type DbClient } from "@/server/core/db";
import { env } from "@/server/core/env";
import { forbidden, invalid, notFound, preconditionFailed } from "@/server/core/errors";
import { assertAuthenticated, assertStaff } from "@/server/core/policies";
import type { AuthedContext } from "@/server/core/request-context";
import {
  bucketFor,
  headObject,
  isStorageConfigured,
  presignGet,
  presignPut,
  publicUrlForKey,
} from "@/server/core/storage";
import { enqueue } from "@/server/core/outbox";

/**
 * Archivos en Cloudflare R2. Flujo de subida directa desde el navegador:
 *   1. requestUpload  → crea fila File (PENDING) + URL prefirmada PUT (5 min)
 *   2. navegador PUT  → R2
 *   3. confirmUpload  → HEAD en R2 (tamaño/tipo reales) → READY
 *   4. el caso de uso que lo usa (portada, avatar…) valida con `claimReadyFile`
 * Los PENDING abandonados se limpian con el cron (cleanupAbandonedUploads).
 */

interface KindRule {
  visibility: FileVisibility;
  folder: string;
  maxBytes: number;
  mime: readonly string[];
  staffOnly: boolean;
}

const IMAGE = ["image/jpeg", "image/png", "image/webp"] as const;
const MB = 1024 * 1024;

export const FILE_RULES: Record<FileKind, KindRule> = {
  COURSE_COVER: { visibility: "PUBLIC", folder: "covers", maxBytes: 2 * MB, mime: IMAGE, staffOnly: true },
  ORGANIZATION_LOGO: { visibility: "PUBLIC", folder: "logos", maxBytes: 1 * MB, mime: [...IMAGE, "image/svg+xml"], staffOnly: true },
  USER_AVATAR: { visibility: "PUBLIC", folder: "avatars", maxBytes: 2 * MB, mime: IMAGE, staffOnly: false },
  LESSON_VIDEO: { visibility: "PRIVATE", folder: "videos", maxBytes: 2048 * MB, mime: ["video/mp4", "video/webm"], staffOnly: true },
  LESSON_RESOURCE: {
    visibility: "PRIVATE",
    folder: "resources",
    maxBytes: 50 * MB,
    mime: ["application/pdf", "application/zip", ...IMAGE],
    staffOnly: true,
  },
  SUBMISSION_ATTACHMENT: {
    visibility: "PRIVATE",
    folder: "submissions",
    maxBytes: 10 * MB,
    mime: ["application/pdf", ...IMAGE],
    staffOnly: false,
  },
  // Solo lo genera el sistema (worker de certificados).
  CERTIFICATE_PDF: { visibility: "PRIVATE", folder: "certificates", maxBytes: 5 * MB, mime: ["application/pdf"], staffOnly: true },
};

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "application/pdf": "pdf",
  "application/zip": "zip",
};

export function validateUpload(kind: FileKind, mimeType: string, sizeBytes: number): KindRule {
  const rule = FILE_RULES[kind];
  if (kind === "CERTIFICATE_PDF") throw forbidden("Este tipo de archivo solo lo genera el sistema");
  if (!rule.mime.includes(mimeType)) {
    throw invalid(`Formato no permitido (${mimeType}). Se aceptan: ${rule.mime.join(", ")}`);
  }
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) throw invalid("El archivo no puede estar vacío.");
  if (sizeBytes > rule.maxBytes) {
    throw invalid(
      `El archivo excede el tamaño máximo de ${(rule.maxBytes / MB).toFixed(0)} MB (recibido: ${(sizeBytes / MB).toFixed(2)} MB).`
    );
  }
  return rule;
}

export function buildObjectKey(kind: FileKind, mimeType: string, scope: { organizationId: string | null; userId: string }) {
  const rule = FILE_RULES[kind];
  const owner = scope.organizationId ? `org/${scope.organizationId}` : `user/${scope.userId}`;
  return `${owner}/${rule.folder}/${randomUUID()}.${EXT[mimeType] ?? "bin"}`;
}

export interface UploadTicket {
  fileId: string;
  uploadUrl: string;
  /** URL definitiva si el archivo es público; null para privados. */
  publicUrl: string | null;
  expiresInSeconds: number;
}

export async function requestUpload(
  ctx: AuthedContext,
  input: { kind: FileKind; mimeType: string; sizeBytes: number; originalName?: string }
): Promise<UploadTicket> {
  assertAuthenticated(ctx);
  const rule = validateUpload(input.kind, input.mimeType, input.sizeBytes);
  const organizationId = rule.staffOnly ? assertStaff(ctx).organizationId : null;

  if (!isStorageConfigured() && env.NODE_ENV === "production") {
    throw preconditionFailed("El almacenamiento de archivos no está configurado.");
  }

  const key = buildObjectKey(input.kind, input.mimeType, { organizationId, userId: ctx.user.id });
  const bucket = bucketFor(rule.visibility);
  const expiresInSeconds = 300;

  const file = await db.file.create({
    data: {
      kind: input.kind,
      visibility: rule.visibility,
      status: "PENDING",
      bucket,
      key,
      contentType: input.mimeType,
      sizeBytes: input.sizeBytes,
      originalName: input.originalName?.slice(0, 200),
      organizationId,
      uploadedById: ctx.user.id,
    },
  });

  const uploadUrl = isStorageConfigured()
    ? await presignPut({ bucket, key, contentType: input.mimeType, sizeBytes: input.sizeBytes, expiresInSeconds })
    : `/api/upload/local?fileId=${encodeURIComponent(file.id)}`;

  return {
    fileId: file.id,
    uploadUrl,
    publicUrl: rule.visibility === "PUBLIC" ? fileUrl(file) : null,
    expiresInSeconds,
  };
}

export async function confirmUpload(ctx: AuthedContext, fileId: string): Promise<{ fileId: string; url: string | null }> {
  const file = await db.file.findUnique({ where: { id: fileId } });
  if (!file || file.uploadedById !== ctx.user.id) throw notFound("Archivo no encontrado");
  if (file.status === "READY") return { fileId: file.id, url: fileUrl(file) };
  if (file.status !== "PENDING") throw preconditionFailed("El archivo ya no está disponible");

  if (isStorageConfigured()) {
    const head = await headObject(file.bucket, file.key);
    if (!head) throw preconditionFailed("La subida no se completó. Vuelve a intentarlo.");
    const rule = FILE_RULES[file.kind];
    if (head.sizeBytes > rule.maxBytes) throw invalid("El archivo subido excede el tamaño permitido.");
    if (head.contentType && head.contentType !== file.contentType) throw invalid("El tipo de archivo subido no coincide.");
    file.sizeBytes = head.sizeBytes;
  }

  const ready = await db.file.update({
    where: { id: file.id },
    data: { status: "READY", sizeBytes: file.sizeBytes },
  });
  return { fileId: ready.id, url: fileUrl(ready) };
}

/**
 * Verifica que un archivo pueda asociarse a una entidad: READY, del tipo esperado y
 * subido por el usuario actual (o de su organización si es de staff).
 */
export async function claimReadyFile(
  client: DbClient,
  ctx: AuthedContext,
  fileId: string,
  kind: FileKind
): Promise<FileRow> {
  const file = await client.file.findUnique({ where: { id: fileId } });
  if (!file || file.kind !== kind || file.status !== "READY") throw invalid("El archivo no es válido o no terminó de subirse");
  const sameUploader = file.uploadedById === ctx.user.id;
  const sameOrg = file.organizationId !== null && file.organizationId === ctx.organization?.id;
  if (!sameUploader && !sameOrg) throw forbidden("No puedes usar este archivo");
  return file;
}

/** Programa el borrado de un archivo reemplazado (fuera de la transacción del request). */
export async function scheduleFileDeletion(client: DbClient, fileId: string | null | undefined) {
  if (!fileId) return;
  await client.file.update({ where: { id: fileId }, data: { status: "DELETED", deletedAt: new Date() } });
  await enqueue(client, "file.delete", { fileId });
}

/** URL pública (CDN) o null si el archivo es privado. */
export function fileUrl(file: Pick<FileRow, "key" | "visibility"> | null | undefined): string | null {
  if (!file) return null;
  if (file.visibility !== "PUBLIC") return null;
  if (!isStorageConfigured() && env.NODE_ENV !== "production") return null; // modo local: la UI usa placeholders
  return publicUrlForKey(file.key);
}

export async function signedFileUrl(
  file: Pick<FileRow, "bucket" | "key">,
  opts: { expiresInSeconds?: number; downloadName?: string } = {}
): Promise<string> {
  return presignGet({ bucket: file.bucket, key: file.key, ...opts });
}

export async function cleanupAbandonedUploads(olderThanHours = 24): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanHours * 3600 * 1000);
  const stale = await db.file.findMany({
    where: { status: "PENDING", createdAt: { lt: cutoff } },
    select: { id: true },
    take: 500,
  });
  for (const f of stale) {
    await db.$transaction(async (tx) => scheduleFileDeletion(tx, f.id));
  }
  return stale.length;
}
