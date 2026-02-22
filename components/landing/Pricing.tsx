import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const frequencies = [
  { value: "monthly", label: "Monthly", priceSuffix: "/month" },
  { value: "annually", label: "Annually", priceSuffix: "/year" },
];

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
    <section className="flex-1">
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">
              Precios Adaptables
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Planes diseñados para operaciones de cualquier tamaño
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted-foreground">
            Elige el plan ideal para automatizar los procesos de cumplimiento y
            no volver a tener paralizaciones.
          </p>

          <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`rounded-3xl p-8 ring-1 xl:p-10 transition-shadow hover:shadow-lg bg-card ${
                  tier.mostPopular
                    ? "ring-2 ring-primary relative"
                    : "ring-border"
                }`}
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
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {tier.price.monthly}
                  </span>
                  {tier.price.monthly !== "Custom" ? (
                    <span className="text-sm font-semibold leading-6 text-muted-foreground">
                      /mes
                    </span>
                  ) : null}
                </p>
                <Button
                  asChild
                  variant={tier.mostPopular ? "default" : "outline"}
                  className="mt-6 w-full h-12"
                >
                  <Link href={tier.href}>Comenzar con {tier.name}</Link>
                </Button>
                <ul
                  role="list"
                  className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground"
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check
                        className="h-6 w-5 flex-none text-primary"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
