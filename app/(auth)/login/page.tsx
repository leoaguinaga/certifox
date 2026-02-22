"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { data, error } = await authClient.signIn.email({
                email,
                password,
            });

            if (error) {
                setError(error.message || "Credenciales incorrectas.");
                setLoading(false);
                return;
            }

            // TODO: Redirigir al tenant correspondiente después del login, 
            // actualmente necesitamos extraer el companySlug asociado al usuario.
            // Por ahora mandaremos al demo para que el framework de UI fluya en el MVP
            router.push("/demo-company/dashboard");

        } catch (err) {
            setError("Ha ocurrido un error inesperado.");
        } finally {
            if (error) setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl shadow-sm border border-border">
                <div className="flex flex-col items-center">
                    <Link href="/" className="flex items-center gap-2 mb-6">
                        <div className="rounded-lg bg-primary/10 p-2 ring-1 ring-primary/20">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-foreground">CertiFox</span>
                    </Link>
                    <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">
                        Ingresa a tu cuenta
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        O{" "}
                        <Link href="/register" className="font-medium text-primary hover:text-primary/80">
                            crea una cuenta nueva si eres una empresa nueva
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="p-3 text-sm bg-danger/10 text-danger border border-danger/20 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1"
                                placeholder="ejemplo@empresa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Contraseña</Label>
                                <Link href="#" className="font-medium text-sm text-primary hover:text-primary/80">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="mt-1"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                        {loading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <>Ingresar <ArrowRight className="ml-2 h-5 w-5" /></>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
