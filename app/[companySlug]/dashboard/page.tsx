import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileText, AlertTriangle, CheckCircle2, TrendingUp, Clock, Activity } from "lucide-react";

export const metadata: Metadata = {
    title: "Overview - CertiFox",
};

export default function DashboardPage() {
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
                        <div className="text-2xl font-bold">1,248</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-success" />
                            <span className="text-success font-medium">+15.2%</span> que el mes pasado
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
                        <div className="text-2xl font-bold">3,542</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Activity className="h-3 w-3 text-muted-foreground" />
                            <span>Promedio 2.8 por trabajador</span>
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
                        <div className="text-2xl font-bold text-warning">142</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            En los próximos 30 días
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
                        <div className="text-2xl font-bold text-danger">34</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            Requiere acción inmediata
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>Vencimientos por Mes</CardTitle>
                        <CardDescription>
                            Proyección de certificados a renovar en los próximos 6 meses
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[250px] w-full bg-muted/10 rounded-md border border-dashed border-border flex items-center justify-center text-muted-foreground text-sm">
                            Gráfico de Vencimientos (Placeholder)
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>Timeline de Alertas</CardTitle>
                        <CardDescription>
                            Últimas notificaciones enviadas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {[
                                { worker: "Juan Pérez", desc: "Trabajo en Altura (vence en 5 días)", time: "Hace 2 horas", status: "warning" },
                                { worker: "María Gómez", desc: "Examen Médico (vencido)", time: "Ayer, 09:00 AM", status: "danger" },
                                { worker: "Carlos Ruiz", desc: "Manejo Defensivo (renovado)", time: "Hace 2 días", status: "success" },
                            ].map((alert, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className={`mt-0.5 rounded-full p-1.5 ${alert.status === 'warning' ? 'bg-warning/20 text-warning' : alert.status === 'danger' ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
                                        {alert.status === 'warning' ? <Clock className="h-3.5 w-3.5" /> : alert.status === 'danger' ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium leading-none">{alert.worker}</p>
                                        <p className="text-xs text-muted-foreground">{alert.desc}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">{alert.time}</p>
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
