import "server-only";
import { prisma } from "@/server/db";
import { auth } from "@/server/auth";
import { SessionContext, requireAuth, AuthorizationError } from "@/server/policies";
import { maskDocumentNumber } from "@/server/services/certificate.service";
import { UserProfileData, UpdateProfileInput, ChangePasswordInput } from "@/features/profile/types";

export async function getUserProfile(
  session: SessionContext | null | undefined
): Promise<UserProfileData> {
  const user = requireAuth(session);

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    throw new AuthorizationError("Usuario no encontrado en la base de datos.", 404);
  }

  const maskedDoc = dbUser.documentNumber
    ? maskDocumentNumber(dbUser.documentNumber)
    : "Sin registrar";

  const defaultAvatar =
    dbUser.role === "INSTRUCTOR"
      ? "/images/avatars/instructor.svg"
      : "/images/avatars/student.svg";

  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role as "STUDENT" | "INSTRUCTOR",
    documentType: dbUser.documentType || "DNI",
    documentNumberMasked: maskedDoc,
    institution: dbUser.institution || "",
    avatarUrl: dbUser.avatarUrl || defaultAvatar,
    createdAt: dbUser.createdAt.toISOString(),
  };
}

export async function updateUserProfile(
  session: SessionContext | null | undefined,
  input: UpdateProfileInput
): Promise<UserProfileData> {
  const user = requireAuth(session);

  if (!input.name || input.name.trim().length < 3) {
    throw new AuthorizationError("El nombre completo debe tener al menos 3 caracteres.", 400);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: input.name.trim(),
      institution: input.institution?.trim() || null,
      avatarUrl: input.avatarUrl?.trim() || undefined,
    },
  });

  const maskedDoc = updated.documentNumber
    ? maskDocumentNumber(updated.documentNumber)
    : "Sin registrar";

  const defaultAvatar =
    updated.role === "INSTRUCTOR"
      ? "/images/avatars/instructor.svg"
      : "/images/avatars/student.svg";

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role as "STUDENT" | "INSTRUCTOR",
    documentType: updated.documentType || "DNI",
    documentNumberMasked: maskedDoc,
    institution: updated.institution || "",
    avatarUrl: updated.avatarUrl || defaultAvatar,
    createdAt: updated.createdAt.toISOString(),
  };
}

export async function changeUserPassword(
  session: SessionContext | null | undefined,
  requestHeaders: Headers,
  input: ChangePasswordInput
): Promise<{ success: boolean; message: string }> {
  requireAuth(session);

  if (!input.currentPassword) {
    throw new AuthorizationError("Debe ingresar su contraseña actual.", 400);
  }

  if (!input.newPassword || input.newPassword.length < 8) {
    throw new AuthorizationError("La nueva contraseña debe tener al menos 8 caracteres.", 400);
  }

  try {
    await auth.api.changePassword({
      headers: requestHeaders,
      body: {
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
        revokeOtherSessions: true,
      },
    });

    return {
      success: true,
      message: "Contraseña actualizada exitosamente. Se cerraron las demás sesiones por seguridad.",
    };
  } catch (err: unknown) {
    const error = err as Error;
    throw new AuthorizationError(
      error.message || "La contraseña actual es incorrecta o no cumple los requisitos.",
      400
    );
  }
}
