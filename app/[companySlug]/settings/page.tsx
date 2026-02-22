"use client";

import { Settings, Bell, Shield, Building2, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
    return (
        <div className="p-6 md:p-8 space-y-6 max-w-5xl">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Configuración</h2>
                <p className="text-muted-foreground mt-1">
                    Administra los ajustes de tu workspace (`Acme Industrial`).
                </p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-5 lg:w-[750px] mb-8 border-b-0 h-10 bg-transparent gap-2">
                    <TabsTrigger value="general" className="data-[state=active]:bg-card data-[state=active]:border data-[state=active]:shadow-sm rounded-md h-full gap-2">
                        <Building2 className="h-4 w-4" /> General
                    </TabsTrigger>
                    <TabsTrigger value="certificates" className="data-[state=active]:bg-card data-[state=active]:border data-[state=active]:shadow-sm rounded-md h-full gap-2">
                        <FileText className="h-4 w-4" /> Certificados
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:bg-card data-[state=active]:border data-[state=active]:shadow-sm rounded-md h-full gap-2">
                        <Bell className="h-4 w-4" /> Notificaciones
                    </TabsTrigger>
                    <TabsTrigger value="users" className="data-[state=active]:bg-card data-[state=active]:border data-[state=active]:shadow-sm rounded-md h-full gap-2">
                        <Settings className="h-4 w-4" /> Usuarios
                    </TabsTrigger>
                    <TabsTrigger value="security" className="data-[state=active]:bg-card data-[state=active]:border data-[state=active]:shadow-sm rounded-md h-full gap-2">
                        <Shield className="h-4 w-4" /> Seguridad
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle>Perfil de Empresa</CardTitle>
                            <CardDescription>
                                Actualiza los datos públicos e internos de tu organización.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Razón Social</Label>
                                <Input id="companyName" defaultValue="Acme Industrial S.A.C." className="max-w-md" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ruc">RUC</Label>
                                <Input id="ruc" defaultValue="20123456789" className="max-w-md" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Institucional</Label>
                                <Input id="email" type="email" defaultValue="admin@acme.com" className="max-w-md" />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-6">
                            <Button>Guardar Cambios</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="certificates" className="space-y-6">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle>Tipos de Certificados Permitidos</CardTitle>
                            <CardDescription>
                                Define la lista de los diferentes tipos de certificados que tu empresa maneja a nivel global.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex gap-2 max-w-md">
                                    <Input placeholder="Ej. Trabajo en Altura, SCTR..." />
                                    <Button variant="secondary">Añadir</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-4 p-4 border rounded-md min-h-[100px] bg-muted/10">
                                    <Badge variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 cursor-default">Examen Médico (EMO) <span className="ml-2 text-primary/50 hover:text-danger cursor-pointer px-1">×</span></Badge>
                                    <Badge variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 cursor-default">Trabajo en Altura <span className="ml-2 text-primary/50 hover:text-danger cursor-pointer px-1">×</span></Badge>
                                    <Badge variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 cursor-default">Manejo Defensivo <span className="ml-2 text-primary/50 hover:text-danger cursor-pointer px-1">×</span></Badge>
                                    <Badge variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 cursor-default">SCTR <span className="ml-2 text-primary/50 hover:text-danger cursor-pointer px-1">×</span></Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle>Canales de Notificación Globales</CardTitle>
                            <CardDescription>
                                Habilita los canales mediante los que CertiFox se comunicará con tus trabajadores previo a un vencimiento.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-border p-4 rounded-md gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-sm">Notificaciones por Email</span>
                                    <span className="text-xs text-muted-foreground">Envía correos electrónicos automáticos a las direcciones registradas.</span>
                                </div>
                                <Switch id="email-notif" defaultChecked />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-border p-4 rounded-md bg-muted/30 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-sm text-muted-foreground line-through">Notificaciones por WhatsApp</span>
                                    <span className="text-xs text-muted-foreground w-full sm:w-[90%]">Envía recordatorios mediante WhatsApp. Funcionalidad en desarrollo para este MVP.</span>
                                </div>
                                <Switch id="ws-notif" disabled />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-6 bg-muted/20">
                            <Button>Guardar Configuración</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="users">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle>Gestión de Usuarios Activos</CardTitle>
                            <CardDescription>Administradores de la plataforma CertiFox de esta empresa.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground p-8 text-center border border-dashed rounded-md">Tabla de administradores próximamente disponible en este módulo.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card className="border-border/50 border-danger/20 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-danger flex items-center gap-2"><Shield className="h-5 w-5" /> Zona de Peligro</CardTitle>
                            <CardDescription>Acciones destructivas que afectan al tenant.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between border border-border p-4 rounded-md">
                                <div>
                                    <h4 className="font-semibold text-sm">Eliminar Workspace</h4>
                                    <p className="text-xs text-muted-foreground w-3/4 mt-1">Esta acción borrará todos los certificados, alertas enviadas y trabajadores. Es irreversible.</p>
                                </div>
                                <Button variant="destructive">Eliminar Workspace</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
