"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NewUserModal } from "./NewUserModal";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
}

interface UsersSettingsTabProps {
    users: User[];
    companyId: string;
}

export function UsersSettingsTab({ users, companyId }: UsersSettingsTabProps) {
    return (
        <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Gestión de Usuarios Activos</CardTitle>
                    <CardDescription>Administradores de la plataforma CertiFox de esta empresa.</CardDescription>
                </div>
                <NewUserModal companyId={companyId} />
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="pl-6">Usuario</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Ingreso</TableHead>
                            <TableHead className="text-right pr-6">Rol</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="pl-6 font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                            {user.name.charAt(0)}
                                        </div>
                                        <span>{user.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                <TableCell className="text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right pr-6">
                                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
