"use client";

import type { ComponentType } from "react";
import {
  BellRing,
  Building2,
  CheckCircle2,
  Gauge,
  History,
  ShieldAlert,
  Mail,
  MessageCircle,
  FileClock,
  BadgeCheck,
} from "lucide-react";
import ShapeGrid from "@/components/bits/ShapeGrid";
import SpotlightCard from "@/components/bits/SpotlightCard";

const rightFeatures = [
  {
    icon: Building2,
    eyebrow: "Operación centralizada",
    title: "Gestión Multi-Empresa",
    description:
      "Administra trabajadores y certificados por empresa desde una sola plataforma, con una vista clara y ordenada.",
  },
  {
    icon: History,
    eyebrow: "Seguimiento completo",
    title: "Trazabilidad Total",
    description:
      "Mantén un historial de notificaciones enviadas con validación de recepción y control de seguimiento.",
  },
  {
    icon: Gauge,
    eyebrow: "Tiempo real",
    title: "Cálculo Dinámico",
    description:
      "El estado de cada certificado se calcula automáticamente según fechas y reglas configurables.",
  }
];

const bottomFeatures = [
    {
        id: 1,
        icon: CheckCircle2,
        eyebrow: "Lectura inmediata",
        title: "100% Validado",
        description:
            "Visualiza certificados vigentes, por vencer y vencidos con semaforos de riesgo claros.",
    },
    {
        id: 2,
        icon: ShieldAlert,
        eyebrow: "Continuidad operativa",
        title: "Prevención de Riesgos",
        description:
        "Evita multas, observaciones y paralizaciones operativas asegurando el cumplimiento normativo.",
    }
];

function FeatureMini({
  icon: Icon,
  title,
  text,
  color,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur-sm shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${color}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
        </div>
      </div>
    </div>
  );
}

function SecondaryCard({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <SpotlightCard
      className="group h-full rounded-[28px] border border-white/70 bg-white/70 p-7 backdrop-blur-md shadow-[0_12px_40px_rgba(15,23,42,0.07)]"
      spotlightColor="rgba(37, 99, 235, 0.18)"
    >
      <div className="flex h-full flex-col gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-700" />
          <span className="text-sm font-semibold uppercase text-blue-700">
            {eyebrow}
          </span>
        </div>

        <h3 className="text-xl font-bold tracking-tight text-slate-950">
          {title}
        </h3>

        <p className="text-sm leading-7 text-slate-600">
          {description}
        </p>
      </div>
    </SpotlightCard>
  );
}

export function Features() {
  return (
    <section className="relative overflow-hidden bg-[#eef3f9] py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 opacity-[0.35]">
        <ShapeGrid
          squareSize={42}
          direction="diagonal"
          speed={0.35}
          borderColor="rgba(37,99,235,0.12)"
          vignetteColor="rgba(238, 243, 249, 0)"
        />
      </div>

      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-indigo-300/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-blue-200/70 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700 backdrop-blur-md">
            Cumplimiento normativo
          </span>

          <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Todo lo que necesitas
            <span className="block">para tu tranquilidad</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            CertiFox no es solo un registro. Es un sistema inteligente diseñado
            para asegurar que tus trabajadores mantengan sus certificados
            vigentes en todo momento.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <SpotlightCard
              className="relative overflow-hidden rounded-[32px] border-0 bg-white/80"
              spotlightColor="rgba(37, 99, 235, 0.16)"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_30%)]" />

              <div className="relative flex flex-col gap-6">
                <div className="inline-flex items-center gap-4 w-fit text-blue-700">
                  <BellRing className="h-5 w-5" />
                  <span className="font-semibold uppercase">
                    Beneficio principal
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                    Alertas Automatizadas
                  </h3>

                  <p className="leading-8 text-slate-600">
                    Recibe notificaciones automáticas por WhatsApp y Email antes
                    de que los certificados venzan, evitando riesgos, retrasos y
                    observaciones en la operación.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FeatureMini
                    icon={MessageCircle}
                    title="WhatsApp"
                    text="Avisos rapidos y directos"
                    color="bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                  />
                  <FeatureMini
                    icon={Mail}
                    title="Email"
                    text="Seguimiento formal"
                    color="bg-blue-50 text-blue-600 ring-1 ring-blue-100"
                  />
                  <FeatureMini
                    icon={FileClock}
                    title="Avisos programables"
                    text="Configura dias previos"
                    color="bg-amber-50 text-amber-600 ring-1 ring-amber-100"
                  />
                  <FeatureMini
                    icon={BadgeCheck}
                    title="Validacion"
                    text="Historial y recepcion"
                    color="bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100"
                  />
                </div>
              </div>
            </SpotlightCard>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {bottomFeatures.map((feature) => (
                    <SpotlightCard
                        key={feature.id}
                        className="rounded-[24px] border border-white/80 bg-white/75 p-6 backdrop-blur-md shadow-[0_12px_36px_rgba(15,23,42,0.08)]"
                        spotlightColor="rgba(37, 99, 235, 0.14)">
                        <div className="flex h-full flex-col gap-2">
                            <div className="flex items-center gap-2">
                            <feature.icon className="h-5 w-5 text-blue-700" />
                            <span className="text-sm font-semibold uppercase text-blue-700">
                                {feature.eyebrow}
                            </span>
                            </div>

                            <h3 className="text-xl font-bold tracking-tight text-slate-950">
                            {feature.title}
                            </h3>

                            <p className="text-sm leading-7 text-slate-600">
                            {feature.description}
                            </p>
                        </div>
                    </SpotlightCard>
                ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-1 lg:col-span-5">
            {rightFeatures.map((feature) => (
              <SecondaryCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
