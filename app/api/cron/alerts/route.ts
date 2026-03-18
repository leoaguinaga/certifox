import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendCertificateAlertEmail, sendCompanyDocumentAlertEmail } from "@/lib/mailer";

// Securing the CRON endpoint via a secret passed by Vercel / External caller
const CRON_SECRET = process.env.CRON_SECRET || "local-cron-secret";

export async function GET(request: Request) {
    // 1. Verify Authorization
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}` && process.env.NODE_ENV !== "development") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const now = new Date();
        let newWarningsSent = 0;
        let newExpiredSent = 0;

        // ===== WORKER CERTIFICATES =====
        const activeCertificates = await db.certificate.findMany({
            where: {
                isArchived: false,
                worker: {
                    isActive: true,
                    company: { isActive: true }
                }
            },
            include: {
                worker: {
                    include: { company: true }
                },
                certificateType: true,
                notificationLogs: {
                    where: { channel: "EMAIL", success: true }
                }
            }
        });

        for (const cert of activeCertificates) {
            const company = cert.worker.company;
            const thresholdDays = cert.notificationDaysBefore ?? company.defaultNotificationDays;
            const diffMs = cert.expirationDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            let currentStatus: "WARNING" | "EXPIRED" | "VALID" = "VALID";
            if (diffDays <= 0) {
                currentStatus = "EXPIRED";
            } else if (diffDays <= thresholdDays) {
                currentStatus = "WARNING";
            } else {
                continue;
            }

            const hasSentWarning = cert.notificationLogs.some(log => log.type === "WARNING");
            const hasSentExpired = cert.notificationLogs.some(log => log.type === "EXPIRED");

            if (currentStatus === "WARNING" && hasSentWarning) continue;
            if (currentStatus === "EXPIRED" && hasSentExpired) continue;

            const emailSuccess = await sendCertificateAlertEmail({
                to: company.email,
                companyName: company.name,
                workerName: cert.worker.fullName,
                certificateTypeName: cert.certificateType.name,
                expirationDate: cert.expirationDate,
                alertType: currentStatus,
            });

            await db.notificationLog.create({
                data: {
                    certificateId: cert.id,
                    channel: "EMAIL",
                    type: currentStatus,
                    success: emailSuccess,
                }
            });

            if (emailSuccess) {
                if (currentStatus === "WARNING") newWarningsSent++;
                if (currentStatus === "EXPIRED") newExpiredSent++;
            }
        }

        // ===== COMPANY DOCUMENTS =====
        const activeDocuments = await db.companyDocument.findMany({
            where: {
                isArchived: false,
                company: { isActive: true }
            },
            include: {
                company: true,
                certificateType: true,
                notificationLogs: {
                    where: { channel: "EMAIL", success: true }
                }
            }
        });

        for (const doc of activeDocuments) {
            const company = doc.company;
            const thresholdDays = doc.notificationDaysBefore ?? company.defaultNotificationDays;
            const diffMs = doc.expirationDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            let currentStatus: "WARNING" | "EXPIRED" | "VALID" = "VALID";
            if (diffDays <= 0) {
                currentStatus = "EXPIRED";
            } else if (diffDays <= thresholdDays) {
                currentStatus = "WARNING";
            } else {
                continue;
            }

            const hasSentWarning = doc.notificationLogs.some(log => log.type === "WARNING");
            const hasSentExpired = doc.notificationLogs.some(log => log.type === "EXPIRED");

            if (currentStatus === "WARNING" && hasSentWarning) continue;
            if (currentStatus === "EXPIRED" && hasSentExpired) continue;

            const emailSuccess = await sendCompanyDocumentAlertEmail({
                to: company.email,
                companyName: company.name,
                documentLabel: doc.label,
                certificateTypeName: doc.certificateType.name,
                expirationDate: doc.expirationDate,
                alertType: currentStatus,
            });

            await db.notificationLog.create({
                data: {
                    companyDocumentId: doc.id,
                    channel: "EMAIL",
                    type: currentStatus,
                    success: emailSuccess,
                }
            });

            if (emailSuccess) {
                if (currentStatus === "WARNING") newWarningsSent++;
                if (currentStatus === "EXPIRED") newExpiredSent++;
            }
        }

        return NextResponse.json({
            success: true,
            message: "Cron job finished successfully.",
            data: {
                evaluatedCertificates: activeCertificates.length,
                evaluatedDocuments: activeDocuments.length,
                warningsDispatched: newWarningsSent,
                expiredDispatched: newExpiredSent,
            }
        });

    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
