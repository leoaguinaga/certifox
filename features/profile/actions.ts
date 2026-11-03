"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSession } from "@/server/auth";
import { updateUserProfile, changeUserPassword } from "@/server/services/profile.service";
import { UpdateProfileInput, ChangePasswordInput } from "./types";

export async function updateProfileServerAction(input: UpdateProfileInput) {
  try {
    const session = await getSession();
    const updated = await updateUserProfile(session, input);
    revalidatePath("/campus/perfil");
    revalidatePath("/campus");
    return { success: true, profile: updated };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message || "Error al actualizar el perfil." };
  }
}

export async function changePasswordServerAction(input: ChangePasswordInput) {
  try {
    const session = await getSession();
    const reqHeaders = await headers();
    const res = await changeUserPassword(session, reqHeaders, input);
    return { success: true, message: res.message };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message || "Error al cambiar la contraseña." };
  }
}
