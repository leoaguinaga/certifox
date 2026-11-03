import Link from "next/link";
import { Globe, ArrowRight } from "lucide-react";
import { Logo } from "@/components/shared/logo";

const FOOTER_SECTIONS = [
  {
    title: "Programas",
    links: [
      { label: "Maquinaria y Minería", href: "#cursos" },
      { label: "Seguridad Ocupacional (ISO)", href: "#cursos" },
      { label: "Electricidad y Automatización", href: "#cursos" },
      { label: "Diplomados Técnicos", href: "#cursos" },
      { label: "Catálogo completo", href: "#cursos", highlight: true },
    ],
  },
  {
    title: "Validación",
    links: [
      { label: "Verificar con QR Oficial", href: "/verificar" },
      { label: "Buscador de Código Único", href: "#verificacion" },
      { label: "Estándar Criptográfico", href: "#verificacion" },
      { label: "Docentes Homologados", href: "#cursos" },
      { label: "Certificados para Empresas", href: "#" },
    ],
  },
  {
    title: "Plataforma",
    links: [
      { label: "Para Instructores", href: "#" },
      { label: "Centros y Gremios", href: "#" },
      { label: "Matrícula Directa P2P", href: "#" },
      { label: "Aula Virtual", href: "/campus" },
      { label: "Preguntas Frecuentes", href: "#faq" },
    ],
  },
  {
    title: "Soporte & Legal",
    links: [
      { label: "Centro de Ayuda", href: "/campus/mesa-de-ayuda" },
      { label: "Auditoría Académica", href: "#" },
      { label: "Términos del Servicio", href: "/terminos" },
      { label: "Política de Privacidad", href: "/privacidad" },
      { label: "Canal de Integridad Ética", href: "#" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="w-full bg-[#FFFDF9] border-t border-stone-200 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-stone-200">
          {/* Brand Info */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-sm text-stone-600 mb-6 max-w-sm leading-relaxed">
              Plataforma líder en capacitación y acreditación técnica profesional con validación criptográfica y registro público inmutable.
            </p>
          </div>

          {/* Navigation Links Columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="lg:col-span-2">
              <h4 className="text-sm font-bold text-stone-900 mb-4 tracking-tight">
                {section.title}
              </h4>
              <ul className="space-y-2.5 text-xs text-stone-600">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={
                        link.highlight
                          ? "hover:text-[#FD761A] transition-colors font-semibold text-[#FD761A] inline-flex items-center gap-1 mt-1"
                          : "hover:text-[#FD761A] transition-colors"
                      }
                    >
                      <span>{link.label}</span>
                      {link.highlight && <ArrowRight className="w-3 h-3" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-600">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left">
            <span>© 2026 Certifox Academy & <a href="https://foxcodepe.com" target="_blank" className="font-bold text-[#FD761A]">FoxCode</a></span>
            <span className="hidden sm:inline">•</span>
            <span>Todos los derechos reservados.</span>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 text-stone-700 font-medium">
            <Globe className="w-4 h-4 text-stone-500" />
            <span className="text-xs">Español (Latinoamérica)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}


