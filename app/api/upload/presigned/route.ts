import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/server/core/request-context";
import { enforce, RATE_LIMITS } from "@/server/core/rate-limit";
import { handleRouteError } from "@/server/core/http";
import { requestUpload } from "@/server/modules/files/files.service";

const LEGACY_KIND = { cover: "COURSE_COVER", avatar: "USER_AVATAR" } as const;

const bodySchema = z
  .object({
    kind: z
      .enum(["COURSE_COVER", "USER_AVATAR", "ORGANIZATION_LOGO", "LESSON_VIDEO", "LESSON_RESOURCE", "SUBMISSION_ATTACHMENT"])
      .optional(),
    type: z.enum(["cover", "avatar"]).optional(),
    mimeType: z.string().min(3).max(100),
    sizeBytes: z.number().int().positive(),
    originalName: z.string().max(200).optional(),
  })
  .refine((b) => b.kind || b.type, "Debe indicar el tipo de archivo (kind)");

/** Paso 1 de la subida directa a R2: registra el archivo y devuelve la URL prefirmada. */
export async function POST(req: Request) {
  try {
    const ctx = await requireUser();
    await enforce(`upload:${ctx.user.id}`, RATE_LIMITS.uploadPresign);
    const body = bodySchema.parse(await req.json());
    const ticket = await requestUpload(ctx, {
      kind: body.kind ?? LEGACY_KIND[body.type!],
      mimeType: body.mimeType,
      sizeBytes: body.sizeBytes,
      originalName: body.originalName,
    });
    return NextResponse.json(ticket, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return handleRouteError(err);
  }
}
