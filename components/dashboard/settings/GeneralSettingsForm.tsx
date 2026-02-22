"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateCompanyGeneral } from "@/app/actions/settings";
import { Building2, Save, Loader2 } from "lucide-react";

interface GeneralSettingsFormProps {
    company: {
        id: string;
        name: string;
        ruc: string | null;
        email: string;
        slug: string;
    };
}

export function GeneralSettingsForm({ company }: GeneralSettingsFormProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        const formData = new FormData(e.currentTarget);
        const res = await updateCompanyGeneral(company.slug, formData);

        if (res.error) {
            setMessage({ type: "error", text: res.error });
        } else {
            setMessage({ type: "success", text: "Configuración actualizada correctamente." });
        }

        setLoading(false);
    };

    return (
        <Card className="border-border/50 shadow-sm">
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Perfil de Empresa</CardTitle>
                    <CardDescription>
                        Actualiza los datos públicos e internos de tu organización.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {message.text && (
                        <div className={`text-sm p-3 rounded-md border ${message.type === "error" ? "text-danger bg-danger/10 border-danger/20" : "text-success bg-success/10 border-success/20"}`}>
                            {message.text}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="companyName">Razón Social</Label>
                        <Input id="companyName" name="name" required defaultValue={company.name} className="max-w-md" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ruc">RUC</Label>
                        <Input id="ruc" name="ruc" defaultValue={company.ruc || ""} className="max-w-md" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Institucional</Label>
                        <Input id="email" name="email" type="email" required defaultValue={company.email} className="max-w-md" />
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                    <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Guardar Cambios
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
