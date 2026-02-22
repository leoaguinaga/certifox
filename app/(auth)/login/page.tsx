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
    const [showPassword, setShowPassword] = useState(false);
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

            // Fetch company slug to redirect to the correct tenant
            const res = await fetch("/api/get-company-slug");
            if (res.ok) {
                const { slug } = await res.json();
                if (slug) {
                    router.push(`/${slug}/dashboard`);
                    return;
                }
            }

            // Fallback if no slug found
            router.push("/demo-company/dashboard");

        } catch (err) {
            setError("Ha ocurrido un error inesperado al iniciar sesión.");
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
                            <div className="relative mt-1">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
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
