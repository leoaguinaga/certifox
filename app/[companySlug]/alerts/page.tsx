import { BellRing, Mail, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { TestEmailButton } from "@/components/dashboard/TestEmailButton";

export default async function AlertsPage(props: { params: Promise<{ companySlug: string }> }) {
    const params = await props.params;
    const { companySlug } = params;

    const company = await db.company.findUnique({
        where: { slug: companySlug },
        select: { id: true, email: true, name: true, isActive: true }
    });

    if (!company || !company.isActive) {
        notFound();
    }

    const alertsData = await db.notificationLog.findMany({
        where: {
            certificate: {
                worker: { companyId: company.id }
            }
        },
        include: {
            certificate: {
                include: {
                    worker: { select: { fullName: true } },
                    certificateType: { select: { name: true } }
                }
            }
        },
        orderBy: { sentAt: 'desc' },
        take: 50 // Show last 50 alerts
    });

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Historial de Alertas</h2>
                    <p className="text-muted-foreground mt-1">
                        Registro completo de notificaciones automáticas enviadas por el sistema.
                    </p>
                </div>
                <TestEmailButton companySlug={companySlug} />
            </div>

            <div className="bg-muted/50 border rounded-lg p-4 flex gap-3 text-sm text-muted-foreground items-start">
                <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                    <strong className="text-foreground">Información Importante:</strong> Las alertas de vencimiento de los certificados se escanean diariamente y se envían de forma automática al correo institucional <strong>{company.email}</strong> configurado en los Ajustes de Empresa.
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Registro de Envío (Logs)</CardTitle>
                        <CardDescription>Visualiza el resultado de las alertas preventivas (Warning) o críticas (Expired) enviadas a {company.email}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6 border-l-2 border-border ml-2 md:pl-8 pl-4 py-2">
                            {alertsData.length === 0 ? (
                                <p className="text-muted-foreground text-sm italic">No se han enviado alertas automáticas aún.</p>
                            ) : alertsData.map((alert) => (
                                <div key={alert.id} className="relative">
                                    {/* Timeline dot */}
                                    <div className="absolute -left-[2.1rem] md:-left-[2.6rem] top-1 h-4 w-4 rounded-full border-2 border-background bg-border">
                                        {alert.success ? (
                                            <div className="h-full w-full rounded-full bg-success"></div>
                                        ) : (
                                            <div className="h-full w-full rounded-full bg-danger"></div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-2">
                                            <div className="flex items-center gap-2">
                                                {alert.channel === "WHATSAPP" ? (
                                                    <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 gap-1 rounded-sm"><BellRing className="h-3 w-3" /> WhatsApp</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50 gap-1 rounded-sm"><Mail className="h-3 w-3" /> Email</Badge>
                                                )}

                                                {/* Badge para el tipo de alerta */}
                                                {alert.type === "EXPIRED" ? (
                                                    <Badge className="bg-danger hover:bg-danger text-danger-foreground text-[10px] px-1.5 h-5 rounded-sm">Vencido</Badge>
                                                ) : (
                                                    <Badge className="bg-warning hover:bg-warning text-warning-foreground text-[10px] px-1.5 h-5 rounded-sm">X Vencer</Badge>
                                                )}

                                                <span className="text-sm font-semibold">{alert.certificate.worker.fullName}</span>
                                                <span className="text-xs text-muted-foreground hidden sm:block">•</span>
                                                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {alert.sentAt.toLocaleString("es-ES", { dateStyle: 'short', timeStyle: 'short' })}
                                                </span>
                                            </div>
                                            <div>
                                                {alert.success ? (
                                                    <span className="flex items-center text-xs text-success font-medium gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Entregado</span>
                                                ) : (
                                                    <span className="flex items-center text-xs text-danger font-medium gap-1"><XCircle className="h-3.5 w-3.5" /> Falló</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-1">
                                            <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Certificado implicado:</span> {alert.certificate.certificateType.name}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
