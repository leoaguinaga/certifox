"use client";

import { useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkerFormModal } from "./WorkerFormModal";
import { deleteWorker } from "@/app/actions/workers";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface WorkerRowActionsProps {
    worker: {
        id: string;
        dni: string;
        fullName: string;
        position: string | null;
        email: string | null;
        phone: string | null;
    };
    companySlug: string;
}

export function WorkerRowActions({ worker, companySlug }: WorkerRowActionsProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        if (confirm("¿Seguro que deseas eliminar este trabajador? Esto no se puede deshacer de forma fácil.")) {
            startTransition(async () => {
                const res = await deleteWorker(worker.id, companySlug);
                if (res.error) {
                    alert(res.error);
                }
            });
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={`/${companySlug}/workers/${worker.id}`}>Ver Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/${companySlug}/certificates/new?workerId=${worker.id}`}>Asignar Certificado</Link>
                </DropdownMenuItem>
                <WorkerFormModal
                    mode="edit"
                    initialData={{
                        id: worker.id,
                        dni: worker.dni,
                        fullName: worker.fullName,
                        position: worker.position || "",
                        email: worker.email || "",
                        phone: worker.phone || ""
                    }}
                >
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Editar</DropdownMenuItem>
                </WorkerFormModal>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-danger focus:text-danger" onClick={handleDelete}>
                    Eliminar
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
