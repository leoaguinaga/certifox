"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-muted/30">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);

        try {
            const { error: authError } = await authClient.resetPassword({
                newPassword: password,
                token,
            });

            if (authError) {
                setError(authError.message || "Error al restablecer la contraseña.");
                setLoading(false);
                return;
            }

            setSuccess(true);
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

                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-success" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                ¡Contraseña actualizada!
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.
                            </p>
                            <Button asChild className="w-full h-12">
                                <Link href="/login">Ir al inicio de sesión</Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">
                                Nueva contraseña
                            </h2>
                            <p className="mt-2 text-center text-sm text-muted-foreground">
                                Ingresa tu nueva contraseña para restablecer el acceso.
                            </p>

                            <form className="mt-8 space-y-6 w-full" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="p-3 text-sm bg-danger/10 text-danger border border-danger/20 rounded-md">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="password">Nueva contraseña</Label>
                                    <div className="relative mt-1">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="pr-10"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Mínimo 8 caracteres.</p>
                                </div>

                                <div>
                                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="mt-1"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>

                                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                                    {loading ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : (
                                        "Restablecer contraseña"
                                    )}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
