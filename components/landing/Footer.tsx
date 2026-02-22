import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-background border-t py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <img src="/icon.png" className="h-15 w-auto" alt="" />
                        <span className="text-3xl font-bold text-primary">CertiFox</span>
                    </div>

                    <nav className="flex flex-wrap justify-center gap-6 text-sm">
                        <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                            Características
                        </Link>
                        <Link href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                            Cómo Funciona
                        </Link>
                        <Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
                            Precios
                        </Link>
                        <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">
                            Iniciar Sesión
                        </Link>
                    </nav>
                </div>

                <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} CertiFox. Todos los derechos reservados.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <Link href="#" className="hover:text-foreground transition-colors">
                            Términos de Servicio
                        </Link>
                        <Link href="#" className="hover:text-foreground transition-colors">
                            Política de Privacidad
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
