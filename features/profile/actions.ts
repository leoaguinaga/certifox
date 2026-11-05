"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { runAction } from "@/server/core/action";
import { changeMyPassword, updateMyProfile } from "@/server/modules/profile/profile.service";

const profileSchema = z.object({
  name: z.string().min(3, "El nombre completo debe tener al menos 3 caracteres").max(120),
  institution: z.string().max(160).optional(),
  avatarFileId: z.string().max(64).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Debe ingresar su contraseña actual"),
  newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres").max(128),
});

export async function updateProfileServerAction(input: z.input<typeof profileSchema>) {
  return runAction(
    {
      name: "profile.update",
      schema: profileSchema,
      handler: async (ctx, data) => {
        const profile = await updateMyProfile(ctx, data);
        revalidatePath("/campus/perfil");
        return profile;
      },
    },
    input
  );
}

export async function changePasswordServerAction(input: z.input<typeof passwordSchema>) {
  return runAction(
    {
      name: "profile.change_password",
      schema: passwordSchema,
      rateLimit: { rule: { window: 600, max: 5 }, name: "change-password" },
      handler: async (_ctx, data) => changeMyPassword(data),
    },
    input
  );
}
