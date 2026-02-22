"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addCertificateType, removeCertificateType } from "@/app/actions/settings";
import { Loader2 } from "lucide-react";

interface CertificateType {
    id: string;
    name: string;
}

interface CertificatesSettingsTabProps {
    companyId: string;
    companySlug: string;
    initialTypes: CertificateType[];
}

export function CertificatesSettingsTab({ companySlug, initialTypes }: CertificatesSettingsTabProps) {
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!inputValue.trim()) return;

        setLoading(true);
        const res = await addCertificateType(companySlug, inputValue.trim());
        if (res.error) {
            alert(res.error);
        } else {
            setInputValue("");
        }
        setLoading(false);
    };

    const handleRemove = async (id: string, name: string) => {
        if (!confirm(`¿Seguro que deseas eliminar el tipo de certificado "${name}"?`)) return;

        setLoading(true);
        const res = await removeCertificateType(companySlug, id);
        if (res.error) {
            alert(res.error);
        }
        setLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <Card className="border-border/50 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Tipos de Certificados Permitidos
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </CardTitle>
                <CardDescription>
                    Define la lista de los diferentes tipos de certificados que tu empresa maneja a nivel global.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex gap-2 max-w-md">
                        <Input
                            placeholder="Ej. Trabajo en Altura, SCTR..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />
                        <Button variant="secondary" onClick={handleAdd} disabled={loading || !inputValue.trim()}>Añadir</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 p-4 border rounded-md min-h-[100px] bg-muted/10">
                        {initialTypes.length === 0 ? (
                            <span className="text-sm text-muted-foreground italic truncate">No hay tipos de certificados definidos.</span>
                        ) : (
                            initialTypes.map((type) => (
                                <Badge key={type.id} variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 cursor-default">
                                    {type.name}
                                    <span
                                        className="ml-2 text-primary/50 hover:text-danger cursor-pointer px-1"
                                        onClick={() => handleRemove(type.id, type.name)}
                                    >
                                        ×
                                    </span>
                                </Badge>
                            ))
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
