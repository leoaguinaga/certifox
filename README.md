CertiFox

Controla vencimientos. Evita riesgos.

CertiFox es un SaaS B2B multiempresa diseñado para monitorear la vigencia de certificados laborales y prevenir riesgos legales, multas y paralizaciones operativas mediante alertas automatizadas.

⸻

🎯 Objetivo del Producto

Las empresas contratistas deben garantizar que sus trabajadores mantengan certificados vigentes (trabajo en altura, exámenes médicos, SCTR, manejo defensivo, etc.).

CertiFox permite:
	•	Registrar trabajadores
	•	Registrar certificados con fechas de vigencia
	•	Configurar alertas previas al vencimiento
	•	Recibir notificaciones automáticas (WhatsApp y Email)
	•	Mantener trazabilidad de alertas enviadas

Este proyecto es un SaaS real, no un CRUD experimental.

⸻

🏗 Arquitectura General

Tipo de Multi-Tenancy

Se utiliza:

Path-Based Multi-Tenancy

Ejemplo:

certifox.com/acme-industrial/dashboard

Donde:

/[companySlug]/

identifica el tenant (empresa).

No se usan subdominios en el MVP.

⸻

🧱 Stack Tecnológico
	•	Framework: Next.js (App Router)
	•	Estilos: TailwindCSS
	•	UI: ShadCN
	•	Autenticación: Better Auth
	•	ORM: Prisma
	•	Base de datos: PostgreSQL

Arquitectura modular y escalable.

⸻

🎨 Identidad Visual

Estética corporativa moderna tipo Linear / Stripe.

Paleta
	•	Primary: #1E3A8A
	•	Secondary: #0F172A
	•	Success: #22C55E
	•	Warning: #F59E0B
	•	Danger: #EF4444
	•	Background: #F8FAFC
	•	Border: #E2E8F0

Tipografía: Inter.

No usar fondos con patrones.

⸻

📂 Estructura de Rutas

Públicas

/
/login
/register
/pricing

Privadas Multi-Tenant

/[companySlug]/dashboard
/[companySlug]/workers
/[companySlug]/certificates
/[companySlug]/alerts
/[companySlug]/settings

En:

app/[companySlug]/layout.tsx

Debe:
	•	Validar existencia del tenant
	•	Validar que el usuario pertenezca a esa empresa
	•	Redirigir si no cumple

⸻

🧩 Estructura de Carpetas

app/
  (public)/
  [companySlug]/

src/
  modules/
    company/
    user/
    worker/
    certificate/
    alert/
  services/
  lib/
  prisma/

Cada módulo contiene:
	•	repository
	•	service
	•	types
	•	validators

Separación estricta de responsabilidades.

⸻

🗄 Modelo de Base de Datos (MVP)

⚠ En este MVP no se suben documentos.

El estado del certificado se calcula dinámicamente.

⸻

Entidades Principales

Company

Representa el tenant.
	•	id
	•	name
	•	slug (unique)
	•	ruc
	•	email
	•	whatsappNumber
	•	defaultNotificationDays
	•	createdAt
	•	updatedAt

⸻

User

Usuario interno de la empresa.
	•	id
	•	name
	•	email
	•	role (ADMIN | MANAGER)
	•	companyId

⸻

Worker

Trabajador perteneciente a una empresa.
	•	id
	•	dni
	•	fullName
	•	position
	•	companyId
	•	createdAt

Restricción:
	•	DNI único por empresa

⸻

Certificate

Entidad principal del sistema.
	•	id
	•	type
	•	issueDate
	•	expirationDate
	•	notificationDaysBefore (opcional)
	•	workerId
	•	createdAt

No almacenar estado en la base de datos.

⸻

NotificationLog

Registro histórico de notificaciones enviadas.
	•	id
	•	certificateId
	•	channel (WHATSAPP | EMAIL)
	•	sentAt
	•	success

Permite trazabilidad y auditoría.

⸻

🔄 Lógica de Estado

El estado del certificado se calcula dinámicamente:
	•	Si hoy > expirationDate → EXPIRED
	•	Si faltan ≤ notificationDaysBefore → WARNING
	•	Caso contrario → VALID

Si notificationDaysBefore es null:
usar Company.defaultNotificationDays.

No guardar estado en base de datos.

⸻

🔔 Sistema de Alertas

Debe existir un servicio desacoplado:

NotificationService
  ├── WhatsAppProvider
  └── EmailProvider

Flujo:
	1.	Cron job diario
	2.	Buscar certificados próximos a vencer
	3.	Evaluar reglas
	4.	Enviar notificación
	5.	Registrar en NotificationLog

En el MVP no se integra proveedor real.
Solo dejar arquitectura preparada.

⸻

🖥 UX del Dashboard

Sidebar
	•	Dashboard
	•	Trabajadores
	•	Certificados
	•	Alertas
	•	Configuración

⸻

Dashboard

Mostrar:
	•	Total trabajadores
	•	Total certificados
	•	Próximos a vencer
	•	Vencidos
	•	Timeline próximas alertas
	•	Gráfico vencimientos por mes

Estados visuales claros:
Verde / Amarillo / Rojo

⸻

Workers

Tabla moderna con:
	•	DNI
	•	Nombre
	•	Puesto
	•	Estado general calculado
	•	Acciones

Detalle:

Tabs:
	•	Información
	•	Certificados

⸻

Certificates

Tabla con:
	•	Tipo
	•	Trabajador
	•	Fecha emisión
	•	Fecha vencimiento
	•	Estado calculado
	•	Días notificación
	•	Acciones

Modales:
	•	Crear
	•	Editar
	•	Eliminar

⸻

Alerts

Vista con:
	•	Próximas notificaciones
	•	Historial enviado
	•	Filtro por canal

⸻

Settings

Secciones:
	•	Perfil empresa
	•	Configuración notificaciones
	•	Gestión de usuarios
	•	Integración futura WhatsApp API

⸻

🔐 Seguridad
	•	Validación estricta por companySlug
	•	Usuario solo puede acceder a su empresa
	•	No exponer IDs internos
	•	Uso de slug público
	•	Separación lógica multi-tenant

⸻

🚀 Principios del Proyecto
	•	No sobreingeniería innecesaria
	•	No lógica duplicada
	•	No guardar estado derivado
	•	Arquitectura preparada para:
	•	Subida de documentos (v2)
	•	Planes SaaS
	•	Facturación
	•	Subdominios
	•	API pública futura

Pensar siempre como SaaS escalable.

⸻

📈 Roadmap Futuro (No MVP)
	•	Subida y almacenamiento de documentos
	•	Dashboard administrativo global
	•	Facturación y planes
	•	Webhooks empresariales
	•	Integración real WhatsApp Business API
	•	Reportes descargables
	•	Roles avanzados
	•	Auditoría completa

⸻

🧠 Filosofía

CertiFox no es un sistema de registro.

Es un sistema preventivo de cumplimiento normativo automatizado.

Cada decisión técnica debe reforzar:
	•	Automatización
	•	Claridad
	•	Escalabilidad
	•	Simplicidad estructural
	•	Profesionalismo B2B

⸻