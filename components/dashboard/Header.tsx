"use client";

import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserProfileModal } from "./UserProfileModal";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { useState } from "react";

interface HeaderProps {
    onMenuClick?: () => void;
    companySlug: string;
}

export function Header({ onMenuClick, companySlug }: HeaderProps) {
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-muted-foreground lg:hidden" onClick={onMenuClick}>
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <div className="relative flex flex-1 items-center">
                    <Button
                        variant="outline"
                        className="w-full md:w-1/3 justify-start text-sm text-muted-foreground bg-muted/50 border-none hover:bg-muted font-normal h-10 px-4 rounded-full"
                        onClick={() => setSearchOpen(true)}
                    >
                        <Search className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
                        Buscar certificados, trabajadores...
                        <span className="ml-auto hidden rounded border px-1.5 py-0.5 text-[10px] sm:inline-block">
                            ⌘K
                        </span>
                    </Button>
                </div>
                <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                        <span className="sr-only">Ver notificaciones</span>
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger"></span>
                    </Button>

                    <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="-m-1.5 flex items-center p-1.5 hover:bg-muted/50 rounded-full">
                                <span className="sr-only">Abrir menú de usuario</span>
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                                    A
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <UserProfileModal>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    Perfil
                                </DropdownMenuItem>
                            </UserProfileModal>
                            <DropdownMenuItem>Configuración de Empresa</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-danger flex items-center">
                                Cerrar Sesión
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
