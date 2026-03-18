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

// Company Document (no-worker document)
export async function addCompanyDocument(companySlug: string, formData: FormData) {
    try {
        const certificateTypeId = formData.get("certificateTypeId") as string;
        const label = formData.get("label") as string;
        const issueDateStr = formData.get("issueDate") as string;
        const expirationDateStr = formData.get("expirationDate") as string;
        const notificationDaysStr = formData.get("notificationDaysBefore") as string;

        if (!certificateTypeId || !label || !issueDateStr || !expirationDateStr) {
            return { error: "Faltan campos requeridos." };
        }

        const company = await db.company.findUnique({ where: { slug: companySlug } });
        if (!company) return { error: "Empresa no encontrada." };

        const issueDate = new Date(issueDateStr);
        const expirationDate = new Date(expirationDateStr);
        const notificationDaysBefore = notificationDaysStr ? parseInt(notificationDaysStr) : 15;

        await db.companyDocument.create({
            data: {
                certificateTypeId,
                label,
                issueDate,
                expirationDate,
                notificationDaysBefore,
                companyId: company.id,
            }
        });

        revalidatePath(`/${companySlug}/certificates`);
        return { success: true };
    } catch (error: any) {
        console.error("Error adding company document:", error);
        return { error: "Ocurrió un error al guardar el documento." };
    }
}

// Bulk Certificates
interface BulkCertificateRow {
    workerId: string;
    certificateTypeId: string;
    issueDate: string;
    expirationDate: string;
}

export async function addBulkCertificates(companySlug: string, certificates: BulkCertificateRow[]) {
    try {
        if (!certificates || certificates.length === 0) {
            return { error: "No se proporcionaron certificados." };
        }

        const company = await db.company.findUnique({ where: { slug: companySlug } });
        if (!company) return { error: "Empresa no encontrada." };

        // Validate all rows
        const errors: string[] = [];
        certificates.forEach((c, i) => {
            if (!c.workerId || !c.certificateTypeId || !c.issueDate || !c.expirationDate) {
                errors.push(`Fila ${i + 1}: todos los campos son requeridos.`);
            }
        });

        if (errors.length > 0) {
            return { error: errors.join(" ") };
        }

        // Use a transaction to create all atomically
        await db.$transaction(
            certificates.map(c =>
                db.certificate.create({
                    data: {
                        workerId: c.workerId,
                        certificateTypeId: c.certificateTypeId,
                        issueDate: new Date(c.issueDate),
                        expirationDate: new Date(c.expirationDate),
                        notificationDaysBefore: company.defaultNotificationDays,
                    }
                })
            )
        );

        revalidatePath(`/${companySlug}/certificates`);
        return { success: true, count: certificates.length };
    } catch (error: any) {
        console.error("Error adding bulk certificates:", error);
        return { error: "Ocurrió un error al guardar los certificados." };
    }
}

