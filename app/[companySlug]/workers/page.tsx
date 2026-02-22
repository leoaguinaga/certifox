"use client";

import { Search, Plus, MoreHorizontal, FileText, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkerFormModal } from "@/components/dashboard/WorkerFormModal";

const workersMock = [
    { id: "1", dni: "45678912", name: "Carlos Rivera", position: "Técnico Mecánico", status: "VALID", count: 4 },
    { id: "2", dni: "41235678", name: "Elena Torres", position: "Supervisora HSE", status: "WARNING", count: 5 },
    { id: "3", dni: "48901234", name: "Javier Mendoza", position: "Operador de Maquinaria", status: "EXPIRED", count: 3 },
    { id: "4", dni: "43456789", name: "Luisa Fernández", position: "Ingeniera Eléctrica", status: "VALID", count: 2 },
    { id: "5", dni: "42198765", name: "Miguel Sánchez", position: "Ayudante", status: "VALID", count: 1 },
];

function getStatusBadge(status: string) {
    switch (status) {
        case "VALID":
            return <Badge className="bg-success text-success-foreground hover:bg-success/80 gap-1"><CheckCircle2 className="h-3 w-3" /> Vigente</Badge>;
        case "WARNING":
            return <Badge className="bg-warning text-warning-foreground hover:bg-warning/80 gap-1"><Clock className="h-3 w-3" /> Por Vencer</Badge>;
        case "EXPIRED":
            return <Badge className="bg-danger text-danger-foreground hover:bg-danger/80 gap-1"><AlertTriangle className="h-3 w-3" /> Vencido</Badge>;
        default:
            return <Badge variant="secondary">Desconocido</Badge>;
    }
}

export default function WorkersPage() {
    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Trabajadores</h2>
                    <p className="text-muted-foreground mt-1">
                        Gestiona tu plantilla y la salud de sus certificados.
                    </p>
                </div>
                <WorkerFormModal mode="create" />
            </div>

            <Card className="border-border/50 shadow-sm">
                <div className="p-4 border-b flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por DNI o Nombre..." className="pl-9 h-9" />
                    </div>
                    <Button variant="outline" className="h-9 hidden sm:flex">
                        Filtros
                    </Button>
                </div>

                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[120px]">DNI</TableHead>
                                <TableHead>Trabajador</TableHead>
                                <TableHead>Puesto</TableHead>
                                <TableHead>Certificados</TableHead>
                                <TableHead>Estado Global</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {workersMock.map((worker) => (
                                <TableRow key={worker.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium">{worker.dni}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {worker.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold">{worker.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{worker.position}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                                            <FileText className="h-4 w-4" />
                                            {worker.count}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(worker.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                                                <DropdownMenuItem>Asignar Certificado</DropdownMenuItem>
                                                <WorkerFormModal mode="edit" initialData={{ dni: worker.dni, fullName: worker.name, position: worker.position }}>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Editar</DropdownMenuItem>
                                                </WorkerFormModal>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-danger">Eliminar</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                {/* Pagination placeholder */}
                <div className="p-4 border-t text-sm text-muted-foreground flex justify-between items-center">
                    <span>Mostrando 1 a 5 de 5 registros</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Anterior</Button>
                        <Button variant="outline" size="sm" disabled>Siguiente</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
