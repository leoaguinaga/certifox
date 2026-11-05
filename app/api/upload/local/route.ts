import { NextRequest, NextResponse } from "next/server";

/**
 * Solo desarrollo local sin R2: acepta el PUT y descarta los bytes.
 * En producción no existe (404) para que nadie lo confunda con almacenamiento real.
 */
export async function PUT(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  const fileId = req.nextUrl.searchParams.get("fileId");
  if (!fileId) return NextResponse.json({ error: "fileId requerido." }, { status: 400 });
  return NextResponse.json({ success: true, fileId });
}
