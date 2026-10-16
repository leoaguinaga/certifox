# Certifox — Arquitectura (Full-Stack Next.js)

> Este documento está alineado con el plan maestro de ejecución en [`docs/monorepo-plan.md`](./docs/monorepo-plan.md).

## Propósito

Este proyecto contiene toda la plataforma **Certifox** para su MVP en un único proyecto Next.js desplegable:

- Landing, catálogo y detalle público de cursos.
- Verificación pública e instantánea de certificados (`/verificar/[codigo]`).
- Registro e inicio de sesión (`/ingresar`) con Better Auth.
- **Campus unificado por rol (`/campus`)**:
  - **Estudiante (`STUDENT`)**: dashboard de aprendizaje, cursos matriculados, aula virtual (`/campus/cursos/[cursoSlug]`), entregas de tareas, certificados emitidos, perfil y mesa de ayuda.
  - **Instructor (`INSTRUCTOR`)**: dashboard docente, gestión de cursos asignados/propios, confirmación manual de matrículas (`/campus/estudiantes`), calificación de tareas y emisión/revocación de certificados.
- **Backend integrado (`server/`)**: Server Components para lecturas, Server Actions para mutaciones, Route Handlers para Better Auth y generación de PDFs, y Prisma ORM conectado a Neon Postgres.

## Principios

1. **Un solo proyecto Next.js, un solo deploy** para visitantes, estudiantes e instructores.
2. **Rutas unificadas en `/campus`**: las rutas definen navegación y layouts; la lógica y vistas de dominio viven en `features/` y las reglas de negocio críticas en `server/`.
3. **Server Components por defecto**: los componentes cliente (`"use client"`) solo se usan para interactividad, formularios o APIs del navegador.
4. **Seguridad y autorización en el servidor (`server/policies.ts`)**: el navegador y el contexto de UI nunca contienen reglas críticas de permisos, certificación, pagos o notas. Todo acceso o mutación verifica rol y propiedad en el servidor.
5. **Aislamiento de servidor (`server-only`)**: Prisma, Better Auth server y los servicios de negocio viven exclusivamente en `server/` protegidos con `import "server-only"`. Ningún componente cliente puede importarlos.

## Estructura de carpetas

```txt
app/
├── (public)/
│   ├── page.tsx
│   ├── cursos/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── verificar/
│   │   ├── page.tsx
│   │   ├── [codigo]/page.tsx
│   │   └── no-encontrado/page.tsx
│   ├── ingresar/
│   │   └── page.tsx
│   └── layout.tsx
├── (campus)/
│   ├── layout.tsx
│   └── campus/
│       ├── page.tsx                 # Dashboard según rol (StudentDashboardView | TeacherDashboardView)
│       ├── cursos/
│       │   ├── page.tsx             # Cursos del estudiante o gestión de cursos del instructor
│       │   └── [cursoSlug]/page.tsx # Reproductor de aula virtual / editor de curso
│       ├── certificados/
│       │   └── page.tsx             # Colección del estudiante / emisión y revocación del instructor
│       ├── tareas/
│       │   └── page.tsx             # Entregas (texto/enlace) / bandeja de calificación
│       ├── estudiantes/
│       │   └── page.tsx             # Exclusivo instructor: matrículas y confirmación de pago
│       ├── perfil/
│       │   └── page.tsx             # Perfil del usuario (documento enmascarado)
│       ├── mesa-de-ayuda/
│       │   └── page.tsx             # Tickets de soporte
│       ├── calendario/page.tsx      # Vista estática / próximamente en MVP
│       └── comunidad/page.tsx       # Vista estática / próximamente en MVP
├── api/
│   ├── auth/[...all]/route.ts
│   └── certificados/[codigo]/pdf/route.ts
├── layout.tsx
├── error.tsx
└── not-found.tsx

features/
├── campus/
├── catalog/
├── learning/
├── assessments/
├── certificates/
├── landing/
└── auth/

server/
├── db.ts
├── auth.ts
├── policies.ts
└── services/

prisma/
├── schema.prisma
├── migrations/
└── seed.ts

components/
├── ui/
├── layout/
└── shared/

lib/
├── env.ts
└── utils.ts
```

## Rutas y layouts

| Grupo | Audiencia | Layout | Ejemplos |
| --- | --- | --- | --- |
| `(public)` | Visitantes y usuarios sin sesión | Header y footer público | `/`, `/cursos`, `/verificar/[codigo]`, `/ingresar` |
| `(campus)` | Estudiantes e instructores autenticados | Sidebar unificado y topbar de `/campus` adaptados por rol | `/campus`, `/campus/cursos`, `/campus/certificados`, `/campus/tareas`, `/campus/estudiantes` |

La comprobación real de sesión y rol se ejecuta en `server/policies.ts` dentro de cada Server Component / Server Action. El archivo `proxy.ts` (convención de Next.js 16) y el layout de `(campus)` redirigen a `/ingresar` cuando no existe sesión activa, pero nunca sustituyen la validación en la capa `server/`.

## Organización por feature y capa `server/`

Cada feature agrupa sus componentes, esquemas de validación (`zod`) y Server Actions que delegan en `server/services/`:

```txt
features/learning/
├── actions.ts          # "use server": valida con zod → llama a server/policies + server/services → revalidatePath
├── queries.ts          # "server-only": lecturas tipadas para Server Components
├── components/
├── schemas.ts          # esquemas zod compartidos entre formulario cliente y Server Action
└── types.ts
```

## Datos, estado y formularios

- **React Server Components + Server Actions (`revalidatePath`)**: lectura y mutación principal de datos sin necesidad de capa REST intermedia ni caché cliente compleja.
- **React Hook Form + Zod**: formularios y validaciones en cliente y servidor.
- **sonner**: notificaciones breves de éxito o error.
- **@react-pdf/renderer + qrcode**: generación en servidor del diploma PDF verificable en `/api/certificados/[codigo]/pdf`.
- **Cloudflare R2 (`@aws-sdk/client-s3`)**: subida directa desde el navegador con URLs prefirmadas para portadas e imágenes, servidas con `unoptimized` desde el dominio de medios.

## Reglas de negocio que la UI y el servidor deben respetar

1. **Matrícula pendiente (`PENDING`)**: muestra instrucciones de pago manual (**Yape / Plin + Transferencia BCP / Interbank + botón de WhatsApp**) y no permite acceder a las lecciones del aula hasta que el instructor titular del curso confirme el pago (`ACTIVE`).
2. **Aislamiento entre estudiantes**: un estudiante nunca puede consultar ni modificar matrículas, entregas o certificados de otro usuario.
3. **Confirmación de pago y emisión**: solo el instructor dueño del curso puede confirmar el pago de una matrícula, calificar entregas o emitir/revocar certificados de su curso.
4. **Accesibilidad del estado del certificado**: un certificado válido, vencido, observado o revocado conserva siempre su etiqueta textual explícita, nunca solo color.
5. **Verificación pública**: `/verificar/[codigo]` es pública, no solicita sesión, oculta parcialmente el documento de identidad y responde con `Cache-Control: no-store`.
6. **Sin comprobantes en plataforma**: no existe subida de comprobantes de pago en el MVP.
7. **Alta de instructores**: el registro público en `/ingresar` siempre asigna el rol `STUDENT`. El rol `INSTRUCTOR` se asigna mediante seed o el script CLI `pnpm make-instructor <email>`.
