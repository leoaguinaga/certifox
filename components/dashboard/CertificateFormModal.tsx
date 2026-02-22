"use client";

import { useState, useMemo } from "react";
import { FilePlus, Save, Loader2, Check, ChevronsUpDown, CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { addCertificate } from "@/app/actions/certificates";

interface CertificateType {
    id: string;
    name: string;
}

interface WorkerBasic {
    id: string;
    fullName: string;
    dni: string;
}

interface CertificateFormModalProps {
    children?: React.ReactNode;
    preSelectedWorkerName?: string;
    preSelectedWorkerId?: string;
    certificateTypes?: CertificateType[];
    workers?: WorkerBasic[];
}

export function CertificateFormModal({ children, preSelectedWorkerName, preSelectedWorkerId, certificateTypes = [], workers = [] }: CertificateFormModalProps) {
    const params = useParams();
    const companySlug = params.companySlug as string;

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [workerId, setWorkerId] = useState<string>(preSelectedWorkerId || "");
    const [comboboxOpen, setComboboxOpen] = useState(false);

    // Emision Date Source (Toggle)
    const [useCurrentDate, setUseCurrentDate] = useState(true);
    const [issueDate, setIssueDate] = useState<Date | undefined>(new Date());

    // Expiration Date Source (Toggle)
    const [useManualExpDate, setUseManualExpDate] = useState(false);
    const [expMonths, setExpMonths] = useState<string>("12");
    const [expDate, setExpDate] = useState<Date | undefined>();

    const calculatedExpDate = useMemo(() => {
        if (useManualExpDate) return expDate;
        if (!issueDate) return undefined;
        return addMonths(issueDate, parseInt(expMonths) || 0);
    }, [useManualExpDate, expDate, issueDate, expMonths]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const finalExpiredDate = calculatedExpDate;
        if (!finalExpiredDate) {
            alert("Debe seleccionar una fecha de vencimiento válida.");
            return;
        }

        setLoading(true);
        const formData = new FormData(e.currentTarget);
        // Asegurar que usamos workerId de estado si estamos usando el Combobox o preSelected
        if (workerId) {
            formData.set("workerId", workerId);
        }

        const res = await addCertificate(companySlug, formData);

        if (res.error) {
            alert(res.error);
        } else {
            setOpen(false);
            // Optionally, we could reset the form state here
        }
        setLoading(false);
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
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Asignar Certificado</DialogTitle>
                        <DialogDescription>
                            Registra un nuevo expediente para {preSelectedWorkerName ? `el trabajador ${preSelectedWorkerName}` : "un trabajador"}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                        {!preSelectedWorkerName && (
                            <div className="space-y-2 flex flex-col">
                                <Label htmlFor="workerSearch">Trabajador</Label>
                                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={comboboxOpen}
                                            className="w-full justify-between font-normal"
                                        >
                                            {workerId
                                                ? workers.find((worker) => worker.id === workerId)?.fullName
                                                : "Seleccione un trabajador..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[450px] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Buscar por DNI o Nombre..." />
                                            <CommandList>
                                                <CommandEmpty>No se encontró ningún trabajador.</CommandEmpty>
                                                <CommandGroup>
                                                    {workers.map((worker) => (
                                                        <CommandItem
                                                            key={worker.id}
                                                            value={`${worker.dni} ${worker.fullName}`}
                                                            onSelect={() => {
                                                                setWorkerId(worker.id === workerId ? "" : worker.id)
                                                                setComboboxOpen(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    workerId === worker.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span>{worker.fullName}</span>
                                                                <span className="text-xs text-muted-foreground">DNI: {worker.dni}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <input type="hidden" name="workerId" value={workerId} required />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="certType">Tipo de Certificado</Label>
                            <select id="certType" name="certificateTypeId" required defaultValue="" className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="" disabled>Seleccione un tipo...</option>
                                {certificateTypes.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                            {certificateTypes.length === 0 && (
                                <p className="text-xs text-danger mt-1">No hay tipos de certificados configurados en la empresa.</p>
                            )}
                        </div>

                        {/* Emisión */}
                        <div className="space-y-3 p-3 border rounded-md bg-muted/20">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="issueDt" className="text-base font-semibold">Fecha de Emisión</Label>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="use-current-date"
                                        checked={useCurrentDate}
                                        onCheckedChange={(checked) => {
                                            setUseCurrentDate(checked);
                                            if (checked) setIssueDate(new Date());
                                        }}
                                    />
                                    <Label htmlFor="use-current-date" className="text-xs font-normal text-muted-foreground">Usar fecha actual</Label>
                                </div>
                            </div>

                            {!useCurrentDate ? (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !issueDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {issueDate ? format(issueDate, "PPP", { locale: es }) : <span>Seleccionar fecha...</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={issueDate}
                                            onSelect={setIssueDate}
                                            initialFocus
                                            locale={es}
                                        />
                                    </PopoverContent>
                                </Popover>
                            ) : (
                                <div className="text-sm font-medium border px-3 py-2 rounded-md bg-background/50 text-muted-foreground">
                                    {format(new Date(), "PPP", { locale: es })}
                                </div>
                            )}
                            <input type="hidden" name="issueDate" value={issueDate?.toISOString() || ""} />
                        </div>

                        {/* Vencimiento */}
                        <div className="space-y-3 p-3 border rounded-md bg-muted/20">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="expDt" className="text-base font-semibold">Fecha de Vencimiento</Label>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="use-manual-exp"
                                        checked={useManualExpDate}
                                        onCheckedChange={setUseManualExpDate}
                                    />
                                    <Label htmlFor="use-manual-exp" className="text-xs font-normal text-muted-foreground">Personalizar fecha</Label>
                                </div>
                            </div>

                            {!useManualExpDate ? (
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Vigencia desde emisión:</Label>
                                    <Select value={expMonths} onValueChange={setExpMonths}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Periodo de vigencia" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1 Mes</SelectItem>
                                            <SelectItem value="3">3 Meses</SelectItem>
                                            <SelectItem value="6">6 Meses</SelectItem>
                                            <SelectItem value="12">1 Año (12 Meses)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {calculatedExpDate && (
                                        <p className="text-xs text-primary font-medium mt-1">
                                            Vencerá el: {format(calculatedExpDate, "PPP", { locale: es })}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !expDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {expDate ? format(expDate, "PPP", { locale: es }) : <span>Seleccionar fecha específica...</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={expDate}
                                            onSelect={setExpDate}
                                            initialFocus
                                            locale={es}
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                            <input type="hidden" name="expirationDate" value={calculatedExpDate?.toISOString() || ""} />
                        </div>

                        {/* Alerta */}
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
                        <Button type="submit" disabled={loading || certificateTypes.length === 0 || (!preSelectedWorkerId && !workerId)}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Registrar Certificado
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
