import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/server/core/request-context";
import { handleRouteError } from "@/server/core/http";
import { confirmUpload } from "@/server/modules/files/files.service";

/** Paso 3 de la subida directa: verifica el objeto en R2 y marca el archivo como READY. */
export async function POST(req: Request) {
  try {
    const ctx = await requireUser();
    const { fileId } = z.object({ fileId: z.string().min(1).max(64) }).parse(await req.json());
    return NextResponse.json(await confirmUpload(ctx, fileId), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return handleRouteError(err);
  }
}
