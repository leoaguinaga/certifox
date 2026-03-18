"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Wand2, Lock, Info } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

// Plans configuration
const plans = [
    { id: "starter", name: "Demo", price: "Gratis", desc: "Hasta 50 trabajadores", locked: false },
    { id: "professional", name: "Professional", price: "$99/mes", desc: "Hasta 250 trabajadores", locked: true },
    { id: "enterprise", name: "Enterprise", price: "Custom", desc: "Ilimitado", locked: true },
];

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        userName: "",
        userEmail: "",
        userPassword: "",
        companyName: "",
        companyRuc: "",
        companySlug: "",
        selectedPlan: "starter",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generateSlug = () => {
        if (!formData.companyName) return;
        const slug = formData.companyName
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setFormData(prev => ({ ...prev, companySlug: slug }));
    };

    // Password strength calculation
    const getPasswordStrength = (pw: string): { label: string; color: string; width: string } => {
        if (pw.length === 0) return { label: "", color: "bg-muted", width: "0%" };
        if (pw.length < 8) return { label: "Débil", color: "bg-danger", width: "33%" };
        const hasUpper = /[A-Z]/.test(pw);
        const hasNumber = /[0-9]/.test(pw);
        const hasSpecial = /[^A-Za-z0-9]/.test(pw);
        const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
        if (score >= 2) return { label: "Fuerte", color: "bg-success", width: "100%" };
        return { label: "Aceptable", color: "bg-warning", width: "66%" };
    };

    const pwStrength = getPasswordStrength(formData.userPassword);

    // Check availability (email or slug)
    const checkAvailability = async (type: "email" | "slug", value: string): Promise<boolean> => {
        try {
            const res = await fetch("/api/check-availability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, value })
            });
            const data = await res.json();
            return data.available;
        } catch {
            return true; // Don't block on network errors
        }
    };

    const nextStep = async () => {
        setError("");

        if (step === 1) {
            if (!formData.userName || !formData.userEmail || formData.userPassword.length < 8) {
                setError("Por favor completa todos los campos. La contraseña debe tener al menos 8 caracteres.");
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.userEmail)) {
                setError("El correo electrónico no tiene un formato válido.");
                return;
            }

            // Check email availability
            setChecking(true);
            const emailAvailable = await checkAvailability("email", formData.userEmail);
            setChecking(false);
            if (!emailAvailable) {
                setError("Este correo electrónico ya está registrado. Intenta con otro o inicia sesión.");
                return;
            }
        } else if (step === 2) {
            if (!formData.companyName || !formData.companySlug) {
                setError("El nombre de la empresa y el URL identificador (slug) son obligatorios.");
                return;
            }

            // Validate slug format
            const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
            if (!slugRegex.test(formData.companySlug)) {
                setError("El URL del workspace solo puede contener letras minúsculas, números y guiones.");
                return;
            }

            // Check slug availability
            setChecking(true);
            const slugAvailable = await checkAvailability("slug", formData.companySlug);
            setChecking(false);
            if (!slugAvailable) {
                setError("Este URL de workspace ya está en uso. Escoge otro o usa el botón mágico ✨ para generar uno.");
                return;
            }
        }
        setStep(s => s + 1);
    };

    const prevStep = () => {
        setError("");
        setStep(s => s - 1);
    };

    const onSubmit = async () => {
        setLoading(true);
        setError("");

        try {
            // 1. Crear Company
            const companyRes = await fetch("/api/register-company", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyName: formData.companyName,
                    companyRuc: formData.companyRuc,
                    companySlug: formData.companySlug,
                    plan: formData.selectedPlan.toUpperCase(),
                    adminEmail: formData.userEmail
                })
            });

            const companyData = await companyRes.json();

            if (!companyRes.ok) {
                throw new Error(companyData.error || "Error al crear la empresa");
            }

            const { companyId } = companyData;

            // 2. Crear User y Sesión
            const { error: authError } = await authClient.signUp.email({
                email: formData.userEmail,
                password: formData.userPassword,
                name: formData.userName,
                // @ts-expect-error Better Auth additionalFields
                companyId: companyId,
                role: "ADMIN"
            });

            if (authError) {
                throw new Error(authError.message || "Error al registrar el usuario");
            }

            toast.success("¡Workspace creado exitosamente!");
            router.push(`/${formData.companySlug}/dashboard`);

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || "Ocurrió un error al registrar la empresa.");
            } else {
                setError("Ocurrió un error inesperado al registrar la empresa.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-muted/30">
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-6">
                <Link href="/" className="flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold tracking-tight text-foreground">CertiFox</span>
                </Link>
                <p className="text-sm text-muted-foreground">
                    ¿Ya tienes cuenta? <Link href="/login" className="font-medium text-primary hover:text-primary/80">Inicia Sesión</Link>
                </p>
            </header>

            <main className="flex flex-1 flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-lg">

                    {/* Progress Indicator */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between relative mx-5">
                            <div className="absolute left-0 top-1/2 w-full h-1 bg-border -z-10 -translate-y-1/2"></div>
                            <div className="absolute left-0 top-1/2 h-1 bg-primary -z-10 -translate-y-1/2 transition-all duration-300" style={{ width: `${(step - 1) * 50}%` }}></div>

                            {[
                                { num: 1, label: "Administrador" },
                                { num: 2, label: "Empresa" },
                                { num: 3, label: "Plan" }
                            ].map(({ num, label }) => (
                                <div key={num} className="relative flex flex-col items-center">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${step >= num ? 'bg-primary border-primary text-white' : 'bg-background border-border text-muted-foreground'
                                        }`}>
                                        {step > num ? <CheckCircle2 className="h-5 w-5" /> : num}
                                    </div>
                                    <span className={`absolute top-12 left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap transition-colors ${step >= num ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
                        {error && (
                            <div className="mb-6 p-4 text-sm bg-danger/10 text-danger border border-danger/20 rounded-md text-center">
                                {error}
                            </div>
                        )}

                        {/* STEP 1: Admin User */}
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Cuenta Administrador</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Crea tus credenciales de acceso principales</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="userName">Nombre Completo</Label>
                                        <Input id="userName" name="userName" required placeholder="Juan Pérez" value={formData.userName} onChange={handleChange} className="mt-1.5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <Label htmlFor="userEmail">Correo Electrónico (Trabajo)</Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="max-w-[260px] text-xs">
                                                    Este correo será el punto de contacto principal de la empresa. Las alertas de vencimiento se enviarán a esta dirección.
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <Input id="userEmail" name="userEmail" type="email" required placeholder="juan@tuempresa.com" value={formData.userEmail} onChange={handleChange} className="mt-1.5" />
                                    </div>
                                    <div>
                                        <Label htmlFor="userPassword">Contraseña</Label>
                                        <div className="relative mt-1.5">
                                            <Input
                                                id="userPassword"
                                                name="userPassword"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                className="pr-10"
                                                value={formData.userPassword}
                                                onChange={handleChange}
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
                                        {/* Password strength indicator */}
                                        <div className="mt-2 space-y-1">
                                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ${pwStrength.color}`}
                                                    style={{ width: pwStrength.width }}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
                                                {pwStrength.label && (
                                                    <p className={`text-xs font-medium ${pwStrength.color === 'bg-danger' ? 'text-danger' : pwStrength.color === 'bg-warning' ? 'text-warning' : 'text-success'}`}>
                                                        {pwStrength.label}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full h-12" onClick={nextStep} disabled={checking}>
                                    {checking ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...</>
                                    ) : (
                                        <>Siguiente <ArrowRight className="ml-2 h-4 w-4" /></>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* STEP 2: Company Details */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Detalles de Empresa</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Configura tu espacio Multi-Tenant</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="companyName">Razón Social o Nombre</Label>
                                        <Input id="companyName" name="companyName" required placeholder="Acme Industrial S.A.C." value={formData.companyName} onChange={handleChange} className="mt-1.5" />
                                    </div>
                                    <div>
                                        <Label htmlFor="companyRuc">RUC (Opcional)</Label>
                                        <Input id="companyRuc" name="companyRuc" placeholder="20123456789" value={formData.companyRuc} onChange={handleChange} className="mt-1.5" />
                                    </div>
                                    <div>
                                        <Label htmlFor="companySlug">URL Personalizada (Workspace)</Label>
                                        <div className="flex mt-1.5 items-center">
                                            <span className="inline-flex h-10 items-center rounded-l-md border border-r-0 border-border bg-muted px-3 text-sm text-muted-foreground">
                                                certifox.com/
                                            </span>
                                            <Input
                                                id="companySlug"
                                                name="companySlug"
                                                required
                                                className="rounded-l-none rounded-r-none border-l-0 border-r-0 focus-visible:ring-0 focus-visible:border-primary px-3"
                                                placeholder="tu-empresa"
                                                value={formData.companySlug}
                                                onChange={handleChange}
                                            />
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="rounded-l-none border-l-0 h-10 w-10 shrink-0"
                                                        onClick={generateSlug}
                                                    >
                                                        <Wand2 className="h-4 w-4 text-primary" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Generar slug a partir del nombre</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="outline" className="w-1/3 h-12" onClick={prevStep}>
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
                                    </Button>
                                    <Button className="w-2/3 h-12" onClick={nextStep} disabled={checking}>
                                        {checking ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...</>
                                        ) : (
                                            <>Siguiente <ArrowRight className="ml-2 h-4 w-4" /></>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Plan Selection */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Elige tu Plan</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Podrás cambiarlo después en facturación.</p>
                                </div>

                                <div className="space-y-3">
                                    {plans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            onClick={() => !plan.locked && setFormData(prev => ({ ...prev, selectedPlan: plan.id }))}
                                            className={`relative flex rounded-xl p-4 border-2 transition-all ${
                                                plan.locked
                                                    ? 'border-border opacity-50 cursor-not-allowed'
                                                    : formData.selectedPlan === plan.id
                                                        ? 'border-primary bg-primary/5 cursor-pointer'
                                                        : 'border-border hover:border-border/80 cursor-pointer'
                                            }`}
                                        >
                                            <div className="flex flex-1 items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className={`block text-sm font-semibold ${!plan.locked && formData.selectedPlan === plan.id ? 'text-primary' : 'text-foreground'}`}>
                                                        {plan.name}
                                                    </span>
                                                    <span className="mt-1 flex items-center text-xs text-muted-foreground">
                                                        {plan.locked ? "Próximamente" : plan.desc}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {plan.locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                                                    <span className={`font-medium ${!plan.locked && formData.selectedPlan === plan.id ? 'text-primary' : 'text-foreground'}`}>
                                                        {plan.price}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Check icon */}
                                            <div className={`ml-4 flex h-5 w-5 items-center justify-center rounded-full border ${
                                                !plan.locked && formData.selectedPlan === plan.id ? 'bg-primary border-primary text-white' : 'border-border'
                                            }`}>
                                                {!plan.locked && formData.selectedPlan === plan.id && <CheckCircle2 className="h-3 w-3" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 pt-4 border-t">
                                    <Button variant="outline" className="w-1/3 h-12" onClick={prevStep} disabled={loading}>
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
                                    </Button>
                                    <Button className="w-2/3 h-12" onClick={onSubmit} disabled={loading}>
                                        {loading ? (
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        ) : (
                                            "Crear Workspace"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}
