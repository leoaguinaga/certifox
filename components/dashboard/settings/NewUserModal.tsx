"use client";

import { useState } from "react";
import { UserPlus, Loader2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface NewUserModalProps {
    companyId: string;
}

export function NewUserModal({ companyId }: NewUserModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const role = formData.get("role") as string;

        // Utilizamos Better Auth para crear el usuario. 
        // Nota: Por defecto, en la mayoría de implementaciones, signUp iniciará sesión automáticamente 
        // con el nuevo usuario. En un SaaS B2B ideal, este endpoint enviaría una invitación (magic link)
        // o usaría el plugin 'admin' de Better Auth para crear usuarios sin alterar la sesión actual.
        // Para el MVP, lo mantendremos simple sabiendo que podría requerir re-login.

        const { error: authError } = await authClient.signUp.email({
            email,
            password,
            name,
            // @ts-expect-error Custom fields
            companyId: companyId,
            role: role
        });

        if (authError) {
            setError(authError.message || "Ocurrió un error al crear el usuario.");
            setLoading(false);
        } else {
            setOpen(false);
            router.refresh(); // Refresh to update the users table
            setLoading(false);

            // Si el comportamiento de BetterAuth cambia la sesión actual, podrías forzar un reload
            // window.location.reload();
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) setError("");
            setOpen(val);
        }}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" /> Nuevo Usuario
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Registrar Usuario</DialogTitle>
                        <DialogDescription>
                            Añade un nuevo administrador o manager a tu entorno de trabajo.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="text-sm font-medium text-danger bg-danger/10 p-3 rounded-md border border-danger/20">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input id="name" name="name" required placeholder="Ej. Juan Pérez" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" name="email" type="email" required placeholder="juan@empresa.com" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña Temporal</Label>
                            <Input id="password" name="password" type="text" required placeholder="Una contraseña que le entregarás" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Rol</Label>
                            <Select name="role" defaultValue="MANAGER">
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona el rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Administrador (Acceso total)</SelectItem>
                                    <SelectItem value="MANAGER">Manager (Solo gestión)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Registrar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
