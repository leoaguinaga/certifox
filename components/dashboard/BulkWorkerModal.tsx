"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { UserPlus, Plus, Trash2, Loader2 } from "lucide-react";
import { addBulkWorkers } from "@/app/actions/workers";
import { toast } from "sonner";

interface RowData {
    dni: string;
    fullName: string;
    position: string;
}

const emptyRow: RowData = { dni: "", fullName: "", position: "" };

export function BulkWorkerModal() {
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
        // Filter out empty rows
        const validRows = rows.filter(r => r.dni.trim() && r.fullName.trim());
        if (validRows.length === 0) {
            toast.error("Agrega al menos un trabajador con DNI y nombre.");
            return;
        }

        startTransition(async () => {
            const result = await addBulkWorkers(companySlug, validRows);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`${result.count} trabajador(es) registrado(s) exitosamente.`);
                setOpen(false);
                setRows([{ ...emptyRow }, { ...emptyRow }, { ...emptyRow }]);
                router.refresh();
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Registrar Varios
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Registro Masivo de Trabajadores</DialogTitle>
                    <DialogDescription>
                        Completa los datos de cada trabajador. Las filas vacías se ignorarán.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-4">
                    {/* Header */}
                    <div className="grid grid-cols-[1fr_1.5fr_1fr_40px] gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                        <span>DNI</span>
                        <span>Nombre Completo</span>
                        <span>Puesto</span>
                        <span></span>
                    </div>

                    {/* Rows */}
                    {rows.map((row, i) => (
                        <div key={i} className="grid grid-cols-[1fr_1.5fr_1fr_40px] gap-2 items-center">
                            <Input
                                placeholder="12345678"
                                value={row.dni}
                                onChange={(e) => updateRow(i, "dni", e.target.value)}
                                className="h-9 text-sm"
                            />
                            <Input
                                placeholder="Nombre Apellido"
                                value={row.fullName}
                                onChange={(e) => updateRow(i, "fullName", e.target.value)}
                                className="h-9 text-sm"
                            />
                            <Input
                                placeholder="Cargo"
                                value={row.position}
                                onChange={(e) => updateRow(i, "position", e.target.value)}
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
                        Registrar {rows.filter(r => r.dni && r.fullName).length} Trabajadores
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
