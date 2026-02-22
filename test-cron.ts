import { db } from "./lib/db";
async function main() {
    console.log("Testing query");
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
    console.log("Found:", activeCertificates.length);
}
main().catch(console.error);
