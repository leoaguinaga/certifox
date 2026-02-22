import Image from "next/image";

export function Testimonials() {
    const testimonials = [
        {
            body: "CertiFox revolucionó nuestra forma de administrar operaciones en campo. Ya no dependemos de un Excel desactualizado para saber si un trabajador puede entrar a planta o no.",
            author: {
                name: "Carlos Rivera",
                role: "Gerente de Operaciones",
                company: "Industrial del Norte S.A.",
                imageUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Carlos&backgroundColor=e2e8f0",
            },
        },
        {
            body: "Estar al tanto de las fechas de vencimiento de las pólizas SCTR era una pesadilla administrativa. Con las alertas por WhatsApp, ahora todo es preventivo en el equipo.",
            author: {
                name: "Elena Torres",
                role: "Jefa de Recursos Humanos",
                company: "Constructora Andes",
                imageUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Elena&backgroundColor=e2e8f0",
            },
        },
        {
            body: "Habíamos pagado multas graves por certificados médicos vencidos anteriormente. Desde que integramos CertiFox, auditamos la vigencia completa en 5 segundos.",
            author: {
                name: "Javier Mendoza",
                role: "Director de HSE",
                company: "Minería y Metales Corps",
                imageUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Javier&backgroundColor=e2e8f0",
            },
        },
    ];

    return (
        <section className="py-24 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary uppercase tracking-wider">Testimonios</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Empresas libres de paralizaciones
                    </p>
                </div>
                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {testimonials.map((testimonial, idx) => (
                        <div key={idx} className="flex flex-col justify-between bg-card p-8 shadow-sm rounded-2xl border border-border">
                            <blockquote className="text-muted-foreground leading-Relaxed flex-1 relative">
                                <span className="text-4xl text-primary/20 absolute -top-4 -left-2 font-serif">"</span>
                                <p className="relative z-10">{testimonial.body}</p>
                            </blockquote>
                            <div className="mt-8 flex items-center gap-x-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={testimonial.author.imageUrl}
                                    alt={testimonial.author.name}
                                    className="h-12 w-12 rounded-full bg-muted border border-border"
                                />
                                <div>
                                    <div className="font-semibold text-foreground">{testimonial.author.name}</div>
                                    <div className="text-sm text-muted-foreground">{testimonial.author.role}</div>
                                    <div className="text-xs font-medium text-primary mt-0.5">{testimonial.author.company}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
