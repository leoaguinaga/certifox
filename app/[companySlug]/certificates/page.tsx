"use client";

import { Search, Plus, MoreHorizontal, FileText, CheckCircle2, AlertTriangle, Clock, Filter } from "lucide-react";
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
import { CertificateFormModal } from "@/components/dashboard/CertificateFormModal";

const certificatesMock = [
    { id: "CER-101", type: "Trabajo en Altura", workerName: "Carlos Rivera", issueDate: "15 Ene 2025", expDate: "15 Ene 2026", status: "VALID", alertDays: 30 },
    { id: "CER-102", type: "Examen Médico (EMO)", workerName: "Elena Torres", issueDate: "01 Mar 2025", expDate: "01 Mar 2026", status: "WARNING", alertDays: 15 },
    { id: "CER-103", type: "Manejo Defensivo", workerName: "Javier Mendoza", issueDate: "10 Feb 2024", expDate: "10 Feb 2025", status: "EXPIRED", alertDays: 15 },
    { id: "CER-104", type: "Trabajo en Espacio Confinado", workerName: "Luisa Fernández", issueDate: "20 May 2025", expDate: "20 May 2026", status: "VALID", alertDays: 30 },
    { id: "CER-105", type: "SCTR", workerName: "Miguel Sánchez", issueDate: "01 Abr 2025", expDate: "01 Abr 2026", status: "VALID", alertDays: 5 },
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

export default function CertificatesPage() {
    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Certificados</h2>
                    <p className="text-muted-foreground mt-1">
                        Visualiza y administra todos los registros de certificaciones.
                    </p>
                </div>
                <CertificateFormModal />
            </div>

            <Card className="border-border/50 shadow-sm">
                <div className="p-4 border-b flex flex-col sm:flex-row items-center gap-4 justify-between">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por tipo o trabajador..." className="pl-9 h-9" />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" className="h-9 w-full sm:w-auto">
                            <Filter className="mr-2 h-4 w-4 text-muted-foreground" /> Estado
                        </Button>
                    </div>
                </div>

                <CardContent className="p-0 overflow-x-auto">
                    <Table className="min-w-[800px]">
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Tipo de Certificado</TableHead>
                                <TableHead>Trabajador</TableHead>
                                <TableHead>Emisión</TableHead>
                                <TableHead>Vencimiento</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Regla de Alerta</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {certificatesMock.map((cert) => (
                                <TableRow key={cert.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium text-primary">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {cert.type}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{cert.workerName}</TableCell>
                                    <TableCell className="text-muted-foreground">{cert.issueDate}</TableCell>
                                    <TableCell className="font-medium text-foreground">{cert.expDate}</TableCell>
                                    <TableCell>
                                        {getStatusBadge(cert.status)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {cert.alertDays} días antes
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
                                                <DropdownMenuItem>Modificar Fechas</DropdownMenuItem>
                                                <DropdownMenuItem>Configurar Alerta</DropdownMenuItem>
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
