import "server-only";
import { after } from "next/server";
import { db } from "@/server/core/db";
import { appUrl } from "@/server/core/env";
import { escapeHtml, sendEmail } from "@/server/core/email";
import { logger } from "@/server/core/logger";
import { drainOutbox, type OutboxHandlers } from "@/server/core/outbox";
import { deleteObject, isStorageConfigured } from "@/server/core/storage";
import { generateAndStoreCertificatePdf } from "@/server/modules/certification/certificate-pdf";
import { cleanupAbandonedUploads } from "@/server/modules/files/files.service";

function emailLayout(title: string, paragraphs: string[], cta?: { label: string; url: string }) {
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#0D1C2F;max-width:560px;margin:auto;padding:24px">
<h2 style="margin:0 0 16px">${escapeHtml(title)}</h2>
${paragraphs.map((p) => `<p style="line-height:1.5">${escapeHtml(p)}</p>`).join("\n")}
${cta ? `<p><a href="${cta.url}" style="display:inline-block;background:#FD761A;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:bold">${escapeHtml(cta.label)}</a></p>` : ""}
<p style="color:#78716c;font-size:12px;margin-top:32px">Certifox · Este es un mensaje automático.</p>
</body></html>`;
  const text = [title, "", ...paragraphs, ...(cta ? ["", `${cta.label}: ${cta.url}`] : [])].join("\n");
  return { html, text };
}

async function enrollmentEmailData(enrollmentId: string) {
  return db.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      user: { select: { email: true, name: true } },
      course: { select: { title: true, slug: true } },
      organization: { select: { name: true } },
    },
  });
}

async function certificateEmailData(certificateId: string) {
  return db.certificate.findUnique({
    where: { id: certificateId },
    select: {
      code: true,
      courseTitle: true,
      holderName: true,
      revocationReason: true,
      organization: { select: { name: true } },
      enrollment: { select: { user: { select: { email: true } } } },
    },
  });
}

export const outboxHandlers: OutboxHandlers = {
  "enrollment.requested": async (event) => {
    const e = await enrollmentEmailData(String(event.payload.enrollmentId));
    if (!e) return;
    const { html, text } = emailLayout(
      "Recibimos tu solicitud de matrícula",
      [
        `Hola ${e.user.name}, registramos tu solicitud para "${e.course.title}" en ${e.organization.name}.`,
        "Realiza el abono con los medios indicados en la plataforma. El aula se habilitará cuando la institución confirme tu pago.",
      ],
      { label: "Ver mi matrícula", url: `${appUrl()}/campus/cursos/${e.course.slug}` }
    );
    await sendEmail({ to: e.user.email, subject: `Solicitud de matrícula: ${e.course.title}`, html, text, idempotencyKey: event.id });
  },

  "enrollment.activated": async (event) => {
    const e = await enrollmentEmailData(String(event.payload.enrollmentId));
    if (!e) return;
    const { html, text } = emailLayout(
      "Tu matrícula está activa",
      [`Hola ${e.user.name}, ya puedes acceder a "${e.course.title}".`],
      { label: "Ir al aula", url: `${appUrl()}/campus/cursos/${e.course.slug}` }
    );
    await sendEmail({ to: e.user.email, subject: `Matrícula activa: ${e.course.title}`, html, text, idempotencyKey: event.id });
  },

  "certificate.issued": async (event) => {
    const certificateId = String(event.payload.certificateId);
    await generateAndStoreCertificatePdf(certificateId);
    const c = await certificateEmailData(certificateId);
    if (!c) return;
    const { html, text } = emailLayout(
      "Tu certificado fue emitido",
      [
        `Felicitaciones ${c.holderName}. ${c.organization.name} emitió tu certificado de "${c.courseTitle}".`,
        `Código de verificación: ${c.code}`,
      ],
      { label: "Ver y verificar certificado", url: `${appUrl()}/verificar/${c.code}` }
    );
    await sendEmail({
      to: c.enrollment.user.email,
      subject: `Certificado emitido: ${c.courseTitle}`,
      html,
      text,
      idempotencyKey: `${event.id}-email`,
    });
  },

  "certificate.revoked": async (event) => {
    const c = await certificateEmailData(String(event.payload.certificateId));
    if (!c) return;
    const { html, text } = emailLayout("Tu certificado fue revocado", [
      `${c.organization.name} revocó el certificado ${c.code} de "${c.courseTitle}".`,
      `Motivo: ${c.revocationReason ?? "no especificado"}.`,
      "Si crees que es un error, contacta a la institución desde la mesa de ayuda.",
    ]);
    await sendEmail({ to: c.enrollment.user.email, subject: `Certificado revocado: ${c.code}`, html, text, idempotencyKey: event.id });
  },

  "file.delete": async (event) => {
    const file = await db.file.findUnique({ where: { id: String(event.payload.fileId) } });
    if (!file || file.status !== "DELETED") return;
    if (isStorageConfigured()) await deleteObject(file.bucket, file.key);
  },
};

export function processOutbox(opts?: { limit?: number; maxBatches?: number }) {
  return drainOutbox(outboxHandlers, opts);
}

/**
 * Procesa los eventos recién encolados después de enviar la respuesta (sin bloquear
 * al usuario). Si no hay request activo (scripts/tests), no hace nada: el cron los toma.
 */
export function scheduleOutboxProcessing(): void {
  try {
    after(async () => {
      try {
        await processOutbox({ limit: 10, maxBatches: 1 });
      } catch (err) {
        logger.error("outbox.after_failed", { err });
      }
    });
  } catch {
    // Fuera de un request de Next.
  }
}

/** Tareas periódicas (cron): outbox pendiente, subidas abandonadas y sesiones vencidas. */
export async function runMaintenance() {
  const outbox = await processOutbox({ limit: 25, maxBatches: 8 });
  const abandonedUploads = await cleanupAbandonedUploads();
  const { count: expiredSessions } = await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return { ...outbox, abandonedUploads, expiredSessions };
}
