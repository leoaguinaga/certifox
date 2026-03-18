import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const { type, value } = await request.json();

        if (!type || !value) {
            return NextResponse.json({ available: false, error: "Missing parameters" }, { status: 400 });
        }

        if (type === "email") {
            const existing = await db.user.findUnique({ where: { email: value } });
            return NextResponse.json({ available: !existing });
        }

        if (type === "slug") {
            const existing = await db.company.findUnique({ where: { slug: value } });
            return NextResponse.json({ available: !existing });
        }

        return NextResponse.json({ available: false, error: "Invalid type" }, { status: 400 });
    } catch (error) {
        console.error("Check availability error:", error);
        return NextResponse.json({ available: false, error: "Server error" }, { status: 500 });
    }
}
