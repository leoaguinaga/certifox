"use client";

import { useState } from "react";
import { FilePlus, Save } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CertificateFormModalProps {
    children?: React.ReactNode;
    preSelectedWorkerName?: string;
    preSelectedWorkerId?: string;
}

export function CertificateFormModal({ children, preSelectedWorkerName }: CertificateFormModalProps) {
    const [open, setOpen] = useState(false);

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
                            {/* En producción, este Input sería un Combobox usando un Command Palette para buscar en DB */}
                            <Input id="workerSearch" placeholder="Busca por Nombre o DNI..." />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="certType">Tipo de Certificado</Label>
                        {/* Opcionalmente un Combobox poblado con Settings -> Tipos de certificados permitidos */}
                        <select id="certType" className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                            <option>Examen Médico (EMO)</option>
                            <option>Trabajo en Altura</option>
                            <option>Manejo Defensivo</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="issueDt">Fecha de Emisión</Label>
                            <Input id="issueDt" type="date" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expDt">Fecha de Vencimiento</Label>
                            <Input id="expDt" type="date" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="alertDays">Notificar vencimiento con anticipación de:</Label>
                        <div className="flex items-center gap-2">
                            <Input id="alertDays" type="number" defaultValue={15} className="w-20" />
                            <span className="text-sm text-muted-foreground">días.</span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={() => setOpen(false)}>
                        <Save className="mr-2 h-4 w-4" /> Registrar Certificado
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
