import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "¿Qué tipos de documentos puedo gestionar en CertiFox?",
        answer: "CertiFox está diseñado para gestionar dos tipos de documentos: Certificados de Trabajadores (exámenes médicos, licencias, permisos de trabajo, SCTR, etc.) y Documentos Empresariales (SOAT de vehículos, pólizas de seguro, licencias de funcionamiento, entre otros). Ambos tipos cuentan con alertas automáticas de vencimiento.",
    },
    {
        question: "¿Cómo funcionan las alertas de vencimiento?",
        answer: "CertiFox envía alertas automáticas por correo electrónico al correo institucional de tu empresa cuando un certificado o documento está próximo a vencer. Puedes configurar cuántos días antes deseas recibir la alerta (por defecto son 15 días). El sistema evalúa diariamente todos los vencimientos activos.",
    },
    {
        question: "¿Puedo registrar múltiples trabajadores o certificados a la vez?",
        answer: "¡Sí! CertiFox ofrece herramientas de registro masivo tanto para trabajadores como para certificados. Puedes agregar múltiples registros en una sola operación, lo que te ahorra tiempo valioso cuando necesitas cargar 20 o 30 certificados de una sola vez.",
    },
    {
        question: "¿Qué es el modo Multi-Tenant?",
        answer: "Cada empresa que se registra en CertiFox obtiene su propio workspace aislado con un URL personalizado (certifox.com/tu-empresa). Esto significa que toda tu información está separada y segura, y puedes tener múltiples administradores por empresa.",
    },
    {
        question: "¿Es necesario instalar algún software?",
        answer: "No. CertiFox es una aplicación web (SaaS) que funciona directamente desde tu navegador. No necesitas instalar nada. Solo necesitas una conexión a internet y un navegador moderno.",
    },
    {
        question: "¿Qué pasa si mi certificado ya está vencido?",
        answer: "CertiFox resaltará visualmente los certificados vencidos en rojo y los próximos a vencer en amarillo. Además, recibirás una alerta urgente por correo electrónico la primera vez que un documento se reporta como vencido, permitiéndote actuar de inmediato.",
    },
    {
        question: "¿Puedo usar CertiFox gratis?",
        answer: "Sí. Ofrecemos un plan Demo gratuito que permite gestionar hasta 50 trabajadores. Es perfecto para empresas pequeñas o para probar la plataforma antes de contratar un plan de mayor capacidad.",
    },
    {
        question: "¿Mis datos están seguros?",
        answer: "Absolutamente. CertiFox utiliza PostgreSQL alojado en Neon (infraestructura cloud de alta disponibilidad), autenticación robusta con Better Auth, y toda la comunicación está cifrada mediante HTTPS. Tus datos no se comparten con terceros.",
    },
];

export function FAQ() {
    return (
        <section id="faq" className="py-24 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <div className="text-center mb-16">
                        <span className="text-sm font-semibold text-primary uppercase tracking-wider">FAQ</span>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Preguntas Frecuentes
                        </h2>
                        <p className="mt-4 text-muted-foreground text-lg">
                            Resolvemos tus dudas más comunes sobre CertiFox.
                        </p>
                    </div>

                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqs.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="bg-card border border-border/60 rounded-xl px-6 data-[state=open]:shadow-sm transition-shadow"
                            >
                                <AccordionTrigger className="text-left text-base font-semibold hover:no-underline py-5">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
