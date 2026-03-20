import {
    UserPlus,
    FileCheck,
    BellRing,
    ShieldCheck
} from "lucide-react";
import Stepper, { Step } from "@/components/bits/Stepper";

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
        <section id="how-it-works" className="py-24 sm:py-32 relative overflow-hidden bg-muted/50">
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

                <div className="mx-auto mt-16 max-w-6xl sm:mt-20 lg:mt-24">
                    <Stepper
                        initialStep={1}
                        fixedContentHeight={165}
                        backButtonText="Anterior"
                        nextButtonText="Siguiente"
                        stepCircleContainerClassName="max-w-xl bg-card/95"
                        stepContainerClassName="bg-card"
                        contentClassName="pb-8"
                        footerClassName="bg-card"
                    >
                        {steps.map((step) => (
                            <Step key={step.id}>
                                <div className="grid w-full items-center gap-7 md:grid-cols-[170px_1fr] md:text-left">
                                    <div className="flex flex-row justify-center items-center h-full border-r-2 border-primary/20 pr-7">
                                        <span className="text-6xl font-black leading-none text-primary/75 md:text-7xl">
                                            {step.id}
                                        </span>
                                        <div className="mt-3 flex h-24 w-24 items-center justify-center bg-card">
                                            <step.icon className="h-10 w-10 text-primary/75" aria-hidden="true" />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-semibold leading-tight text-foreground">
                                            {step.name}
                                        </h3>
                                        <p className="mt-4 text-lg leading-8 text-muted-foreground">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </Step>
                        ))}
                    </Stepper>
                </div>
            </div>
        </section>
    );
}
