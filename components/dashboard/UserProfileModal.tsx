"use client";

import { useState } from "react";
import { User, Lock, Save } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserProfileModalProps {
    children?: React.ReactNode;
}

export function UserProfileModal({ children }: UserProfileModalProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || <Button variant="outline">Mi Perfil</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Perfil de Usuario</DialogTitle>
                    <DialogDescription>
                        Actualiza tu información personal o cambia tu contraseña.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground border-b pb-2"><User className="h-4 w-4" /> Datos Personales</h4>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input id="name" defaultValue="Admnistrador" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" type="email" defaultValue="admin@acme.com" disabled className="bg-muted" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground border-b pb-2"><Lock className="h-4 w-4" /> Seguridad</h4>
                        <div className="grid gap-2">
                            <Label htmlFor="current-password">Contraseña actual</Label>
                            <Input id="current-password" type="password" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new-password">Nueva contraseña</Label>
                            <Input id="new-password" type="password" />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={() => setOpen(false)}>
                        <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
