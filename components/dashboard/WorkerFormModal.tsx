"use client";

import { useState } from "react";
import { UserPlus, Edit, Save, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";
import { createWorker, updateWorker } from "@/app/actions/workers";

interface WorkerFormModalProps {
    mode: "create" | "edit";
    children?: React.ReactNode;
    initialData?: {
        id?: string;
        dni: string;
        fullName: string;
        position: string;
        email?: string;
        phone?: string;
    };
}

export function WorkerFormModal({ mode, children, initialData }: WorkerFormModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const params = useParams();
    const companySlug = params.companySlug as string;

    const isEdit = mode === "edit";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        try {
            let res;
            if (isEdit && initialData?.id) {
                res = await updateWorker(initialData.id, companySlug, formData);
            } else {
                res = await createWorker(companySlug, formData);
            }

            if (res.error) {
                setError(res.error);
            } else {
                setOpen(false); // Success! close modal
            }
        } catch (err) {
            setError("Ocurrió un error inesperado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) setError("");
            setOpen(val);
        }}>
            <DialogTrigger asChild>
                {children || (
                    <Button>
                        {isEdit ? <Edit className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                        {isEdit ? "Editar Trabajador" : "Registrar Trabajador"}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEdit ? "Editar Trabajador" : "Registrar Nuevo Trabajador"}</DialogTitle>
                        <DialogDescription>
                            {isEdit ? "Modifica los datos del trabajador seleccionado." : "Añade un trabajador a la planilla de la empresa para poder asignarle certificados."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="text-sm font-medium text-danger bg-danger/10 p-3 rounded-md border border-danger/20">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dni">DNI / Pasaporte</Label>
                                <Input id="dni" name="dni" required defaultValue={initialData?.dni} placeholder="Ej. 45678912" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="position">Cargo / Puesto</Label>
                                <Input id="position" name="position" required defaultValue={initialData?.position} placeholder="Ej. Operario" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nombre Completo</Label>
                            <Input id="fullName" name="fullName" required defaultValue={initialData?.fullName} placeholder="Nombres y Apellidos" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico (Opcional)</Label>
                                <Input id="email" name="email" type="email" defaultValue={initialData?.email} placeholder="correo@ejemplo.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Celular (Opcional)</Label>
                                <Input id="phone" name="phone" type="tel" defaultValue={initialData?.phone} placeholder="+51 999..." />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">El celular y correo se usarán para enviar los recordatorios (si está habilitado globalmente).</p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isEdit ? "Guardar Cambios" : "Agregar Trabajador"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
