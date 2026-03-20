"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SpotlightCard from "@/components/bits/SpotlightCard";
import StarBorder from "@/components/bits/StarBorder";
import Particles from "@/components/bits/Particles";
import AnimatedList from "@/components/bits/AnimatedList";

const tiers = [
  {
    name: "Starter",
    id: "tier-starter",
    href: "/register",
    price: { monthly: "$49", annually: "$470" },
    description:
      "Perfecto para pequeñas empresas o subcontratas que necesitan control básico.",
    features: [
      "Hasta 50 Trabajadores",
      "Certificados Ilimitados",
      "Alertas por Email",
      "Soporte Estándar",
    ],
    mostPopular: false,
  },
  {
    name: "Professional",
    id: "tier-professional",
    href: "/register",
    price: { monthly: "$99", annually: "$990" },
    description:
      "Ideal para medianas empresas con operaciones continuas y trazabilidad rápida.",
    features: [
      "Hasta 250 Trabajadores",
      "Alertas por WhatsApp + Email",
      "Reportes Exportables",
      "Configuración de Días Personalizada",
      "Soporte Prioritario",
    ],
    mostPopular: true,
  },
  {
    name: "Enterprise",
    id: "tier-enterprise",
    href: "/register",
    price: { monthly: "Custom", annually: "Custom" },
    description:
      "Para grandes operaciones, contratistas principales y consorcios.",
    features: [
      "Trabajadores Ilimitados",
      "Múltiples administradores (Roles)",
      "API de Integración",
      "Log de Auditoría Avanzado",
      "Soporte Dedicado 24/7",
    ],
    mostPopular: false,
  },
];

export default function Pricing() {
  return (
    <section className="relative flex-1 overflow-hidden bg-muted/30">
      <div className="pointer-events-none absolute inset-0 opacity-35">
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
      </div>

      <div className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">
              Precios Adaptables
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Planes diseñados para operaciones de cualquier tamaño
            </p>
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-center text-lg leading-8 text-muted-foreground">
            Elige el plan ideal para automatizar los procesos de cumplimiento y
            no volver a tener paralizaciones.
          </p>

          <div className="isolate relative mx-auto mt-14 grid max-w-md grid-cols-1 items-start gap-y-6 sm:mt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-6 lg:gap-y-0">
            {tiers.map((tier) => (
              <SpotlightCard
                key={tier.id}
                className={`rounded-3xl! border-border! bg-card! p-6 ring-1 transition-all hover:-translate-y-1 hover:shadow-xl ${
                  tier.mostPopular
                    ? "relative overflow-visible ring-2! ring-primary! shadow-[0_20px_45px_rgba(30,58,138,0.18)]"
                    : "ring-border"
                }`}
                spotlightColor="rgba(59, 130, 246, 0.14)"
              >
                {tier.mostPopular ? (
                  <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                    Más Popular
                  </span>
                ) : null}

                <div className="flex items-center justify-between gap-x-4">
                  <h3
                    id={tier.id}
                    className={`text-lg font-semibold leading-8 ${
                      tier.mostPopular ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {tier.name}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {tier.description}
                </p>
                <p className="mt-5 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {tier.price.monthly}
                  </span>
                  {tier.price.monthly !== "Custom" ? (
                    <span className="text-sm font-semibold leading-6 text-muted-foreground">
                      /mes
                    </span>
                  ) : null}
                </p>

                <div className="mt-5">
                  {tier.mostPopular ? (
                    <StarBorder
                      as={Link}
                      href={tier.href}
                      color="#60a5fa"
                      speed="2.4s"
                      thickness={2}
                      className="w-full"
                    >
                      <span className="inline-flex w-full items-center justify-center font-semibold">
                        Comenzar con {tier.name}
                      </span>
                    </StarBorder>
                  ) : (
                    <Button
                      asChild
                      variant="outline"
                      className="h-11 w-full"
                    >
                      <Link href={tier.href}>Comenzar con {tier.name}</Link>
                    </Button>
                  )}
                </div>

                <AnimatedList
                  items={tier.features}
                  className="mt-5"
                  itemWrapperClassName="mb-2 last:mb-0"
                  listClassName="max-h-none overflow-visible p-0"
                  showGradients={false}
                  displayScrollbar={false}
                  enableArrowNavigation={false}
                  selectOnHover={false}
                  renderItem={(feature) => (
                    <div className="flex items-start gap-x-3 rounded-lg bg-muted/35 px-3 py-2 text-sm leading-5 text-muted-foreground">
                      <Check className="mt-0.5 h-5 w-5 flex-none text-primary" aria-hidden="true" />
                      <span>{feature}</span>
                    </div>
                  )}
                />
              </SpotlightCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
