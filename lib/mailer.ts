import nodemailer from "nodemailer";

const {
    EMAIL_SERVICE,
    EMAIL_USER,
    EMAIL_PASSWORD,
    EMAIL_FROM_ADDRESS,
    EMAIL_FROM_NAME,
} = process.env;

const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE, // e.g. "gmail", "outlook"
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD, // Use app password if 2FA is enabled
    },
});

export interface AlertEmailPayload {
    to: string;
    companyName: string;
    workerName: string;
    certificateTypeName: string;
    expirationDate: Date;
    alertType: "WARNING" | "EXPIRED";
}

export async function sendCertificateAlertEmail(payload: AlertEmailPayload): Promise<boolean> {
    const { to, companyName, workerName, certificateTypeName, expirationDate, alertType } = payload;
    if (!EMAIL_FROM_ADDRESS || !EMAIL_FROM_NAME) {
        console.warn("Mail configuration missing (EMAIL_FROM_ADDRESS or EMAIL_FROM_NAME).");
        return false;
    }

    const isExpired = alertType === "EXPIRED";
    const subjectPrefix = isExpired ? "URGENTE: Certificado Vencido" : "Aviso: Certificado por Vencer";

    const formattedDate = expirationDate.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const color = isExpired ? "#ef4444" : "#f59e0b"; // Red vs Amber

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-w-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background-color: ${color}; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 24px;">${subjectPrefix}</h2>
      </div>
      <div style="padding: 20px; color: #374151;">
        <p>Hola Equipo de <strong>${companyName}</strong>,</p>
        <p>Le notificamos que el certificado <strong>${certificateTypeName}</strong> del trabajador <strong>${workerName}</strong> ${isExpired ? "ha vencido" : "está a punto de vencer"}.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Trabajador:</strong> ${workerName}</p>
          <p style="margin: 5px 0;"><strong>Certificado:</strong> ${certificateTypeName}</p>
          <p style="margin: 5px 0;"><strong>Fecha de Vencimiento:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0;"><strong>Estado:</strong> <span style="color: ${color}; font-weight: bold;">${isExpired ? "VENCIDO" : "POR VENCER"}</span></p>
        </div>
        
        <p>Le recomendamos tomar las acciones preventivas o correctivas pertinentes en la plataforma CertiFox para mantener el cumplimiento normativo al día.</p>
        
        <br/>
        <p style="font-size: 14px; color: #6b7280;">Atentamente,<br/>Equipo de ${EMAIL_FROM_NAME}</p>
      </div>
    </div>
  `;

    try {
        await transporter.sendMail({
            from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM_ADDRESS}>`,
            to,
            subject: `${subjectPrefix} - ${workerName} - ${companyName}`,
            html: htmlContent,
        });
        return true;
    } catch (error) {
        console.error("Failed to send email alert:", error);
        return false;
    }
}
