"use client";

import { useEffect, useState } from "react";
import { Calculator, Calendar, FileText, Search, Settings, Smile, User } from "lucide-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";

interface GlobalSearchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GlobalSearchModal({ open, onOpenChange }: GlobalSearchModalProps) {
    // En un caso real, la lista de items vendría de una base de datos 
    // o se buscaría dinámicamente según el input. Para la maqueta, es estática.

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onOpenChange(!open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [open, onOpenChange]);

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput placeholder="Empieza a escribir para buscar trabajadores o certificados..." />
            <CommandList>
                <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                <CommandGroup heading="Trabajadores">
                    <CommandItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Carlos Rivera (45678912)</span>
                    </CommandItem>
                    <CommandItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Elena Torres (41235678)</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Certificados (Expedientes)">
                    <CommandItem>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Examen Médico - Elena Torres</span>
                        <CommandShortcut className="text-warning">Vence en 15d</CommandShortcut>
                    </CommandItem>
                    <CommandItem>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Manejo Defensivo - Javier Mendoza</span>
                        <CommandShortcut className="text-danger">Vencido</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Enlaces Directos">
                    <CommandItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configuración de Empresa</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
