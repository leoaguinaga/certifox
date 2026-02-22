import { Search, Plus, MoreHorizontal, FileText, CheckCircle2, AlertTriangle, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CertificateFormModal } from "@/components/dashboard/CertificateFormModal";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

function getStatusBadge(status: "VALID" | "WARNING" | "EXPIRED" | string) {
    switch (status) {
        case "VALID":
            return <Badge className="bg-success text-success-foreground hover:bg-success/80 gap-1"><CheckCircle2 className="h-3 w-3" /> Vigente</Badge>;
        case "WARNING":
            return <Badge className="bg-warning text-warning-foreground hover:bg-warning/80 gap-1"><Clock className="h-3 w-3" /> Por Vencer</Badge>;
        case "EXPIRED":
            return <Badge className="bg-danger text-danger-foreground hover:bg-danger/80 gap-1"><AlertTriangle className="h-3 w-3" /> Vencido</Badge>;
        default:
            return <Badge variant="secondary">Desconocido</Badge>;
    }
}

export default async function CertificatesPage(props: { params: Promise<{ companySlug: string }> }) {
    const params = await props.params;
    const { companySlug } = params;

    const company = await db.company.findUnique({
        where: { slug: companySlug },
        include: {
            certificateTypes: true,
            workers: {
                where: { isActive: true },
                select: { id: true, fullName: true, dni: true }
            }
        }
    });

    if (!company || !company.isActive) {
        notFound();
    }

    const certificatesData = await db.certificate.findMany({
        where: {
            worker: { companyId: company.id },
            isArchived: false,
        },
        include: {
            worker: { select: { fullName: true } },
            certificateType: true,
        },
        orderBy: { expirationDate: "asc" }
    });

    const now = new Date();
    const warningDaysMs = company.defaultNotificationDays * 24 * 60 * 60 * 1000;

    const certificates = certificatesData.map(cert => {
        let status: "VALID" | "WARNING" | "EXPIRED" = "VALID";
        const diff = cert.expirationDate.getTime() - now.getTime();

        if (diff < 0) {
            status = "EXPIRED";
        } else if (diff <= (cert.notificationDaysBefore ? cert.notificationDaysBefore * 24 * 60 * 60 * 1000 : warningDaysMs)) {
            status = "WARNING";
        }

        return { ...cert, status };
    });

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Certificados</h2>
                    <p className="text-muted-foreground mt-1">
                        Visualiza y administra todos los registros de certificaciones.
                    </p>
                </div>
                <CertificateFormModal certificateTypes={company.certificateTypes} workers={company.workers} />
            </div>

            <Card className="border-border/50 shadow-sm">
                <div className="p-4 border-b flex flex-col sm:flex-row items-center gap-4 justify-between bg-muted/20">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        {/* En el futuro esto puede ser un componente Cliente de filtrado real */}
                        <Input placeholder="Buscar por tipo o trabajador..." className="pl-9 h-9 bg-background" />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" className="h-9 w-full sm:w-auto bg-background">
                            <Filter className="mr-2 h-4 w-4 text-muted-foreground" /> Estado
                        </Button>
                    </div>
                </div>

                <CardContent className="p-0 overflow-x-auto">
                    <Table className="min-w-[800px]">
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="pl-6">Tipo de Certificado</TableHead>
                                <TableHead>Trabajador</TableHead>
                                <TableHead>Emisión</TableHead>
                                <TableHead>Vencimiento</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Regla de Alerta</TableHead>
                                <TableHead className="text-right pr-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {certificates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No hay certificados registrados.
                                    </TableCell>
                                </TableRow>
                            ) : certificates.map((cert) => (
                                <TableRow key={cert.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium text-primary pl-6">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {cert.certificateType.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{cert.worker.fullName}</TableCell>
                                    <TableCell className="text-muted-foreground">{cert.issueDate.toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium text-foreground">{cert.expirationDate.toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {getStatusBadge(cert.status)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {cert.notificationDaysBefore || company.defaultNotificationDays} días antes
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>Modificar Fechas</DropdownMenuItem>
                                                <DropdownMenuItem>Configurar Alerta</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-danger flex items-center justify-between">
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <div className="p-4 border-t text-sm text-muted-foreground flex justify-between items-center bg-muted/10">
                    <span>Mostrando {certificates.length} registros</span>
                </div>
            </Card>
        </div>
    );
}
