import { Search, FileText, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
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
import { WorkerFormModal } from "@/components/dashboard/WorkerFormModal";
import { WorkerRowActions } from "@/components/dashboard/WorkerRowActions";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

// Utility to calculate state
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

export default async function WorkersPage(props: { params: Promise<{ companySlug: string }> }) {
    const params = await props.params;
    const companySlug = params.companySlug;

    // Fetch company and its active workers
    const company = await db.company.findUnique({
        where: { slug: companySlug },
        include: {
            workers: {
                where: { isActive: true },
                include: {
                    certificates: {
                        where: { isArchived: false }
                    }
                },
                orderBy: { createdAt: "desc" }
            }
        }
    });

    if (!company) {
        notFound();
    }

    // Calculamos el estado de manera dinámica
    const workers = company.workers.map(worker => {
        let globalStatus: "VALID" | "WARNING" | "EXPIRED" | "NO_CERTS" = "VALID";
        const now = new Date();

        if (worker.certificates.length === 0) {
            globalStatus = "NO_CERTS";
        } else {
            // Find if any is Expired
            const hasExpired = worker.certificates.some(cert => cert.expirationDate < now);
            if (hasExpired) {
                globalStatus = "EXPIRED";
            } else {
                // Determine if any is Warning (e.g. less than 30 days or defaultNotificationDays)
                const warningDaysMs = company.defaultNotificationDays * 24 * 60 * 60 * 1000;
                const hasWarning = worker.certificates.some(cert => {
                    const diff = cert.expirationDate.getTime() - now.getTime();
                    return diff > 0 && diff <= (cert.notificationDaysBefore ? cert.notificationDaysBefore * 24 * 60 * 60 * 1000 : warningDaysMs);
                });

                if (hasWarning) {
                    globalStatus = "WARNING";
                }
            }
        }

        return {
            ...worker,
            globalStatus,
            certCount: worker.certificates.length
        };
    });

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Trabajadores</h2>
                    <p className="text-muted-foreground mt-1">
                        Gestiona tu plantilla y la salud de sus certificados.
                    </p>
                </div>
                <WorkerFormModal mode="create" />
            </div>

            <Card className="border-border/50 shadow-sm">
                <div className="p-4 border-b flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por DNI o Nombre..." className="pl-9 h-9" />
                    </div>
                </div>

                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[120px]">DNI</TableHead>
                                <TableHead>Trabajador</TableHead>
                                <TableHead>Puesto</TableHead>
                                <TableHead>Certificados</TableHead>
                                <TableHead>Estado Global</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {workers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No hay trabajadores registrados en la base de datos.
                                    </TableCell>
                                </TableRow>
                            ) : workers.map((worker) => (
                                <TableRow key={worker.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium">{worker.dni}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {worker.fullName.charAt(0)}
                                            </div>
                                            <span className="font-semibold">{worker.fullName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{worker.position || "-"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                                            <FileText className="h-4 w-4" />
                                            {worker.certCount}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(worker.globalStatus)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <WorkerRowActions worker={worker} companySlug={companySlug} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
