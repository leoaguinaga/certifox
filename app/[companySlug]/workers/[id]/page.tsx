import Link from "next/link";
import { ArrowLeft, Edit, Trash2, ShieldCheck, Mail, Phone, FileText, CheckCircle2, Clock, AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CertificateFormModal } from "@/components/dashboard/CertificateFormModal";
import { WorkerProfileActions } from "@/components/dashboard/WorkerProfileActions";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

function getStatusBadge(status: "VALID" | "WARNING" | "EXPIRED" | "NO_CERTS") {
    switch (status) {
        case "VALID":
            return <Badge className="bg-success text-success-foreground hover:bg-success/80 gap-1"><CheckCircle2 className="h-3 w-3" /> Vigente</Badge>;
        case "WARNING":
            return <Badge className="bg-warning text-warning-foreground hover:bg-warning/80 gap-1"><Clock className="h-3 w-3" /> Por Vencer</Badge>;
        case "EXPIRED":
            return <Badge className="bg-danger text-danger-foreground hover:bg-danger/80 gap-1"><AlertTriangle className="h-3 w-3" /> Vencido</Badge>;
        case "NO_CERTS":
            return <Badge variant="secondary" className="gap-1">Sin Certificados</Badge>;
        default:
            return <Badge variant="secondary">Desconocido</Badge>;
    }
}

export default async function WorkerDetailsPage(props: { params: Promise<{ companySlug: string; id: string }> }) {
    const params = await props.params;
    const { companySlug, id } = params;

    const worker = await db.worker.findUnique({
        where: { id: id },
        include: {
            company: {
                include: { certificateTypes: true }
            },
            certificates: {
                where: { isArchived: false },
                orderBy: { expirationDate: "asc" },
                include: { certificateType: true }
            }
        }
    });

    if (!worker || !worker.isActive) {
        notFound();
    }

    if (worker.company.slug !== companySlug) {
        notFound();
    }

    const now = new Date();
    const warningDaysMs = worker.company.defaultNotificationDays * 24 * 60 * 60 * 1000;

    // Process certificates for display
    const certificates = worker.certificates.map(cert => {
        let status: "VALID" | "WARNING" | "EXPIRED" = "VALID";
        const diff = cert.expirationDate.getTime() - now.getTime();

        if (diff < 0) {
            status = "EXPIRED";
        } else if (diff <= (cert.notificationDaysBefore ? cert.notificationDaysBefore * 24 * 60 * 60 * 1000 : warningDaysMs)) {
            status = "WARNING";
        }

        return { ...cert, status };
    });

    // Calculate global status for the worker
    let globalStatus: "VALID" | "WARNING" | "EXPIRED" | "NO_CERTS" = "VALID";
    if (certificates.length === 0) {
        globalStatus = "NO_CERTS";
    } else if (certificates.some(c => c.status === "EXPIRED")) {
        globalStatus = "EXPIRED";
    } else if (certificates.some(c => c.status === "WARNING")) {
        globalStatus = "WARNING";
    }

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-6xl">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/${companySlug}/workers`}>
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        {worker.fullName}
                        {getStatusBadge(globalStatus)}
                    </h2>
                    <p className="text-muted-foreground mt-1">DNI: {worker.dni} • Ingresó el {worker.createdAt.toLocaleDateString()}</p>
                </div>

                <WorkerProfileActions worker={worker} companySlug={companySlug} />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Details */}
                <Card className="col-span-1 border-border/50 shadow-sm h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">Información del Trabajador</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                {worker.fullName.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold">{worker.position || "Sin cargo registrado"}</span>
                                <span className="text-xs text-muted-foreground">Cargo actual</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t space-y-3">
                            <div className="flex items-center gap-3 text-sm text-foreground">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                {worker.email || <span className="text-muted-foreground italic">No especificado</span>}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-foreground">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {worker.phone || <span className="text-muted-foreground italic">No especificado</span>}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-foreground">
                                <ShieldCheck className="h-4 w-4 text-success" />
                                {certificates.length} Certificados Registrados
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Certificates List */}
                <Card className="col-span-2 border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Certificados ({certificates.length})</CardTitle>
                            <CardDescription>Documentación vinculada al trabajador.</CardDescription>
                        </div>
                        <CertificateFormModal preSelectedWorkerName={worker.fullName} preSelectedWorkerId={worker.id} certificateTypes={worker.company.certificateTypes}>
                            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Asignar Nuevo</Button>
                        </CertificateFormModal>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="pl-6">Tipo / Nombre</TableHead>
                                    <TableHead>Emisión</TableHead>
                                    <TableHead>Vencimiento</TableHead>
                                    <TableHead className="text-right pr-6">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {certificates.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                            No hay certificados registrados para este trabajador.
                                        </TableCell>
                                    </TableRow>
                                ) : certificates.map(cert => (
                                    <TableRow key={cert.id}>
                                        <TableCell className="pl-6 font-medium">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{cert.certificateType.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{cert.issueDate ? cert.issueDate.toLocaleDateString() : "-"}</TableCell>
                                        <TableCell className="font-medium text-foreground">{cert.expirationDate.toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right pr-6">{getStatusBadge(cert.status)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
