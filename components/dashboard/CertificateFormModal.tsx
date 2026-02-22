"use client";

import { useState } from "react";
import { FilePlus, Save, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CertificateType {
    id: string;
    name: string;
}

interface CertificateFormModalProps {
    children?: React.ReactNode;
    preSelectedWorkerName?: string;
    preSelectedWorkerId?: string;
    certificateTypes?: CertificateType[];
}

export function CertificateFormModal({ children, preSelectedWorkerName, certificateTypes = [] }: CertificateFormModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // TODO: implement real submission to server action
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        // fake delay
        await new Promise(r => setTimeout(r, 1000));
        setLoading(false);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button>
                        <FilePlus className="mr-2 h-4 w-4" /> Nuevo Certificado
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Asignar Certificado</DialogTitle>
                        <DialogDescription>
                            Registra un nuevo expediente para {preSelectedWorkerName ? `el trabajador ${preSelectedWorkerName}` : "un trabajador"}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {!preSelectedWorkerName && (
                            <div className="space-y-2">
                                <Label htmlFor="workerSearch">Buscar Trabajador DNI/Nombre</Label>
                                <Input id="workerSearch" placeholder="Busca por Nombre o DNI..." required />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="certType">Tipo de Certificado</Label>
                            <select id="certType" name="certificateTypeId" required className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="" disabled selected>Seleccione un tipo...</option>
                                {certificateTypes.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                            {certificateTypes.length === 0 && (
                                <p className="text-xs text-danger mt-1">No hay tipos de certificados configurados en la empresa.</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="issueDt">Fecha de Emisión</Label>
                                <Input id="issueDt" name="issueDate" type="date" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expDt">Fecha de Vencimiento</Label>
                                <Input id="expDt" name="expirationDate" type="date" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="alertDays">Notificar vencimiento con anticipación de:</Label>
                            <div className="flex items-center gap-2">
                                <Input id="alertDays" name="notificationDaysBefore" type="number" defaultValue={15} className="w-20" required />
                                <span className="text-sm text-muted-foreground">días.</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancelar</Button>
                        <Button type="submit" disabled={loading || certificateTypes.length === 0}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Registrar Certificado
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
