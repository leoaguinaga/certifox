import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { generatePresignedUploadUrl } from "@/server/services/storage.service";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado. Debe iniciar sesión para subir archivos." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, mimeType, sizeBytes } = body;

    if (!type || !mimeType || typeof sizeBytes !== "number") {
      return NextResponse.json(
        { error: "Parámetros incompletos (type, mimeType, sizeBytes son requeridos)." },
        { status: 400 }
      );
    }

    const response = await generatePresignedUploadUrl({
      type,
      mimeType,
      sizeBytes,
    });

    return NextResponse.json(response);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || "Error al generar URL prefirmada." },
      { status: 400 }
    );
  }
}
