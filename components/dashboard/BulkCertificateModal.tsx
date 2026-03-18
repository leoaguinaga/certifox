"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilePlus2, Plus, Trash2, Loader2 } from "lucide-react";
import { addBulkCertificates } from "@/app/actions/certificates";
import { toast } from "sonner";

interface CertificateType {
    id: string;
    name: string;
}

interface Worker {
    id: string;
    fullName: string;
    dni: string;
}

interface RowData {
    workerId: string;
    certificateTypeId: string;
    issueDate: string;
    expirationDate: string;
}

const emptyRow: RowData = { workerId: "", certificateTypeId: "", issueDate: "", expirationDate: "" };

interface BulkCertificateModalProps {
    certificateTypes: CertificateType[];
    workers: Worker[];
}

export function BulkCertificateModal({ certificateTypes, workers }: BulkCertificateModalProps) {
    const params = useParams();
    const router = useRouter();
    const companySlug = params.companySlug as string;
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [rows, setRows] = useState<RowData[]>([{ ...emptyRow }, { ...emptyRow }, { ...emptyRow }]);

    const addRow = () => setRows(prev => [...prev, { ...emptyRow }]);

    const removeRow = (index: number) => {
        if (rows.length <= 1) return;
        setRows(prev => prev.filter((_, i) => i !== index));
    };

    const updateRow = (index: number, field: keyof RowData, value: string) => {
        setRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
    };

    const handleSubmit = () => {
        const validRows = rows.filter(r => r.workerId && r.certificateTypeId && r.issueDate && r.expirationDate);
        if (validRows.length === 0) {
            toast.error("Completa al menos una fila con todos los campos.");
            return;
        }

        startTransition(async () => {
            const result = await addBulkCertificates(companySlug, validRows);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`${result.count} certificado(s) registrado(s) exitosamente.`);
                setOpen(false);
                setRows([{ ...emptyRow }, { ...emptyRow }, { ...emptyRow }]);
                router.refresh();
            }
        });
    };

    const todayStr = new Date().toISOString().split("T")[0];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <FilePlus2 className="h-4 w-4" />
                    Registrar Varios
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[850px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Registro Masivo de Certificados</DialogTitle>
                    <DialogDescription>
                        Asigna certificados a varios trabajadores de una sola vez. Las filas incompletas se ignorarán.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-4">
                    {/* Header */}
                    <div className="grid grid-cols-[1.2fr_1.2fr_0.8fr_0.8fr_40px] gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                        <span>Trabajador</span>
                        <span>Tipo Certificado</span>
                        <span>Emisión</span>
                        <span>Vencimiento</span>
                        <span></span>
                    </div>

                    {/* Rows */}
                    {rows.map((row, i) => (
                        <div key={i} className="grid grid-cols-[1.2fr_1.2fr_0.8fr_0.8fr_40px] gap-2 items-center">
                            <Select value={row.workerId} onValueChange={(v) => updateRow(i, "workerId", v)}>
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {workers.map(w => (
                                        <SelectItem key={w.id} value={w.id}>{w.fullName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={row.certificateTypeId} onValueChange={(v) => updateRow(i, "certificateTypeId", v)}>
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {certificateTypes.map(ct => (
                                        <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="date"
                                value={row.issueDate}
                                onChange={(e) => updateRow(i, "issueDate", e.target.value)}
                                className="h-9 text-sm"
                            />
                            <Input
                                type="date"
                                value={row.expirationDate}
                                onChange={(e) => updateRow(i, "expirationDate", e.target.value)}
                                className="h-9 text-sm"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground hover:text-danger"
                                onClick={() => removeRow(i)}
                                disabled={rows.length <= 1}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}

                    <Button variant="outline" size="sm" onClick={addRow} className="w-full gap-2 border-dashed">
                        <Plus className="h-4 w-4" /> Agregar Fila
                    </Button>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Registrar {rows.filter(r => r.workerId && r.certificateTypeId && r.issueDate && r.expirationDate).length} Certificados
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
