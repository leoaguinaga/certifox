import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileText, AlertTriangle, CheckCircle2, TrendingUp, Clock, Activity, BellRing } from "lucide-react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { DashboardChart } from "@/components/dashboard/DashboardChart";

export const metadata: Metadata = {
    title: "Overview - CertiFox",
};

export default async function DashboardPage(props: { params: Promise<{ companySlug: string }> }) {
    const params = await props.params;
    const { companySlug } = params;

    const company = await db.company.findUnique({
        where: { slug: companySlug },
        include: {
            workers: { where: { isActive: true } },
            appAlerts: { orderBy: { createdAt: 'desc' }, take: 5 }
        }
    });

    if (!company || !company.isActive) {
        notFound();
    }

    // Process Certificates to Calculate KPIs
    const certificates = await db.certificate.findMany({
        where: {
            isArchived: false,
            worker: { companyId: company.id, isActive: true }
        }
    });

    const now = new Date();
    let warningCount = 0;
    let expiredCount = 0;

    certificates.forEach(cert => {
        const thresholdDays = cert.notificationDaysBefore ?? company.defaultNotificationDays;
        const diffMs = cert.expirationDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            expiredCount++;
        } else if (diffDays <= thresholdDays) {
            warningCount++;
        }
    });

    const totalWorkers = company.workers.length;
    const totalCertificates = certificates.length;
    const avgCertsPerWorker = totalWorkers > 0 ? (totalCertificates / totalWorkers).toFixed(1) : "0.0";
    const validCount = totalCertificates - (warningCount + expiredCount);

    return (
        <div className="p-6 md:p-8 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
                <p className="text-muted-foreground mt-2">Bienvenido de vuelta, aquí está el resumen de tu empresa.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border/50 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Trabajadores
                        </CardTitle>
                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalWorkers}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <span className="font-medium">Personal activo</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Certificados
                        </CardTitle>
                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <FileText className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCertificates}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Activity className="h-3 w-3 text-muted-foreground" />
                            <span>Promedio {avgCertsPerWorker} por trabajador</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Próximos a Vencer
                        </CardTitle>
                        <div className="h-8 w-8 bg-warning/10 rounded-full flex items-center justify-center">
                            <Clock className="h-4 w-4 text-warning" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-warning">{warningCount}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            Días críticos cercanos
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Vencidos Inactivos
                        </CardTitle>
                        <div className="h-8 w-8 bg-danger/10 rounded-full flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-danger" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-danger">{expiredCount}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            Requiere acción inmediata
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>Estado Actual</CardTitle>
                        <CardDescription>
                            Distribución de vigencia en tus {totalCertificates} certificados registrados.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <DashboardChart
                            validCount={validCount}
                            warningCount={warningCount}
                            expiredCount={expiredCount}
                        />
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>Últimas Alertas de la App</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {company.appAlerts.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">No hay alertas in-app recientes.</p>
                            ) : company.appAlerts.map(alert => (
                                <div key={alert.id} className="flex items-start gap-4">
                                    <div className={`mt-0.5 rounded-full p-1.5 bg-primary/10 text-primary`}>
                                        <BellRing className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium leading-none">{alert.title}</p>
                                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {alert.createdAt.toLocaleDateString('es-ES')}
                                        </p>
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
