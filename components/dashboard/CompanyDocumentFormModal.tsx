"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2 } from "lucide-react";
import { addCompanyDocument } from "@/app/actions/certificates";
import { toast } from "sonner";

interface CertificateType {
    id: string;
    name: string;
}

interface CompanyDocumentFormModalProps {
    certificateTypes: CertificateType[];
}

export function CompanyDocumentFormModal({ certificateTypes }: CompanyDocumentFormModalProps) {
    const params = useParams();
    const router = useRouter();
    const companySlug = params.companySlug as string;
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [useToday, setUseToday] = useState(true);
    const [useCustomExpiry, setUseCustomExpiry] = useState(false);
    const [expiryMonths, setExpiryMonths] = useState("12");

    const todayStr = new Date().toISOString().split("T")[0];

    const getExpirationDate = (issueDate: string, months: string) => {
        const d = new Date(issueDate);
        d.setMonth(d.getMonth() + parseInt(months));
        return d.toISOString().split("T")[0];
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        if (useToday) {
            formData.set("issueDate", todayStr);
        }

        if (!useCustomExpiry) {
            const issueDateStr = formData.get("issueDate") as string || todayStr;
            formData.set("expirationDate", getExpirationDate(issueDateStr, expiryMonths));
        }

        startTransition(async () => {
            const result = await addCompanyDocument(companySlug, formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Documento registrado exitosamente.");
                setOpen(false);
                router.refresh();
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Documento
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Registrar Documento Empresarial</DialogTitle>
                    <DialogDescription>
                        Documentos relevantes para la empresa que no están ligados a un trabajador (e.g., SOAT, pólizas).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                    <div>
                        <Label htmlFor="docLabel">Nombre / Etiqueta</Label>
                        <Input id="docLabel" name="label" required className="mt-1" placeholder="Ej: SOAT Camioneta ABC-123" />
                    </div>

                    <div>
                        <Label htmlFor="docCertType">Tipo de Documento</Label>
                        <select id="docCertType" name="certificateTypeId" required className="mt-1 w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="">Seleccione un tipo...</option>
                            {certificateTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Issue Date */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <Label>Fecha de Emisión</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Hoy</span>
                                <Switch checked={useToday} onCheckedChange={setUseToday} />
                            </div>
                        </div>
                        {!useToday && (
                            <Input type="date" name="issueDate" required className="mt-1" />
                        )}
                        {useToday && (
                            <p className="text-sm text-muted-foreground mt-1">{new Date().toLocaleDateString("es-ES", { dateStyle: "long" })}</p>
                        )}
                    </div>

                    {/* Expiration Date */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <Label>Fecha de Vencimiento</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Fecha exacta</span>
                                <Switch checked={useCustomExpiry} onCheckedChange={setUseCustomExpiry} />
                            </div>
                        </div>
                        {useCustomExpiry ? (
                            <Input type="date" name="expirationDate" required className="mt-1" />
                        ) : (
                            <div className="flex gap-2 mt-1">
                                {["1", "3", "6", "12"].map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setExpiryMonths(m)}
                                        className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${expiryMonths === m ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"}`}
                                    >
                                        {m} {parseInt(m) === 1 ? "mes" : "meses"}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="docNotifDays">Días antes para alerta</Label>
                        <Input id="docNotifDays" name="notificationDaysBefore" type="number" defaultValue={15} min={1} className="mt-1 w-24" />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Guardar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
