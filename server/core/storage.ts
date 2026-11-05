import "server-only";
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { FileVisibility } from "@prisma/client";
import { env, features } from "./env";

/**
 * Adaptador de Cloudflare R2 (API S3).
 *
 * Dos buckets, porque un dominio público de R2 expone TODO el bucket:
 *  - R2_BUCKET (PUBLIC): portadas, avatares, logos → NEXT_PUBLIC_MEDIA_URL/<key>
 *  - R2_PRIVATE_BUCKET (PRIVATE): PDFs de certificados, adjuntos → URLs firmadas cortas
 */
let client: S3Client | null = null;

function r2(): S3Client {
  if (!features.r2) throw new Error("R2 no está configurado (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY)");
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env.R2_ACCESS_KEY_ID!, secretAccessKey: env.R2_SECRET_ACCESS_KEY! },
  });
  return client;
}

export function isStorageConfigured(): boolean {
  return features.r2;
}

export function bucketFor(visibility: FileVisibility): string {
  return visibility === "PUBLIC" ? env.R2_BUCKET : env.R2_PRIVATE_BUCKET;
}

export function publicUrlForKey(key: string): string {
  return `${env.NEXT_PUBLIC_MEDIA_URL.replace(/\/$/, "")}/${key}`;
}

export async function presignPut(params: {
  bucket: string;
  key: string;
  contentType: string;
  sizeBytes: number;
  expiresInSeconds?: number;
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: params.bucket,
    Key: params.key,
    ContentType: params.contentType,
    ContentLength: params.sizeBytes,
    CacheControl: "public, max-age=31536000, immutable",
  });
  return getSignedUrl(r2(), command, { expiresIn: params.expiresInSeconds ?? 300 });
}

export async function presignGet(params: {
  bucket: string;
  key: string;
  expiresInSeconds?: number;
  downloadName?: string;
}): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: params.bucket,
    Key: params.key,
    ...(params.downloadName
      ? { ResponseContentDisposition: `inline; filename="${params.downloadName.replace(/"/g, "")}"` }
      : {}),
  });
  return getSignedUrl(r2(), command, { expiresIn: params.expiresInSeconds ?? 120 });
}

export async function headObject(bucket: string, key: string): Promise<{ sizeBytes: number; contentType?: string } | null> {
  try {
    const res = await r2().send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return { sizeBytes: res.ContentLength ?? 0, contentType: res.ContentType };
  } catch (err) {
    const status = (err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    if (status === 404) return null;
    throw err;
  }
}

export async function putObject(params: {
  bucket: string;
  key: string;
  body: Uint8Array;
  contentType: string;
  cacheControl?: string;
}): Promise<void> {
  await r2().send(
    new PutObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: params.cacheControl ?? "private, max-age=0, no-store",
    })
  );
}

export async function deleteObject(bucket: string, key: string): Promise<void> {
  await r2().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
