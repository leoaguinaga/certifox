import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || !session.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const user = session.user as Record<string, unknown>;
        if (!user.companyId || typeof user.companyId !== "string") {
            return NextResponse.json({ error: "Usuario sin empresa asignada" }, { status: 400 });
        }

        const company = await db.company.findUnique({
            where: { id: user.companyId },
            select: { slug: true }
        });

        if (!company) {
            return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
        }

        return NextResponse.json({ slug: company.slug });

    } catch (error) {
        console.error("Error fetching company slug:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
