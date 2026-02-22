"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

// Mocks for plans in Step 3
const plans = [
    { id: "starter", name: "Starter", price: "$49/mes", desc: "Hasta 50 trabajadores" },
    { id: "professional", name: "Professional", price: "$99/mes", desc: "Hasta 250 trabajadores" },
    { id: "enterprise", name: "Enterprise", price: "Custom", desc: "Ilimitado" },
];

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form states
    const [formData, setFormData] = useState({
        userName: "",
        userEmail: "",
        userPassword: "",
        companyName: "",
        companyRuc: "",
        companySlug: "", // Generado o ingresado
        selectedPlan: "starter",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            // Auto-generate slug from company name if step 2 and field is companyName
            if (name === "companyName" && step === 2 && !prev.companySlug) {
                newData.companySlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            }
            return newData;
        });
    };

    const setPlan = (planId: string) => {
        setFormData(prev => ({ ...prev, selectedPlan: planId }));
    };

    const nextStep = () => {
        setError("");
        if (step === 1) {
            if (!formData.userName || !formData.userEmail || formData.userPassword.length < 6) {
                setError("Por favor completa todos los campos. La contraseña debe tener al menos 6 caracteres.");
                return;
            }
        } else if (step === 2) {
            if (!formData.companyName || !formData.companySlug) {
                setError("El nombre de la empresa y el URL identificador (slug) son obligatorios.");
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
            // 1. Aquí iría la llamada a un endpoint propio (por ejemplo POST /api/register) 
            // que se encargue de crear el Company y posteriormente llamar a auth.signUp()
            // pasándole el companyId generado.
            // 
            // Dado que el MVP en este paso se enfoca en la maqueta de selección de plan
            // y la lógica de negocio real requerirá un API route, simulamos el registro.

            // Mock implementation just to show the Flow working
            await new Promise(resolve => setTimeout(resolve, 2000));

            // router.push(`/${formData.companySlug}/dashboard`);
            router.push(`/demo-company/dashboard`);

        } catch (err: any) {
            setError(err.message || "Ocurrió un error al registrar la empresa.");
        } finally {
            if (error) setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-muted/30">
            {/* Header minimalista */}
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
                    <div className="mb-8">
                        <div className="flex items-center justify-between relative">
                            <div className="absolute left-0 top-1/2 w-full h-1 bg-border -z-10 -translate-y-1/2"></div>
                            <div className="absolute left-0 top-1/2 h-1 bg-primary -z-10 -translate-y-1/2 transition-all duration-300" style={{ width: `${(step - 1) * 50}%` }}></div>

                            {[1, 2, 3].map((num) => (
                                <div key={num} className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${step >= num ? 'bg-primary border-primary text-white' : 'bg-background border-border text-muted-foreground'
                                    }`}>
                                    {step > num ? <CheckCircle2 className="h-5 w-5" /> : num}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-semibold text-muted-foreground">
                            <span>Administrador</span>
                            <span>Empresa</span>
                            <span>Plan</span>
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
                                        <Label htmlFor="userEmail">Correo Electrónico (Trabajo)</Label>
                                        <Input id="userEmail" name="userEmail" type="email" required placeholder="juan@tuempresa.com" value={formData.userEmail} onChange={handleChange} className="mt-1.5" />
                                    </div>
                                    <div>
                                        <Label htmlFor="userPassword">Contraseña</Label>
                                        <Input id="userPassword" name="userPassword" type="password" required className="mt-1.5" value={formData.userPassword} onChange={handleChange} />
                                        <p className="text-xs text-muted-foreground mt-2">Mínimo 6 caracteres.</p>
                                    </div>
                                </div>
                                <Button className="w-full h-12" onClick={nextStep}>
                                    Siguiente <ArrowRight className="ml-2 h-4 w-4" />
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
                                                className="rounded-l-none border-l-0 focus-visible:ring-0 focus-visible:border-primary px-3"
                                                placeholder="tu-empresa"
                                                value={formData.companySlug}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="outline" className="w-1/3 h-12" onClick={prevStep}>
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
                                    </Button>
                                    <Button className="w-2/3 h-12" onClick={nextStep}>
                                        Siguiente <ArrowRight className="ml-2 h-4 w-4" />
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
                                            onClick={() => setPlan(plan.id)}
                                            className={`relative flex cursor-pointer rounded-xl p-4 border-2 transition-all ${formData.selectedPlan === plan.id ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'
                                                }`}
                                        >
                                            <div className="flex flex-1 items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className={`block text-sm font-semibold ${formData.selectedPlan === plan.id ? 'text-primary' : 'text-foreground'}`}>
                                                        {plan.name}
                                                    </span>
                                                    <span className="mt-1 flex items-center text-xs text-muted-foreground">
                                                        {plan.desc}
                                                    </span>
                                                </div>
                                                <div className={`font-medium ${formData.selectedPlan === plan.id ? 'text-primary' : 'text-foreground'}`}>
                                                    {plan.price}
                                                </div>
                                            </div>
                                            {/* Check icon */}
                                            <div className={`ml-4 flex h-5 w-5 items-center justify-center rounded-full border ${formData.selectedPlan === plan.id ? 'bg-primary border-primary text-white' : 'border-border'
                                                }`}>
                                                {formData.selectedPlan === plan.id && <CheckCircle2 className="h-3 w-3" />}
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
