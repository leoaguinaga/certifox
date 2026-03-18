"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowLeft, Loader2, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // @ts-expect-error Better Auth client types don't include forgotPassword in static type inference
            const { error: authError } = await authClient.forgotPassword({
                email,
                redirectTo: "/reset-password",
            });

            if (authError) {
                setError(authError.message || "Error al procesar la solicitud.");
                setLoading(false);
                return;
            }

            setSent(true);
        } catch {
            setError("Ocurrió un error inesperado.");
        } finally {
            setLoading(false);
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

                    {sent ? (
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                                <Mail className="h-8 w-8 text-success" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                Revisa tu correo
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Si existe una cuenta asociada a <strong>{email}</strong>, recibirás un enlace para restablecer tu contraseña.
                            </p>
                            <Link href="/login" className="text-sm font-medium text-primary hover:text-primary/80">
                                ← Volver al inicio de sesión
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">
                                ¿Olvidaste tu contraseña?
                            </h2>
                            <p className="mt-2 text-center text-sm text-muted-foreground">
                                Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.
                            </p>

                            <form className="mt-8 space-y-6 w-full" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="p-3 text-sm bg-danger/10 text-danger border border-danger/20 rounded-md">
                                        {error}
                                    </div>
                                )}

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

                                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                                    {loading ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : (
                                        "Enviar enlace de recuperación"
                                    )}
                                </Button>

                                <div className="text-center">
                                    <Link href="/login" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
                                        <ArrowLeft className="h-4 w-4" /> Volver al inicio de sesión
                                    </Link>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
