import "server-only";
import { headers } from "next/headers";
import { auth } from "@/server/core/auth";
import { db, transaction } from "@/server/core/db";
import { invalid, notFound } from "@/server/core/errors";
import { campusView } from "@/server/core/roles";
import type { AuthedContext } from "@/server/core/request-context";
import { claimReadyFile, fileUrl, scheduleFileDeletion } from "@/server/modules/files/files.service";
import { maskDocumentNumber } from "@/lib/masking";
import type { UserProfileData } from "@/features/profile/types";

const profileSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  documentType: true,
  documentNumber: true,
  institution: true,
  createdAt: true,
  avatarFileId: true,
  avatarFile: { select: { key: true, visibility: true } },
} as const;

type ProfileRow = NonNullable<Awaited<ReturnType<typeof loadProfile>>>;
const loadProfile = (id: string) => db.user.findUnique({ where: { id }, select: profileSelect });

function toDto(ctx: AuthedContext, u: ProfileRow): UserProfileData {
  const role = campusView(ctx);
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role,
    documentType: u.documentType ?? "DNI",
    documentNumberMasked: u.documentNumber ? maskDocumentNumber(u.documentNumber) : "Sin registrar",
    institution: u.institution ?? "",
    avatarUrl:
      fileUrl(u.avatarFile) ?? u.image ?? (role === "INSTRUCTOR" ? "/images/avatars/instructor.svg" : "/images/avatars/student.svg"),
    createdAt: u.createdAt.toISOString(),
  };
}

export async function getMyProfile(ctx: AuthedContext): Promise<UserProfileData> {
  const user = await loadProfile(ctx.user.id);
  if (!user) throw notFound("Usuario no encontrado");
  return toDto(ctx, user);
}

export async function updateMyProfile(
  ctx: AuthedContext,
  input: { name: string; institution?: string; avatarFileId?: string }
): Promise<UserProfileData> {
  if (input.name.trim().length < 3) throw invalid("El nombre completo debe tener al menos 3 caracteres.");

  const current = await loadProfile(ctx.user.id);
  if (!current) throw notFound("Usuario no encontrado");

  await transaction(async (tx) => {
    let avatarFileId: string | undefined;
    if (input.avatarFileId && input.avatarFileId !== current.avatarFileId) {
      avatarFileId = (await claimReadyFile(tx, ctx, input.avatarFileId, "USER_AVATAR")).id;
      await scheduleFileDeletion(tx, current.avatarFileId);
    }
    await tx.user.update({
      where: { id: ctx.user.id },
      data: {
        name: input.name.trim(),
        institution: input.institution?.trim() || null,
        ...(avatarFileId ? { avatarFileId } : {}),
      },
    });
  });

  return toDto(ctx, (await loadProfile(ctx.user.id))!);
}

export async function changeMyPassword(input: { currentPassword: string; newPassword: string }) {
  if (!input.currentPassword) throw invalid("Debe ingresar su contraseña actual.");
  if (input.newPassword.length < 8) throw invalid("La nueva contraseña debe tener al menos 8 caracteres.");
  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: { currentPassword: input.currentPassword, newPassword: input.newPassword, revokeOtherSessions: true },
    });
  } catch {
    throw invalid("La contraseña actual es incorrecta o la nueva no cumple los requisitos.");
  }
  return { message: "Contraseña actualizada. Se cerraron las demás sesiones por seguridad." };
}
