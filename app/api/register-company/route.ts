import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { companyName, companyRuc, companySlug, plan, adminEmail } = body;

        if (!companyName || !companySlug || !adminEmail) {
            return NextResponse.json(
                { error: "Faltan campos obligatorios" },
                { status: 400 }
            );
        }

        // 1. Verify if user email already exists (prevent creating company if user can't be registered later)
        const existingUser = await db.user.findUnique({
            where: { email: adminEmail }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "El correo del administrador ya está registrado" },
                { status: 400 }
            );
        }

        // 2. Verify if company slug already exists
        const existingCompany = await db.company.findUnique({
            where: { slug: companySlug }
        });

        if (existingCompany) {
            return NextResponse.json(
                { error: "El URL de empresa ya no está disponible, elige otro" },
                { status: 400 }
            );
        }

        // 3. Create the company
        const company = await db.company.create({
            data: {
                name: companyName,
                slug: companySlug,
                ruc: companyRuc || null,
                email: adminEmail,
                plan: plan || "STARTER"
            }
        });

        return NextResponse.json({ companyId: company.id }, { status: 201 });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error creating company:", error.message);
        } else {
            console.error("Unknown error creating company:", error);
        }
        return NextResponse.json(
            { error: "Ha ocurrido un error al crear la empresa" },
            { status: 500 }
        );
    }
}
