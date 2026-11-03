import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  // En desarrollo local sin Cloudflare R2, aceptamos la subida de bytes y respondemos 200 OK
  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "Key requerida." }, { status: 400 });
  }

  return NextResponse.json({ success: true, key });
}
