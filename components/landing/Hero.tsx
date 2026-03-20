import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import SpotlightCard from "@/components/bits/SpotlightCard";
import Particles from "@/components/bits/Particles";
import {
    ArrowRight,
    Bell,
    Building2,
    ChevronDown,
    ChevronRight,
    Ellipsis,
    Factory,
    HardHat,
    Mail,
    MessageCircle,
    MessageSquare,
    Plus,
    ShieldCheck,
    Truck,
} from "lucide-react";
import StarBorder from "../bits/StarBorder";

const workers = [
    {
        initials: "CM",
        name: "Carlos Mendoza",
        role: "Operador",
        cert: "SOAT",
        due: "12 Mar 2026",
        status: "Vigente",
        tone: "green",
    },
    {
        initials: "AR",
        name: "Ana Rios",
        role: "Prevencionista",
        cert: "SCTR",
        due: "5 May 2025",
        status: "Proximo",
        tone: "amber",
    },
    {
        initials: "LT",
        name: "Luis Torres",
        role: "Electricista",
        cert: "ALTURA",
        due: "20 Abr 2025",
        status: "Critico",
        tone: "red",
    },
];

const companies = [
    { name: "Constructora Andina", workers: 42, icon: HardHat },
    { name: "Transportes Sur", workers: 28, icon: Truck },
    { name: "Industrias del Norte", workers: 15, icon: Factory },
    { name: "Logistica Pro", workers: 9, icon: Building2 },
];

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-[#f8fbff] pt-28 pb-36 lg:pt-40 lg:pb-48">
            <div className="absolute inset-0">
                <Particles
                    className="pointer-events-auto h-full w-full opacity-100"
                    particleCount={240}
                    particleSpread={12}
                    speed={0.03}
                    particleColors={["#1e3a8a", "#3b82f6", "#38bdf8"]}
                    moveParticlesOnHover
                    particleHoverFactor={0.75}
                    alphaParticles
                    particleBaseSize={480}
                    sizeRandomness={0.9}
                    cameraDistance={24}
                    disableRotation={false}
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_10%,rgba(255,255,255,0.18),rgba(248,251,255,0.36)_55%,rgba(248,251,255,0.55)_100%)]" />
            </div>
            
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

                    <div className="mt-10 overflow-visible">
                        <StarBorder
                            as="button"
                            color="#2563eb"
                            speed="2.5s"
                            thickness={2.5}
                            className="mx-auto w-max cursor-pointer"
                        >
                            <span className="inline-flex items-center gap-2 rounded-full">
                                Comenzar gratis <ArrowRight className="ml-2 h-5 w-5" />
                            </span>
                        </StarBorder>
                    </div>
                </div>

                {/* Product preview */}
                <div className="relative mt-20 mx-auto max-w-305 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="pointer-events-none absolute -left-16 top-20 h-24 w-14 bg-[radial-gradient(circle,rgba(37,99,235,0.35)_1.5px,transparent_1.5px)] bg-size-[10px_10px]" />
                    <div className="pointer-events-none absolute -right-10 top-24 h-24 w-14 bg-[radial-gradient(circle,rgba(239,68,68,0.35)_1.5px,transparent_1.5px)] bg-size-[10px_10px]" />
                    <div className="pointer-events-none absolute left-[32%] top-[68%] h-20 w-20 bg-[radial-gradient(circle,rgba(37,99,235,0.24)_1.5px,transparent_1.5px)] bg-size-[9px_9px]" />
                    <div className="pointer-events-none absolute -left-8 top-40 h-20 w-16 rounded-l-full border-l-2 border-dashed border-blue-300/60" />
                    <div className="pointer-events-none absolute -right-6 top-44 h-20 w-16 rounded-r-full border-r-2 border-dashed border-red-300/60" />
                    <div className="pointer-events-none absolute inset-x-[18%] bottom-0 h-32 bg-[radial-gradient(60%_85%_at_50%_100%,rgba(59,130,246,0.16),transparent_70%)]" />

                    <div className="relative flex flex-col gap-4 lg:block lg:h-140">
                        <SpotlightCard
                            className="relative mt-3 h-fit rounded-[22px] border border-slate-200 bg-white p-0 shadow-[0_18px_45px_rgba(30,64,175,0.12)] lg:absolute lg:left-0 lg:top-10 lg:mt-0 lg:w-[41.5%] lg:-rotate-[0.75deg]"
                            spotlightColor="rgba(59, 130, 246, 0.18)"
                        >
                            <Card className="border-0 bg-transparent shadow-none">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                                <ShieldCheck className="h-5 w-5" />
                                            </div>
                                            <p className="text-[1.05rem] font-semibold text-slate-900">Cumplimiento Normativo</p>
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">100% Validado</Badge>
                                    </div>

                                    <div className="mt-4 grid grid-cols-[1.6fr_1fr_1fr_1fr] px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                        <span>Trabajador</span>
                                        <span>Certificado</span>
                                        <span>Vence en</span>
                                        <span>Estado</span>
                                    </div>

                                    <div className="mt-2 space-y-2">
                                        {workers.map((worker) => (
                                            <div key={worker.name} className="grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-300 text-[10px] font-semibold text-slate-600">{worker.initials}</div>
                                                    <div>
                                                        <p className="text-sm font-semibold leading-none text-slate-900">{worker.name}</p>
                                                        <p className="mt-1 text-xs leading-none text-slate-500">{worker.role}</p>
                                                    </div>
                                                </div>

                                                <span className="w-fit rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-blue-700">{worker.cert}</span>
                                                <span className="text-xs font-medium text-slate-600">{worker.due}</span>
                                                <span
                                                    className={
                                                        worker.tone === "green"
                                                            ? "text-xs font-semibold text-emerald-600"
                                                            : worker.tone === "amber"
                                                              ? "text-xs font-semibold text-amber-600"
                                                              : "text-xs font-semibold text-red-600"
                                                    }
                                                >
                                                    {worker.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
                                        Ver todos los certificados <ArrowRight className="h-4 w-4" />
                                    </button>
                                </CardContent>
                            </Card>
                        </SpotlightCard>

                        <SpotlightCard
                            className="relative z-10 overflow-visible rounded-[26px] border border-slate-200 bg-[linear-gradient(160deg,#0f3b7a_0%,#0b1f4f_45%,#09162f_100%)] p-0 shadow-[0_22px_50px_rgba(15,23,42,0.28)] lg:absolute lg:left-1/2 lg:top-1 lg:w-[31.5%] lg:-translate-x-1/2"
                            spotlightColor="rgba(96, 165, 250, 0.22)"
                        >
                            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.38),transparent_60%)]" />
                            <div className="pointer-events-none absolute right-2 top-4 h-28 w-36 bg-[repeating-radial-gradient(circle_at_100%_0%,rgba(148,197,255,0.24)_0px,rgba(148,197,255,0.24)_1px,transparent_1px,transparent_7px)] opacity-70" />
                            <div className="pointer-events-none absolute bottom-36 right-0 h-28 w-24 bg-[radial-gradient(circle_at_right,rgba(16,185,129,0.35),transparent_72%)]" />

                            <Card className="border-0 bg-transparent shadow-none">
                                <CardContent className="p-0">
                                    <div className="relative text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-b from-blue-500/45 to-blue-700/35 shadow-[0_8px_18px_rgba(37,99,235,0.35)]">
                                            <Bell className="h-5 w-5" />
                                            </div>
                                            <p className="text-[2rem] font-semibold">Alertas Automatizadas</p>
                                        </div>

                                        <div className="relative mt-5 space-y-2.5 pl-8 w-full">
                                            <div className="pointer-events-none absolute left-2 top-2 h-[calc(100%-20px)] w-px bg-linear-to-b from-emerald-300/70 via-sky-300/55 to-blue-400/60" />

                                            <div className="relative rounded-2xl border border-white/10 bg-white/10 px-3.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                                <div className="pointer-events-none absolute -left-8.5 top-3.5 h-5 w-5 rounded-full border-2 border-emerald-300/80 bg-emerald-300/95 shadow-[0_0_14px_rgba(16,185,129,0.6)]" />
                                                <p className="font-medium">
                                                    <MessageCircle className="mr-1.5 inline h-4 w-4 text-green-300" />WhatsApp - Ahora
                                                </p>
                                                <div className="mt-1 flex items-center justify-between gap-2">
                                                    <p className="text-sm text-blue-100">Recordatorio: 3 certificados por vencer</p>
                                                    <Badge className="h-5 rounded-full bg-red-500/85 px-2 text-[10px] text-white hover:bg-red-500/85">En dias</Badge>
                                                </div>
                                            </div>

                                            <div className="relative rounded-2xl border border-white/10 bg-white/10 px-3.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                                <div className="pointer-events-none absolute -left-8.5 top-3.5 h-5 w-5 rounded-full border-2 border-amber-300/85 bg-amber-300/95 shadow-[0_0_12px_rgba(250,204,21,0.55)]" />
                                                <p className="font-medium">
                                                    <Mail className="mr-1.5 inline h-4 w-4 text-sky-300" />Email - Hace 2 dias
                                                </p>
                                                <p className="mt-1 text-sm text-blue-100">Ana Rios - SCTR vence en <span className="font-semibold text-amber-300">5 dias</span></p>
                                            </div>

                                            <div className="relative rounded-2xl border border-white/10 bg-white/10 px-3.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                                <div className="pointer-events-none absolute -left-8.5 top-3.5 h-5 w-5 rounded-full border-2 border-sky-300/85 bg-sky-300/95 shadow-[0_0_12px_rgba(56,189,248,0.55)]" />
                                                <p className="font-medium">
                                                    <MessageSquare className="mr-1.5 inline h-4 w-4 text-blue-300" />SMS - Hace 1 semana
                                                </p>
                                                <p className="mt-1 text-sm text-blue-100">Luis Torres - Altura renovado <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded bg-emerald-500 text-[10px] font-bold">✓</span></p>
                                            </div>
                                        </div>

                                        <div className="absolute -bottom-52 left-0 right-0 z-20 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_16px_34px_rgba(15,23,42,0.16)]">
                                            <div className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-[0_8px_18px_rgba(15,23,42,0.06)]">
                                                <div className="h-11 w-11 rounded-full border-[5px] border-emerald-500 border-r-emerald-200" />
                                                <div>
                                                    <p className="text-[2rem] font-bold leading-none text-slate-900">96%</p>
                                                    <p className="mt-1 text-sm text-slate-600">Entregas</p>
                                                </div>
                                                <div className="h-10 w-px bg-slate-200" />
                                                <div>
                                                    <p className="text-[2rem] font-bold leading-none text-slate-900">1,247</p>
                                                    <p className="mt-1 text-sm text-slate-600">Notificaciones este mes</p>
                                                </div>
                                            </div>

                                            <Button className="mt-3.5 h-12 w-full rounded-full bg-slate-100 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] hover:bg-slate-200">
                                                Configurar alertas <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </SpotlightCard>

                        <SpotlightCard
                            className="relative mt-4 h-fit rounded-[22px] border border-slate-200 bg-white p-0 shadow-[0_18px_45px_rgba(30,64,175,0.12)] lg:absolute lg:right-0 lg:top-12 lg:mt-0 lg:w-[39%] lg:rotate-[0.75deg]"
                            spotlightColor="rgba(59, 130, 246, 0.16)"
                        >
                            <Card className="border-0 bg-transparent shadow-none">
                                <CardContent className="px-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                                <Building2 className="h-5 w-5" />
                                            </div>
                                            <p className="text-[1.05rem] font-semibold text-slate-900">Gestion Multi-Empresa</p>
                                        </div>
                                        <Ellipsis className="h-5 w-5 text-slate-400" />
                                    </div>

                                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <HardHat className="h-4 w-4 text-slate-500" />
                                                <p className="font-semibold text-slate-800">Constructora Andina</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">42 Trabajadores</span>
                                                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                                            </div>
                                        </div>
                                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-semibold">
                                            <p className="text-emerald-600">Vigentes 32</p>
                                            <p className="text-amber-600">Proximos 8</p>
                                            <p className="text-red-600">Criticos 2</p>
                                        </div>
                                        <div className="mt-2 grid grid-cols-3 overflow-hidden rounded-full">
                                            <div className="h-1.5 bg-emerald-500" />
                                            <div className="h-1.5 bg-amber-400" />
                                            <div className="h-1.5 bg-red-500" />
                                        </div>
                                    </div>

                                    <div className="mt-3 space-y-2">
                                        {companies.slice(1).map((company) => (
                                            <div key={company.name} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <company.icon className="h-3.5 w-3.5 text-slate-500" />
                                                    <p className="text-sm font-medium text-slate-700">{company.name}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{company.workers} Trabajadores</span>
                                                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                                        <Plus className="h-4 w-4" /> Agregar Empresa
                                    </button>
                                </CardContent>
                            </Card>
                        </SpotlightCard>
                    </div>
                </div>
            </div>
        </section>
    );
}
