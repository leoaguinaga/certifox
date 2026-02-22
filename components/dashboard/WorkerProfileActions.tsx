"use client";

import { useTransition } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { WorkerFormModal } from "./WorkerFormModal";
import { deleteWorker } from "@/app/actions/workers";
import { useRouter } from "next/navigation";

interface WorkerProfileActionsProps {
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

export function WorkerProfileActions({ worker, companySlug }: WorkerProfileActionsProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        startTransition(async () => {
            const res = await deleteWorker(worker.id, companySlug);
            if (res.error) {
                alert(res.error);
            } else {
                router.push(`/${companySlug}/workers`);
            }
        });
    };

    return (
        <div className="flex gap-2">
            <WorkerFormModal mode="edit" initialData={{
                id: worker.id,
                dni: worker.dni,
                fullName: worker.fullName,
                position: worker.position || "",
                email: worker.email || "",
                phone: worker.phone || ""
            }}>
                <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Editar</Button>
            </WorkerFormModal>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isPending}>
                        <Trash2 className="mr-2 h-4 w-4" /> {isPending ? "Eliminando..." : "Eliminar"}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción es temporalmente irreversible desde el panel. Esto ocultará permanentemente a <strong>{worker.fullName}</strong>
                            y todos sus certificados asociados de tus reportes activos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Sí, eliminar trabajador
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
