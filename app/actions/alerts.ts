"use server";

import { sendCertificateAlertEmail } from "@/lib/mailer";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function sendTestEmailAction(companySlug: string) {
    try {
        const company = await db.company.findUnique({
            where: { slug: companySlug }
        });

        if (!company) {
            return { error: "Empresa no encontrada." };
        }

        if (!company.email) {
            return { error: "La empresa no tiene un correo configurado en sus Ajustes Generales." };
        }

        const now = new Date();
        const expirationDate = new Date(now);
        expirationDate.setDate(now.getDate() + 15);

        const success = await sendCertificateAlertEmail({
            to: company.email,
            companyName: company.name,
            workerName: "Trabajador de Prueba",
            certificateTypeName: "Certificado de Prueba del Sistema",
            expirationDate,
            alertType: "WARNING"
        });

        if (success) {
            return { success: true, message: `Correo de prueba enviado a ${company.email}` };
        } else {
            return { error: "Error de configuración de correo. Verifica la terminal del servidor para más detalles." };
        }

    } catch (error: any) {
        console.error("Error sending test email:", error);
        return { error: "Error interno procesando el envío de prueba." };
    }
}
