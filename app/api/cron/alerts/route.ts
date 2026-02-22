import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendCertificateAlertEmail } from "@/lib/mailer";

// Securing the CRON endpoint via a secret passed by Vercel / External caller
const CRON_SECRET = process.env.CRON_SECRET || "local-cron-secret";

export async function GET(request: Request) {
    // 1. Verify Authorization
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}` && process.env.NODE_ENV !== "development") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 2. Query all active certificates in active companies and workers
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

        let newWarningsSent = 0;
        let newExpiredSent = 0;

        const now = new Date();

        for (const cert of activeCertificates) {
            const company = cert.worker.company;
            const thresholdDays = cert.notificationDaysBefore ?? company.defaultNotificationDays;

            // Calculate exact difference in days, rounding up since partial days remaining still count
            const diffMs = cert.expirationDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            let currentStatus: "WARNING" | "EXPIRED" | "VALID" = "VALID";
            if (diffDays <= 0) {
                currentStatus = "EXPIRED";
            } else if (diffDays <= thresholdDays) {
                currentStatus = "WARNING";
            } else {
                continue; // It's strictly VALID, do nothing.
            }

            // Check if we already successfully sent this specific type of alert for this exact certificate
            const hasSentWarning = cert.notificationLogs.some(log => log.type === "WARNING");
            const hasSentExpired = cert.notificationLogs.some(log => log.type === "EXPIRED");

            if (currentStatus === "WARNING" && hasSentWarning) {
                continue; // Already sent a warning, no need to spam
            }
            if (currentStatus === "EXPIRED" && hasSentExpired) {
                continue; // Already sent the expired alert, no need to spam
            }

            // 3. Send Email
            const emailSuccess = await sendCertificateAlertEmail({
                to: company.email,
                companyName: company.name,
                workerName: cert.worker.fullName,
                certificateTypeName: cert.certificateType.name,
                expirationDate: cert.expirationDate,
                alertType: currentStatus,
            });

            // 4. Log the result to prevent deduplication and keep an audit trail
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

        return NextResponse.json({
            success: true,
            message: "Cron job finished successfully.",
            data: {
                evaluatedCertificates: activeCertificates.length,
                warningsDispatched: newWarningsSent,
                expiredDispatched: newExpiredSent,
            }
        });

    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
