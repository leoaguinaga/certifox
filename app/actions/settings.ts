"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function updateCompanyGeneral(companySlug: string, formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        return { error: "No autorizado" };
    }

    const name = formData.get("name") as string;
    const ruc = formData.get("ruc") as string;
    const email = formData.get("email") as string;

    if (!name || !email) {
        return { error: "El nombre y el correo son requeridos." };
    }

    try {
        await db.company.update({
            where: { slug: companySlug },
            data: {
                name,
                ruc: ruc || null,
                email
            }
        });

        revalidatePath(`/${companySlug}/settings`);
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar empresa:", error);
        return { error: "Ocurrió un error al actualizar los datos de la empresa." };
    }
}

export async function addCertificateType(companySlug: string, name: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        return { error: "No autorizado" };
    }

    try {
        const company = await db.company.findUnique({ where: { slug: companySlug } });
        if (!company) return { error: "Empresa no encontrada." };

        await db.certificateType.create({
            data: {
                name,
                companyId: company.id
            }
        });

        revalidatePath(`/${companySlug}/settings`);
        return { success: true };
    } catch (error) {
        if ((error as any).code === "P2002") {
            return { error: "Este tipo de certificado ya existe en la empresa." };
        }
        return { error: "Ocurrió un error al guardar el tipo de certificado." };
    }
}

export async function removeCertificateType(companySlug: string, id: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        return { error: "No autorizado" };
    }

    try {
        await db.certificateType.delete({
            where: { id }
        });

        revalidatePath(`/${companySlug}/settings`);
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar tipo de certificado:", error);
        return { error: "Ocurrió un error al eliminar el tipo de certificado. Asegúrate de que no esté en uso." };
    }
}
