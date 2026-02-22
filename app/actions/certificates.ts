"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addCertificate(companySlug: string, formData: FormData) {
    try {
        const workerId = formData.get("workerId") as string;
        const certificateTypeId = formData.get("certificateTypeId") as string;
        const issueDateStr = formData.get("issueDate") as string;
        const expirationDateStr = formData.get("expirationDate") as string;
        const notificationDaysStr = formData.get("notificationDaysBefore") as string;

        if (!workerId || !certificateTypeId || !issueDateStr || !expirationDateStr) {
            return { error: "Faltan campos requeridos." };
        }

        const issueDate = new Date(issueDateStr);
        const expirationDate = new Date(expirationDateStr);
        const notificationDaysBefore = notificationDaysStr ? parseInt(notificationDaysStr) : 15;

        await db.certificate.create({
            data: {
                workerId,
                certificateTypeId,
                issueDate,
                expirationDate,
                notificationDaysBefore,
            }
        });

        revalidatePath(`/${companySlug}/certificates`);
        revalidatePath(`/${companySlug}/workers/${workerId}`);

        return { success: true };
    } catch (error: any) {
        console.error("Error adding certificate:", error);
        return { error: "Ocurrió un error al guardar el certificado." };
    }
}
