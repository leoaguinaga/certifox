"use client";

import { useEffect, useState, useTransition } from "react";
import { Calculator, Calendar, FileText, Search, Settings, Smile, User, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { globalSearchAction } from "@/app/actions/search";

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
    const params = useParams();
    const router = useRouter();
    const companySlug = params.companySlug as string;

    const [isPending, startTransition] = useTransition();
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<{
        workers: any[];
        certificates: any[];
    }>({ workers: [], certificates: [] });

    // Handle Keyboard Shortcut (CMD+K or CTRL+K)
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

    // Handle Search Queries (Debounced via Transition)
    useEffect(() => {
        if (searchQuery.length < 2) {
            setResults({ workers: [], certificates: [] });
            return;
        }

        const timer = setTimeout(() => {
            startTransition(async () => {
                const data = await globalSearchAction(companySlug, searchQuery);
                setResults(data);
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, companySlug]);

    const handleSelect = (url: string) => {
        onOpenChange(false);
        setSearchQuery("");
        router.push(url);
    };

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput
                placeholder="Empieza a escribir para buscar trabajadores o certificados..."
                value={searchQuery}
                onValueChange={setSearchQuery}
            />
            <CommandList>
                {isPending && (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
                {!isPending && searchQuery.length >= 2 && results.workers.length === 0 && results.certificates.length === 0 && (
                    <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                )}
                {!isPending && searchQuery.length < 2 && (
                    <CommandEmpty>Escribe al menos 2 caracteres para buscar.</CommandEmpty>
                )}

                {results.workers.length > 0 && (
                    <CommandGroup heading="Trabajadores">
                        {results.workers.map(worker => (
                            <CommandItem
                                key={worker.id}
                                onSelect={() => handleSelect(`/${companySlug}/workers/${worker.id}`)}
                            >
                                <User className="mr-2 h-4 w-4" />
                                <span>{worker.fullName} </span>
                                {worker.dni && <span className="text-muted-foreground ml-1">({worker.dni})</span>}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {results.workers.length > 0 && <CommandSeparator />}

                {results.certificates.length > 0 && (
                    <CommandGroup heading="Certificados (Expedientes)">
                        {results.certificates.map(cert => (
                            <CommandItem
                                key={cert.id}
                                onSelect={() => handleSelect(`/${companySlug}/workers/${cert.workerId}`)}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                <span>{cert.typeName} - <span className="text-muted-foreground">{cert.workerName}</span></span>
                                <CommandShortcut className={
                                    cert.status === 'EXPIRED' ? 'text-danger' :
                                        cert.status === 'WARNING' ? 'text-warning' : 'text-success'
                                }>
                                    {cert.status === 'EXPIRED' ? 'Vencido' :
                                        cert.status === 'WARNING' ? `Vence en ${cert.diffDays}d` : 'Vigente'}
                                </CommandShortcut>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {(results.workers.length > 0 || results.certificates.length > 0) && <CommandSeparator />}

                <CommandGroup heading="Enlaces Directos">
                    <CommandItem onSelect={() => handleSelect(`/${companySlug}/settings`)}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configuración de Empresa</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
