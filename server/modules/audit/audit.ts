import "server-only";
import { Prisma } from "@prisma/client";
import type { DbClient } from "@/server/core/db";

export type AuditAction =
  | "CONFIRM_PAYMENT"
  | "GRADE_SUBMISSION"
  | "COMPLETE_COURSE"
  | "ISSUE_CERTIFICATE"
  | "REVOKE_CERTIFICATE"
  | "CREATE_COURSE"
  | "UPDATE_COURSE"
  | "PUBLISH_COURSE"
  | "UNPUBLISH_COURSE"
  | "ADD_MODULE"
  | "ADD_LESSON"
  | "DELETE_LESSON"
  | "ADD_MEMBER"
  | "UPDATE_MEMBER_ROLE"
  | "UPDATE_ORGANIZATION";

export type AuditTarget = "Enrollment" | "Submission" | "Certificate" | "Course" | "Module" | "Lesson" | "Membership" | "Organization";

/**
 * Registra una entrada de auditoría. Se llama SIEMPRE con el cliente transaccional
 * del caso de uso: la acción y su auditoría se confirman o revierten juntas.
 */
export async function recordAudit(
  client: DbClient,
  entry: {
    action: AuditAction;
    targetType: AuditTarget;
    targetId: string;
    actorId: string | null;
    organizationId: string | null;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  await client.auditLog.create({
    data: {
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      actorId: entry.actorId,
      organizationId: entry.organizationId,
      metadata: (entry.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}
