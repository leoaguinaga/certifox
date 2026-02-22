import { ShieldAlert, BellRing, Users, Zap, CheckCircle2, FileText } from "lucide-react";

export function Features() {
    const features = [
        {
            name: "Alertas Automatizadas",
            description: "Recibe notificaciones automáticas por WhatsApp y Email antes de que los certificados venzan, evitando riesgos.",
            icon: BellRing,
        },
        {
            name: "Gestión Multi-Empresa",
            description: "Administra los certificados de todos los trabajadores divididos por empresa desde una sola plataforma SaaS.",
            icon: Users,
        },
        {
            name: "Trazabilidad Total",
            description: "Mantén un registro histórico de todas las notificaciones enviadas con validación de recepción.",
            icon: FileText,
        },
        {
            name: "Cálculo Dinámico",
            description: "El estado de cada certificado se calcula en tiempo real. Configura días previos de notificación a medida.",
            icon: Zap,
        },
        {
            name: "Prevención de Riesgos",
            description: "Evita multas y paralizaciones operativas asegurando el cumplimiento normativo en todo momento.",
            icon: ShieldAlert,
        },
        {
            name: "100% Validado",
            description: "Visualiza de manera rápida el estatus de todos los certificados con semáforos de riesgo claros.",
            icon: CheckCircle2,
        },
    ];

    return (
        <section id="features" className="bg-muted py-24 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary uppercase tracking-wider">Cumplimiento Normativo</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Todo lo que necesitas para tu tranquilidad
                    </p>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        CertiFox no es solo un registro, es un sistema inteligente. Diseñado específicamente para garantizar
                        que tus trabajadores mantengan todos sus certificados vigentes, siempre.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        {features.map((feature) => (
                            <div key={feature.name} className="flex flex-col bg-card rounded-2xl p-8 shadow-sm border border-border/50 hover:border-primary/50 transition-colors">
                                <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-foreground">
                                    <div className="rounded-lg bg-primary/10 p-2 ring-1 ring-primary/20">
                                        <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                                    </div>
                                    {feature.name}
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                                    <p className="flex-auto">{feature.description}</p>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
}
