import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, AlertTriangle, Clock, ShieldCheck, Bell } from "lucide-react";

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-28 pb-36 lg:pt-40 lg:pb-48">
            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
                {/* Headline block */}
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-[2.75rem] font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-6xl md:text-7xl">
                        Nunca más pierdas<br className="hidden sm:block" />
                        de vista un vencimiento.
                    </h1>

                    <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
                        La plataforma para monitorizar certificados laborales y documentos empresariales — con alertas automáticas antes de que sea tarde.
                    </p>

                    <div className="mt-10">
                        <Button size="lg" className="h-13 px-8 text-base rounded-full" asChild>
                            <Link href="/register">
                                Comenzar gratis <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Floating product cards */}
                <div className="relative mt-24 mx-auto max-w-4xl">
                    {/* Card 1 — Top left: Worker status */}
                    <div className="absolute -left-4 top-0 sm:left-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                        <div className="rounded-xl border border-border bg-card p-4 shadow-lg w-[260px]">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                    CM
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Carlos Mendoza</p>
                                    <p className="text-xs text-muted-foreground">Operador de Maquinaria</p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">3 certificados</span>
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                                    <CheckCircle2 className="h-3 w-3" /> Vigente
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 — Center: Alert notification */}
                    <div className="flex justify-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
                        <div className="rounded-xl border border-border bg-card p-4 shadow-lg w-[300px]">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center">
                                    <Bell className="h-4 w-4 text-warning" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-foreground">Alerta Automática</p>
                                    <p className="text-xs text-muted-foreground">Enviada a admin@empresa.com</p>
                                </div>
                            </div>
                            <div className="mt-3 rounded-lg bg-muted/50 p-3">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    El certificado <span className="font-medium text-foreground">SCTR Salud</span> de <span className="font-medium text-foreground">Ana Ríos</span> vence en <span className="font-semibold text-warning">5 días</span>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card 3 — Bottom right: Expired doc */}
                    <div className="absolute -right-4 -bottom-4 sm:right-8 sm:bottom-0 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700">
                        <div className="rounded-xl border border-border bg-card p-4 shadow-lg w-[240px]">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Documento</span>
                            </div>
                            <p className="text-sm font-semibold text-foreground">SOAT — Camioneta</p>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" /> 12 Mar 2026
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-danger">
                                    <AlertTriangle className="h-3 w-3" /> Vencido
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
