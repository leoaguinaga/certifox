import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <Link href="/" className="flex items-center space-x-1">
                        <img src="/icon.png" className="h-9 w-auto mb-1" alt="CertiFox Logo" />
                        <span className="text-2xl font-black text-primary">CertiFox</span>
                    </Link>
                </div>

                {/* <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="#features" className="transition-colors hover:text-primary text-muted-foreground">
                        Características
                    </Link>
                    <Link href="#how-it-works" className="transition-colors hover:text-primary text-muted-foreground">
                        Cómo Funciona
                    </Link>
                    <Link href="/pricing" className="transition-colors hover:text-primary text-muted-foreground">
                        Precios
                    </Link>
                </nav> */}

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex">
                        <Button variant="ghost" asChild>
                            <Link href="/login">Iniciar Sesión</Link>
                        </Button>
                    </div>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-sm">
                        <Link href="/register">Empezar Gratis</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
