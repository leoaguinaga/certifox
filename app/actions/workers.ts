"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createWorker(companySlug: string, formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        return { error: "No autorizado" };
    }

    const dni = formData.get("dni") as string;
    const fullName = formData.get("fullName") as string;
    const position = formData.get("position") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;

    if (!dni || !fullName) {
        return { error: "DNI y Nombre Completo son requeridos." };
    }

    try {
        const company = await db.company.findUnique({
            where: { slug: companySlug }
        });

        if (!company) {
            return { error: "Empresa no encontrada." };
        }

        // Check if worker with same DNI already exists in the company
        const existingWorker = await db.worker.findUnique({
            where: {
                dni_companyId: {
                    dni,
                    companyId: company.id
                }
            }
        });

        if (existingWorker) {
            if (!existingWorker.isActive) {
                // Reactivate soft-deleted worker
                await db.worker.update({
                    where: { id: existingWorker.id },
                    data: {
                        fullName,
                        position,
                        email: email || null,
                        phone: phone || null,
                        isActive: true
                    }
                });
            } else {
                return { error: "Ya existe un trabajador activo con este DNI en tu empresa." };
            }
        } else {
            await db.worker.create({
                data: {
                    dni,
                    fullName,
                    position,
                    email: email || null,
                    phone: phone || null,
                    companyId: company.id
                }
            });
        }

        revalidatePath(`/${companySlug}/workers`);
        return { success: true };
    } catch (error) {
        console.error("Error al crear trabajador:", error);
        return { error: "Ocurrió un error inesperado al registrar el trabajador." };
    }
}

export async function updateWorker(workerId: string, companySlug: string, formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        return { error: "No autorizado" };
    }

    const dni = formData.get("dni") as string;
    const fullName = formData.get("fullName") as string;
    const position = formData.get("position") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;

    if (!dni || !fullName) {
        return { error: "DNI y Nombre Completo son requeridos." };
    }

    try {
        await db.worker.update({
            where: { id: workerId },
            data: {
                dni,
                fullName,
                position,
                email: email || null,
                phone: phone || null,
            }
        });

        revalidatePath(`/${companySlug}/workers`);
        return { success: true };
    } catch (error) {
        console.error("Error al editar trabajador:", error);
        return { error: "Ocurrió un error al actualizar los datos." };
    }
}

export async function deleteWorker(workerId: string, companySlug: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        return { error: "No autorizado" };
    }

    try {
        // Soft delete
        await db.worker.update({
            where: { id: workerId },
            data: { isActive: false }
        });

        revalidatePath(`/${companySlug}/workers`);
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar trabajador:", error);
        return { error: "Ocurrió un error al eliminar este registro." };
    }
}
