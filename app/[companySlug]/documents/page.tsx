import { FolderOpen, Clock, AlertTriangle, CheckCircle2, MoreHorizontal, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CompanyDocumentFormModal } from "@/components/dashboard/CompanyDocumentFormModal";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

function getDocStatus(expirationDate: Date, notifDays: number) {
    const now = new Date();
    const diffMs = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { label: "Vencido", color: "text-danger", bg: "bg-danger/10", icon: AlertTriangle };
    if (diffDays <= notifDays) return { label: `${diffDays}d restantes`, color: "text-warning", bg: "bg-warning/10", icon: Clock };
    return { label: "Vigente", color: "text-success", bg: "bg-success/10", icon: CheckCircle2 };
}

export default async function DocumentsPage(props: { params: Promise<{ companySlug: string }> }) {
    const params = await props.params;
    const { companySlug } = params;

    const company = await db.company.findUnique({
        where: { slug: companySlug },
        select: {
            id: true,
            isActive: true,
            name: true,
            defaultNotificationDays: true,
            certificateTypes: { select: { id: true, name: true } },
        }
    });

    if (!company || !company.isActive) {
        notFound();
    }

    const documents = await db.companyDocument.findMany({
        where: { companyId: company.id, isArchived: false },
        include: { certificateType: true },
        orderBy: { expirationDate: "asc" },
    });

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Documentos Empresariales</h2>
                    <p className="text-muted-foreground mt-1">
                        Documentos importantes de la empresa que no están ligados a un trabajador específico.
                    </p>
                </div>
                <CompanyDocumentFormModal certificateTypes={company.certificateTypes} />
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FolderOpen className="h-5 w-5 text-primary" />
                        Todos los Documentos
                        <Badge variant="secondary" className="ml-2">{documents.length}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <FolderOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
                            <h3 className="font-semibold text-lg text-foreground">Sin documentos registrados</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                Registra documentos como SOAT, pólizas de seguro o licencias de funcionamiento para monitorear sus vencimientos.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Documento</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Emisión</TableHead>
                                    <TableHead>Vencimiento</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.map((doc) => {
                                    const status = getDocStatus(doc.expirationDate, doc.notificationDaysBefore ?? company.defaultNotificationDays);
                                    const StatusIcon = status.icon;
                                    return (
                                        <TableRow key={doc.id}>
                                            <TableCell className="font-medium">{doc.label}</TableCell>
                                            <TableCell className="text-muted-foreground">{doc.certificateType.name}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {doc.issueDate.toLocaleDateString("es-ES", { dateStyle: "medium" })}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {doc.expirationDate.toLocaleDateString("es-ES", { dateStyle: "medium" })}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${status.color}`}>
                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                    {status.label}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
