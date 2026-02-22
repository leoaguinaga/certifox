import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, BellRing, Clock } from "lucide-react";

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-background pt-24 pb-32 text-center lg:pt-36 lg:pb-40">
            {/* Background decoration */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-10 bg-gradient-to-br from-primary to-accent rounded-full blur-3xl" />
            </div>

            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-6 flex justify-center">
                        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                            <span className="mr-2 flex h-2 w-2 rounded-full bg-primary"></span>
                            La plataforma #1 en gestión de certificados
                        </span>
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                        Control de <span className="text-primary">Vencimientos.</span> <br className="hidden sm:block" />
                        Prevención de <span className="text-danger">Riesgos.</span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
                        CertiFox es el SaaS B2B ideal para monitorear la vigencia de certificados laborales de tus trabajadores.
                        Evita multas, paralizaciones operativas y riesgos legales con notificaciones automáticas.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-primary hover:bg-primary/90 text-white shadow-lg" asChild>
                            <Link href="/register">
                                Comenzar ahora <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base border-border hover:bg-muted" asChild>
                            <Link href="#features">
                                Ver características
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-16 pt-8 border-t flex flex-wrap justify-center gap-x-12 gap-y-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2 font-medium">
                            <ShieldCheck className="h-5 w-5 text-success" />
                            <span>100% Seguro y Confiable</span>
                        </div>
                        <div className="flex items-center gap-2 font-medium">
                            <BellRing className="h-5 w-5 text-warning" />
                            <span>Alertas por WhatsApp</span>
                        </div>
                        <div className="flex items-center gap-2 font-medium">
                            <Clock className="h-5 w-5 text-primary" />
                            <span>Configuración en minutos</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
