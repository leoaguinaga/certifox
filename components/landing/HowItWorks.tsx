import {
    UserPlus,
    FileCheck,
    BellRing,
    ShieldCheck
} from "lucide-react";

export function HowItWorks() {
    const steps = [
        {
            id: 1,
            name: "Registra tu Empresa",
            description: "Crea tu cuenta de administrador y registra los datos de tu compañía.",
            icon: UserPlus,
        },
        {
            id: 2,
            name: "Configura tus Trabajadores y Certificados",
            description: "Añade a tu planilla y asocia sus certificados con las fechas de emisión y vencimiento.",
            icon: FileCheck,
        },
        {
            id: 3,
            name: "Define tus Reglas de Alerta",
            description: "Establece con cuántos días de anticipación deseas ser notificado antes de un vencimiento.",
            icon: BellRing,
        },
        {
            id: 4,
            name: "Mantén el Cumplimiento",
            description: "Recibe avisos automáticos y visualiza semáforos de estado para evitar riesgos.",
            icon: ShieldCheck,
        },
    ];

    return (
        <section id="how-it-works" className="py-24 sm:py-32 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary uppercase tracking-wider">Metodología</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Control total en 4 simples pasos
                    </p>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        Lleva el control exacto de las vigencias normativas de tu equipo sin complicaciones
                        ni burocracia manual.
                    </p>
                </div>

                <div className="mx-auto mt-16 max-w-5xl sm:mt-20 lg:mt-24">
                    <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-4 lg:gap-x-8">
                        {steps.map((step, index) => (
                            <div key={step.id} className="relative flex flex-col items-center text-center">
                                {/* Connecting Line */}
                                {index !== steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-[2.5rem] left-[60%] w-[80%] h-[2px] bg-border z-0" aria-hidden="true" />
                                )}

                                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-card shadow-md border border-border">
                                    <step.icon className="h-8 w-8 text-primary" aria-hidden="true" />
                                    <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-sm">
                                        {step.id}
                                    </div>
                                </div>

                                <h3 className="mt-6 text-xl font-semibold leading-7 text-foreground">
                                    {step.name}
                                </h3>
                                <p className="mt-3 text-base leading-7 text-muted-foreground">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
