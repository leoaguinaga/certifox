"use server";

import { db } from "@/lib/db";

export async function globalSearchAction(companySlug: string, query: string) {
    if (!query || query.length < 2) {
        return { workers: [], certificates: [] };
    }

    try {
        const company = await db.company.findUnique({
            where: { slug: companySlug },
            select: { id: true, defaultNotificationDays: true }
        });

        if (!company) {
            return { workers: [], certificates: [] };
        }

        // Search Workers by name or DNI
        const workers = await db.worker.findMany({
            where: {
                companyId: company.id,
                isActive: true,
                OR: [
                    { fullName: { contains: query, mode: "insensitive" } },
                    { dni: { contains: query, mode: "insensitive" } }
                ]
            },
            take: 5,
            select: {
                id: true,
                fullName: true,
                dni: true,
            }
        });

        // Search Certificates by type name or owner name
        const certificatesRaw = await db.certificate.findMany({
            where: {
                isArchived: false,
                worker: { companyId: company.id, isActive: true },
                OR: [
                    { certificateType: { name: { contains: query, mode: "insensitive" } } },
                    { worker: { fullName: { contains: query, mode: "insensitive" } } }
                ]
            },
            take: 5,
            include: {
                worker: { select: { id: true, fullName: true } },
                certificateType: { select: { name: true } }
            }
        });

        const now = new Date();
        const certificates = certificatesRaw.map(cert => {
            const thresholdDays = cert.notificationDaysBefore ?? company.defaultNotificationDays;
            const diffMs = cert.expirationDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            let status: "VALID" | "WARNING" | "EXPIRED" = "VALID";
            if (diffDays <= 0) status = "EXPIRED";
            else if (diffDays <= thresholdDays) status = "WARNING";

            return {
                id: cert.id,
                typeName: cert.certificateType.name,
                workerName: cert.worker.fullName,
                workerId: cert.worker.id,
                status,
                diffDays
            };
        });

        return { workers, certificates };
    } catch (error) {
        console.error("Global search error:", error);
        return { workers: [], certificates: [] };
    }
}
