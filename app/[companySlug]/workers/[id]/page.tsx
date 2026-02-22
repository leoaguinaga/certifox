"use client";

import Link from "next/link";
import { ArrowLeft, Edit, Trash2, ShieldCheck, Mail, Phone, FileText, CheckCircle2, Clock, AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
// useParams isn't strictly necessary for the layout mockup but good for accuracy
import { useParams } from "next/navigation";
import { WorkerFormModal } from "@/components/dashboard/WorkerFormModal";
import { CertificateFormModal } from "@/components/dashboard/CertificateFormModal";

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

export default function WorkerDetailsPage() {
    const params = useParams();
    const companySlug = params?.companySlug || "demo-company";

    const workerMock = {
        id: "1",
        dni: "45678912",
        name: "Carlos Rivera",
        position: "Técnico Mecánico",
        email: "carlos.rivera@ejemplo.com",
        phone: "+51 987 654 321",
        status: "VALID",
        joined: "12 Mar 2024",
        certificates: [
            { id: "CER-101", type: "Trabajo en Altura", issueDate: "15 Ene 2025", expDate: "15 Ene 2026", status: "VALID" },
            { id: "CER-102", type: "Examen Médico (EMO)", issueDate: "10 Feb 2025", expDate: "10 Feb 2026", status: "VALID" },
        ]
    };

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-6xl">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/${companySlug}/workers`}>
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        {workerMock.name}
                        {getStatusBadge(workerMock.status)}
                    </h2>
                    <p className="text-muted-foreground mt-1">DNI: {workerMock.dni} • Ingresó el {workerMock.joined}</p>
                </div>
                <div className="flex gap-2">
                    <WorkerFormModal mode="edit" initialData={{
                        dni: workerMock.dni, fullName: workerMock.name, position: workerMock.position,
                        email: workerMock.email, phone: workerMock.phone
                    }}>
                        <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Editar</Button>
                    </WorkerFormModal>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente a <strong>{workerMock.name}</strong>
                                    y todos sus certificados asociados de la base de datos de CertiFox.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Sí, eliminar trabajador
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Details */}
                <Card className="col-span-1 border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Información del Trabajador</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                {workerMock.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold">{workerMock.position}</span>
                                <span className="text-xs text-muted-foreground">Cargo actual</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t space-y-3">
                            <div className="flex items-center gap-3 text-sm text-foreground">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                {workerMock.email}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-foreground">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {workerMock.phone}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-foreground">
                                <ShieldCheck className="h-4 w-4 text-success" />
                                {workerMock.certificates.length} Certificados Registrados
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Certificates List */}
                <Card className="col-span-2 border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Certificados ({workerMock.certificates.length})</CardTitle>
                            <CardDescription>Documentación vinculada al trabajador.</CardDescription>
                        </div>
                        <CertificateFormModal preSelectedWorkerName={workerMock.name} preSelectedWorkerId={workerMock.id}>
                            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Asignar Nuevo</Button>
                        </CertificateFormModal>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="pl-6">Tipo</TableHead>
                                    <TableHead>Emisión</TableHead>
                                    <TableHead>Vencimiento</TableHead>
                                    <TableHead className="text-right pr-6">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {workerMock.certificates.map(cert => (
                                    <TableRow key={cert.id}>
                                        <TableCell className="pl-6 font-medium">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                {cert.type}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{cert.issueDate}</TableCell>
                                        <TableCell className="font-medium text-foreground">{cert.expDate}</TableCell>
                                        <TableCell className="text-right pr-6">{getStatusBadge(cert.status)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
