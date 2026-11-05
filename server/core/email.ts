import "server-only";
import { env, features } from "./env";
import { logger } from "./logger";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Evita envíos duplicados si el job se reintenta (Resend Idempotency-Key). */
  idempotencyKey?: string;
}

/**
 * Envío transaccional vía Resend (API HTTP). Sin RESEND_API_KEY se registra el
 * correo en el log y se considera entregado (modo desarrollo).
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  if (!features.email) {
    logger.info("email.skipped", { to: message.to, subject: message.subject, reason: "RESEND_API_KEY no configurada" });
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      ...(message.idempotencyKey ? { "Idempotency-Key": message.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend respondió ${res.status}: ${body.slice(0, 300)}`);
  }
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
