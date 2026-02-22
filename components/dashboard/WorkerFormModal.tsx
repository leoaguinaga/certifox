"use client";

import { useState } from "react";
import { UserPlus, Edit, Save } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WorkerFormModalProps {
    mode: "create" | "edit";
    children?: React.ReactNode;
    initialData?: {
        dni: string;
        fullName: string;
        position: string;
        email?: string;
        phone?: string;
    };
}

export function WorkerFormModal({ mode, children, initialData }: WorkerFormModalProps) {
    const [open, setOpen] = useState(false);
    const isEdit = mode === "edit";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button>
                        {isEdit ? <Edit className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                        {isEdit ? "Editar Trabajador" : "Registrar Trabajador"}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Editar Trabajador" : "Registrar Nuevo Trabajador"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Modifica los datos del trabajador seleccionado." : "Añade un trabajador a la planilla de la empresa para poder asignarle certificados."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dni">DNI / Pasaporte</Label>
                            <Input id="dni" defaultValue={initialData?.dni} placeholder="Ej. 45678912" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="position">Cargo / Puesto</Label>
                            <Input id="position" defaultValue={initialData?.position} placeholder="Ej. Operario" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fullName">Nombre Completo</Label>
                        <Input id="fullName" defaultValue={initialData?.fullName} placeholder="Nombres y Apellidos" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="wEmail">Correo Electrónico (Opcional)</Label>
                            <Input id="wEmail" type="email" defaultValue={initialData?.email} placeholder="correo@ejemplo.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="wPhone">Celular (Opcional)</Label>
                            <Input id="wPhone" type="tel" defaultValue={initialData?.phone} placeholder="+51 999..." />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">El celular y correo se usarán para enviar las recordatorios (si está habilitado globalmente).</p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={() => setOpen(false)}>
                        <Save className="mr-2 h-4 w-4" /> {isEdit ? "Guardar Cambios" : "Agregar Trabajador"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
