# Certifox — Plan MVP: un solo proyecto Next.js, un solo deploy

> Estado: **Aprobado para ejecución** · 2026-10-16
> Enfoque: **"monorepo" = una única app Next.js** que contiene sitio público, campus unificado por rol (`/campus` para estudiante e instructor) **y** su propio backend (Server Actions + Route Handlers + Prisma). Sin NestJS, sin Turborepo, sin `packages/`. MVP **desechable pero funcional**: se prioriza que los flujos críticos funcionen de punta a punta sobre la perfección arquitectónica.

---

## 1. Punto de partida (verificado en el repo)

- **Stack base instalado:** Next 16.3.4 + React 19 + Tailwind 4 + shadcn/base-ui.
- **Rutas públicas maquetadas (`app/(public)`):** `/`, `/cursos`, `/cursos/[id]`, `/verificar`, `/verificar/[codigo]`, `/verificar/no-encontrado`, `/ingresar`.
- **Rutas de estudiante previas (`app/(student)`):** `/mi-aprendizaje`, `/mis-certificados`, `/perfil`, `/mesa-de-ayuda` con componentes ricos en `features/learning/components/*` alimentados por `data/*.ts`.
- **Nuevo shell unificado (`app/(campus)/campus` y `features/campus`):** layout unificado con sidebar dinámico por rol (`student` | `teacher`), dashboards (`StudentDashboardView`, `TeacherDashboardView`) y subrutas `/campus/cursos`, `/campus/certificados`, `/campus/tareas`, `/campus/estudiantes`, `/campus/calendario`, `/campus/comunidad`.
- **Faltan:**
  - Unificar las vistas ricas de `(student)` dentro de `/campus/*` y redirigir las rutas antiguas (`/mi-aprendizaje`, `/mis-certificados`, `/perfil`, `/mesa-de-ayuda`) hacia `/campus/*`.
  - Reproductor de curso / aula (`/campus/cursos/[cursoSlug]`) y vistas operativas de docente (CRUD básico de curso, confirmación de matrículas, calificación de entregas y emisión/revocación de certificados).
  - **Todo el backend:** no hay `server/`, Prisma, Better Auth ni variables de entorno configuradas.

### Cambios respecto al `architecture.md` original (este plan los sustituye)
| `architecture.md` anterior | Plan aprobado |
| --- | --- |
| Backend NestJS aparte; "no crear APIs de negocio en Next" | Backend **dentro** de Next: Server Actions para mutaciones, Server Components para lecturas |
| Rutas separadas `(student)/mi-aprendizaje` y `(instructor)/gestion` | **Shell unificado `/campus`** (`app/(campus)/campus/*`) que adapta navegación y vistas según el rol autenticado (`STUDENT` \| `INSTRUCTOR`) |
| Front no importa Prisma | Prisma solo en `server/`, protegido con `import "server-only"` y regla de lint |
| TanStack Query para estado remoto | No por defecto: RSC + `revalidatePath`. Se añade solo si una pantalla lo necesita |
| Back-office separado | Fuera del MVP (seed + scripts CLI + Prisma Studio) |
| Pago: sin comprobante en plataforma | Confirmación manual por el instructor; UI muestra instrucciones de **Yape/Plin + Transferencia (BCP/Interbank) + CTA a WhatsApp** |

---

## 2. Arquitectura objetivo

```txt
app/
├── (public)/                    # landing, cursos, verificar, ingresar (ya existe)
├── (campus)/
│   ├── layout.tsx               # Shell unificado de /campus (hidratado con sesión real)
│   └── campus/
│       ├── page.tsx             # Dashboard por rol (StudentDashboardView | TeacherDashboardView)
│       ├── cursos/
│       │   ├── page.tsx         # Estudiante: mis cursos matriculados (ActiveCoursesGrid) | Instructor: cursos a cargo + crear/editar
│       │   └── [cursoSlug]/     # Aula virtual (lecciones, progreso, evaluación) / editor de curso docente
│       ├── certificados/
│       │   └── page.tsx         # Estudiante: CertificatesCollectionView | Instructor: emisión y revocación
│       ├── tareas/
│       │   └── page.tsx         # Estudiante: entregas por texto/enlace | Instructor: bandeja de calificación
│       ├── estudiantes/
│       │   └── page.tsx         # Instructor: matrículas (PENDIENTE/ACTIVA/COMPLETADA) y acción "Confirmar pago"
│       ├── perfil/
│       │   └── page.tsx         # StudentProfileView adaptado a sesión real (documento enmascarado)
│       ├── mesa-de-ayuda/
│       │   └── page.tsx         # HelpDeskView (crear y listar tickets propios)
│       ├── calendario/          # Vista estática / próximamente en MVP (sin backend)
│       └── comunidad/           # Vista estática / próximamente en MVP (sin backend)
├── api/
│   ├── auth/[...all]/route.ts           # Better Auth
│   └── certificados/[codigo]/pdf/route.ts # Generación de PDF con @react-pdf/renderer
└── layout.tsx, error.tsx, not-found.tsx

features/
├── campus/          # Shell, navegación y dashboards por rol
├── catalog/         # Catálogo público, detalle de curso, modal de solicitud de matrícula (Yape/Plin/BCP/WhatsApp)
├── learning/        # Vistas de cursos del alumno, reproductor de aula, progreso, perfil y mesa de ayuda
├── assessments/     # Entregas de tareas (texto/URL) y calificación docente
├── certificates/    # Verificación pública, colección del alumno, emisión/revocación y plantilla PDF
└── auth/            # Login, registro y cliente Better Auth

server/              # Solo servidor ("server-only")
├── db.ts            # Cliente Prisma (Neon serverless driver/pooler)
├── auth.ts          # Better Auth + getSession()
├── policies.ts      # requireRole(), canManageCourse(), ownsEnrollment(), canAccessLesson()…
└── services/        # Reglas de negocio: enroll, confirmPayment, completeLesson, gradeSubmission, issueCertificate, revokeCertificate…

prisma/              # schema.prisma, migrations/, seed.ts (reutiliza data/*.ts)
lib/env.ts           # Variables de entorno validadas con zod
```

**Reglas arquitectónicas**
1. **La autorización vive en `server/policies.ts` y se invoca en cada query/acción.** El layout de `(campus)` y `proxy.ts` (en Next 16 `middleware` pasó a llamarse `proxy`: verificar siempre en `node_modules/next/dist/docs/`) solo redirigen por UX; las subrutas exclusivas de docente (`/campus/estudiantes`, acciones de curso/calificación/emisión) verifican `requireRole("INSTRUCTOR")` en servidor.
2. **Unificación en `/campus`:** el `CampusRoleContext` deja de usar usuarios mock hardcodeados en producción y recibe el usuario y rol reales desde el Server Layout (`app/(campus)/layout.tsx` → `getSession()`). Las rutas heredadas de `app/(student)` se eliminan tras mover sus vistas a `/campus/*` y se configuran redirecciones permanentes en `next.config.ts`.
3. Componentes cliente (`"use client"`) nunca importan de `server/`.
4. Toda entrada de usuario se valida con `zod` en la Server Action; los DTO devueltos a la UI no incluyen campos internos.
5. Texto de estado (`statusLabel`, etc.) se deriva en la UI desde enums; el modelo guarda solo el enum.

**Stack mínimo a instalar:**
- **ORM y BD:** `prisma`, `@prisma/client`, `@prisma/adapter-neon` (o `@neondatabase/serverless`, verificando compatibilidad con la versión instalada de Prisma).
- **Auth y validación:** `better-auth`, `zod`, `react-hook-form`, `@hookform/resolvers`, `server-only`.
- **UI y utilidades:** `sonner`, `date-fns`.
- **Almacenamiento y PDF:** `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `@react-pdf/renderer`, `qrcode` (para el QR del PDF).
- **Testing:** `vitest` (para tests unitarios de `server/policies.ts` y servicios críticos).
- **Diferido (no instalar en MVP):** `nuqs`, TanStack Query/Table, `react-dropzone`.

**Modelo de datos mínimo (`prisma/schema.prisma`):**
- `User` (`id`, `name`, `email`, `role: STUDENT | INSTRUCTOR`, `documentType`, `documentNumber`, `institution`, `avatarUrl`, tablas de Better Auth).
- `Course` (`id`, `slug`, `title`, `summary`, `category`, `level`, `hours`, `coverUrl`, `liveSessionUrl?`, `instructorId`, `published`).
- `Module` (`id`, `courseId`, `title`, `order`).
- `Lesson` (`id`, `moduleId`, `title`, `videoUrl`, `durationMin`, `order`).
- `Enrollment` (`id`, `userId`, `courseId`, `status: PENDING | ACTIVE | COMPLETED`, `createdAt`, `activatedAt`, `completedAt`, `@@unique([userId, courseId])`).
- `LessonProgress` (`id`, `enrollmentId`, `lessonId`, `completedAt`, `@@unique([enrollmentId, lessonId])`).
- `Assessment` (`id`, `courseId`, `title`, `instructions`, `passingScore`).
- `Submission` (`id`, `assessmentId`, `enrollmentId`, `contentUrlOrText`, `score?`, `feedback?`, `status: PENDING | APPROVED | REJECTED`, `gradedAt?`).
- `Certificate` (`id`, `enrollmentId @unique`, `code @unique`, `sha256`, `status: VALID | EXPIRED | REVOKED | OBSERVED`, `issuedAt`, `expiresAt?`, `revokedAt?`, `revocationReason?`).
- `Ticket` (`id`, `userId`, `subject`, `category`, `message`, `status: OPEN | CLOSED`, `createdAt`).
- `AuditLog` (`id`, `actorId`, `action`, `targetType`, `targetId`, `metadata`, `createdAt`).

## 2.1 Infraestructura (decidida)

| Pieza | Decisión | Puntos a cubrir |
| --- | --- | --- |
| ORM | Prisma | `prisma.config.ts`; migraciones con `prisma migrate deploy` en el build |
| BD | Neon (Postgres) | **Dos URLs**: `DATABASE_URL` (pooler `-pooler`, para runtime serverless) y `DIRECT_URL` (sin pooler, para migraciones). Región de Neon = región de las funciones de Vercel |
| Imágenes | Cloudflare R2 | Bucket con dominio propio (p. ej. `media.certifox.…`); **subida con URL prefirmada** desde el navegador; servir directo desde R2 + Cloudflare (`unoptimized` en `next/image` para evitar cuota de Vercel) |
| Caché | Cloudflare delante de Vercel (DNS con proxy) | Ver reglas abajo |
| Deploy | Vercel | Env vars por entorno (Production/Preview); mantener `next build --webpack`; Route Handler de PDF en runtime Node |

**Reglas de caché en Cloudflare (críticas)**
1. **No cachear HTML autenticado**: bypass si hay cookie de sesión; `/campus/*`, `/api/*` → `Cache-Control: private, no-store`.
2. **La verificación de certificados no puede quedar obsoleta** (AC-17): `Cache-Control: no-store` en `/verificar/*` + rate limit de Cloudflare.
3. Cachear agresivamente: `/_next/static/*` (inmutable) y el dominio de R2 (imágenes).
4. Opcional: catálogo (`/cursos/*`) con `s-maxage` corto (60–300 s). Recordar que `revalidatePath` **no** purga Cloudflare automáticamente.
5. SSL en modo *Full (strict)*; leer IP real desde `CF-Connecting-IP` para el rate limit; Better Auth con `trustedOrigins` para dominio de producción y previews.

**Variables de entorno** (`lib/env.ts` las valida con zod): `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `NEXT_PUBLIC_MEDIA_URL`, `NEXT_PUBLIC_PAYMENT_WHATSAPP` (y datos bancarios/Yape de pago si se parametrizan).

---

## 3. Requisitos funcionales

Prioridad: **M**ust / **S**hould / **C**ould / **W**on't (MVP). "UI" = estado actual de maquetación.

| ID | Requisito | P | UI |
| --- | --- | --- | --- |
| RF-01 | Catálogo y detalle de curso leídos de BD (búsqueda y filtro categoría/nivel por query string) | M | ✅ en `(public)/cursos` |
| RF-02 | **Verificación pública** `/verificar/[codigo]` sin sesión; estados válido/vencido/revocado/observado con etiqueta textual; "no encontrado" sin revelar existencia | M | ✅ en `(public)/verificar` |
| RF-03 | Registro, login y logout con email + contraseña (Better Auth) | M | ⚠️ UI en `/ingresar` sin lógica |
| RF-04 | Rutas protegidas en `/campus/*`: sin sesión redirige a `/ingresar`; el layout y subrutas renderizan según rol (`STUDENT` \| `INSTRUCTOR`); redirecciones desde `/mi-aprendizaje`, `/mis-certificados`, `/perfil`, `/mesa-de-ayuda` | M | ⚠️ shell en `(campus)` con rol mock |
| RF-05 | Solicitar matrícula → queda **PENDIENTE**; sin acceso al reproductor del curso (`/campus/cursos/[slug]`) | M | ⚠️ modal estático |
| RF-06 | Instructor del curso **confirma pago** en `/campus/estudiantes` → matrícula pasa a **ACTIVA** (sin subir comprobante en la web) | M | ❌ placeholder |
| RF-07 | Aula (`/campus/cursos/[slug]`): ver lecciones (video embebido YouTube/Vimeo), marcar completada, progreso persistente | M | ❌ |
| RF-08 | Evaluación simple en `/campus/tareas` (entrega de texto o enlace por el estudiante) y calificación/aprobación por el instructor | M | ❌ placeholder |
| RF-09 | Dashboard `/campus` y `/campus/cursos` del estudiante con cursos pendientes/activos/completados y progreso reales (integrando `ActiveCoursesGrid` y `CompletedCoursesSection`) | M | ✅ componentes en `learning/` |
| RF-10 | Instructor: crear/editar sus cursos (módulos y lecciones) desde `/campus/cursos` | M | ❌ placeholder |
| RF-11 | Instructor: lista de matrículas y estudiantes en `/campus/estudiantes` con filtro por estado y acción "Confirmar pago" | M | ❌ placeholder |
| RF-12 | Emisión de certificado al completar: código aleatorio de alta entropía, SHA-256, PDF descargable con `@react-pdf/renderer` y QR a `/verificar/[codigo]` | M | ⚠️ vista sin PDF |
| RF-13 | Revocación de certificado desde `/campus/certificados` (rol instructor) con motivo + registro en `AuditLog`; reflejada de inmediato en `/verificar/[codigo]` | M | ✅ vista pública de revocado |
| RF-14 | `/campus/certificados` (rol estudiante): listar, ver detalle y descargar PDF (integrando `CertificatesCollectionView`) | M | ✅ en `learning/` |
| RF-15 | `/campus/perfil`: ver y editar datos permitidos; documento de identidad enmascarado (integrando `StudentProfileView`) | S | ✅ en `learning/` |
| RF-16 | `/campus/mesa-de-ayuda`: crear y listar tickets propios (integrando `HelpDeskView`) | S | ✅ en `learning/` |
| RF-17 | Recuperar contraseña / Login con Google / emails transaccionales | C | ❌ |
| RF-18 | Subida de archivos adjuntos en tareas, `/campus/calendario` dinámico, `/campus/comunidad` (foros reales), ledger/blockchain, back-office, pasarela de pago | W | — (calendario y comunidad quedan como vista estática/próximamente) |
| RF-19 | **Alta de instructores sin back-office**: rol `INSTRUCTOR` asignado por seed o script CLI (`pnpm make-instructor <email>`); el registro público siempre crea `STUDENT` | M | ❌ |
| RF-20 | **Instrucciones de pago manual** al solicitar matrícula: muestra datos de **Yape / Plin**, **Transferencia bancaria (BCP / Interbank)** y botón directo a **WhatsApp** con mensaje prellenado para enviar constancia; explica el estado "Pendiente de activación" | M | ⚠️ modal a actualizar |
| RF-21 | Subida de imágenes a R2 (portada de curso, avatar) con URL prefirmada; migración de imágenes del seed a R2 (eliminar hotlinks a `lh3.googleusercontent.com` y `images.unsplash.com`) | M | ❌ |
| RF-22 | Páginas legales estáticas: política de privacidad y términos y condiciones | S | ❌ |
| RF-23 | Vencimiento de certificados calculado **al leer** (`expiresAt < now` ⇒ `EXPIRED`), sin cron | M | ❌ |

---

## 4. Requisitos no funcionales (nivel "desechable pero funcional")

**Innegociables** (aunque sea desechable): seguridad y privacidad de datos reales.

| ID | Requisito |
| --- | --- |
| RNF-01 | **Autorización por propiedad y rol en servidor** (`server/policies.ts`). Un estudiante no puede leer/modificar datos ajenos ni ejecutar acciones de instructor aunque manipule IDs o invoque Server Actions directamente. |
| RNF-02 | Contraseñas gestionadas por Better Auth (hash); cookies `HttpOnly` + `Secure`; sin secretos en el bundle cliente (solo `NEXT_PUBLIC_*`). |
| RNF-03 | Documento de identidad enmascarado en toda vista pública; sin PII en logs. |
| RNF-04 | Códigos de certificado no secuenciales y de alta entropía (≥ 96 bits). Límite de consultas simple en verificación (30 req/min). |
| RNF-05 | Toda mutación valida entrada con `zod` y devuelve errores de UI legibles (sin trazas). |
| RNF-12 | Unicidad en BD: una matrícula por `(userId, courseId)` y un certificado por `enrollmentId`; emisión y confirmación idempotentes. |
| RNF-13 | Subidas a R2: solo `image/jpeg|png|webp`, tamaño máx. 2 MB, nombre de objeto generado por el servidor. |

**Calidad mínima**

| ID | Requisito |
| --- | --- |
| RNF-06 | `pnpm lint`, `tsc --noEmit` y `pnpm build` en verde antes de cada deploy (GitHub Action simple). |
| RNF-07 | Estados de carga/vacío/error en pantallas con datos; el estado de un certificado nunca se transmite solo por color. |
| RNF-08 | Usable desde 360 px en pantallas de `/campus` y `/verificar`. |
| RNF-09 | Páginas públicas rápidas: LCP ≤ 3 s en móvil (medición manual con Lighthouse; sin gate en CI). |
| RNF-10 | Catálogo y detalle con `metadata`; verificación y `/campus/*` con `noindex`. |
| RNF-11 | Arranque local en ≤ 5 comandos documentados (`pnpm i`, `.env`, `prisma migrate dev`, `prisma db seed`, `pnpm dev`). |

**Deuda aceptada conscientemente (no se hará en el MVP):** cobertura de tests amplia, e2e exhaustivo, observabilidad/APM, accesibilidad AA formal, i18n, caché avanzada, CI por afectados, tests de carga, foros ni calendario en tiempo real.

---

## 5. Criterios de aceptación del MVP

El MVP se acepta cuando **todos** pasan en el entorno desplegado (Dado / Cuando / Entonces).

**Plataforma y rutas**
- **AC-01** Con un clon limpio, `pnpm i && prisma migrate deploy && prisma db seed && pnpm build` termina sin errores y la app arranca con datos de demostración (cursos, un instructor, un estudiante, certificados en cada estado).
- **AC-02** Las redirecciones públicas (`/verificar-certificado` → `/verificar`) y las de consolidación de campus (`/mi-aprendizaje` → `/campus/cursos`, `/mis-certificados` → `/campus/certificados`, `/perfil` → `/campus/perfil`, `/mesa-de-ayuda` → `/campus/mesa-de-ayuda`) funcionan correctamente.
- **AC-03** El bundle cliente no contiene `DATABASE_URL`, secretos de auth ni código de `server/` (revisión de `.next/static` y regla de lint).

**Verificación pública (RF-02, RF-13)**
- **AC-04** Dado un código válido, cuando un visitante sin sesión abre `/verificar/{codigo}`, entonces ve curso, titular con documento enmascarado, fechas, huella SHA-256 y la etiqueta **"Válido"**.
- **AC-05** Dado un certificado revocado/vencido/observado, entonces la etiqueta textual lo indica (y para revocado: fecha y motivo).
- **AC-06** Dado un código inexistente, entonces se muestra "no encontrado" con HTTP 404.
- **AC-07** El QR del PDF descargado desde `/api/certificados/{codigo}/pdf` abre la verificación del mismo código.

**Auth y permisos en `/campus` (RF-03, RF-04)**
- **AC-08** Un email nuevo puede registrarse (siempre con rol `STUDENT`) e iniciar sesión; credenciales inválidas muestran un mensaje genérico.
- **AC-09** Sin sesión, cualquier ruta `/campus/*` redirige a `/ingresar`; con sesión, `/campus` muestra el dashboard y menú correspondientes al rol real del usuario (`STUDENT` vs `INSTRUCTOR`), y un estudiante que intenta acceder a `/campus/estudiantes` o invocar acciones de instructor es rechazado con 403.
- **AC-10** Un estudiante que consulta por ID cursos, entregas o certificados de otro estudiante recibe 404/403 (verificado con tests unitarios de `server/policies.ts`).

**Matrícula y aprendizaje (RF-05 – RF-09, RF-20)**
- **AC-11** Al solicitar matrícula en un curso, se muestran las instrucciones de pago (**Yape/Plin, Transferencia BCP/Interbank y botón de WhatsApp**), la matrícula queda en estado `PENDING` y `/campus/cursos/{slug}` no permite reproducir las lecciones hasta su activación.
- **AC-12** El instructor **dueño del curso** confirma el pago desde `/campus/estudiantes` y el estudiante accede al aula; otro instructor no puede confirmarlo.
- **AC-13** Al completar una lección en `/campus/cursos/{slug}` y recargar, el progreso persiste y coincide con `/campus` y `/campus/cursos`.
- **AC-14** Entregada la evaluación en `/campus/tareas`, aprobada por el instructor y completadas las lecciones, la matrícula pasa a `COMPLETED`.
- **AC-15** No existe UI ni endpoint para subir comprobante de pago en la web.

**Certificación (RF-12 – RF-14)**
- **AC-16** Con la matrícula completada, el instructor emite el certificado desde `/campus/certificados`: se crea código único + SHA-256 y el estudiante lo ve en `/campus/certificados` y lo descarga en PDF.
- **AC-17** Al revocarlo con motivo, `/verificar/{codigo}` muestra "Revocado" de inmediato **también a través de Cloudflare** (`cf-cache-status` = `BYPASS`/`DYNAMIC`) y queda registro en `AuditLog`.

**Instructor (RF-10, RF-11)**
- **AC-18** El instructor crea o edita un curso con módulos y lecciones en `/campus/cursos` y aparece en el catálogo público; solo ve/edita sus propios cursos.

**Infraestructura (R2, Cloudflare, Neon)**
- **AC-19** Existe una URL desplegada con el flujo de humo funcionando y el procedimiento para restaurar/reseedear la BD documentado en el `README.md`.
- **AC-20** Un instructor sube la portada de un curso: el navegador sube directo a R2 con URL prefirmada, un archivo > 2 MB o de otro tipo es rechazado, y la imagen se sirve directo desde el dominio de medios de R2.
- **AC-21** Rutas autenticadas (`/campus/*`) devuelven `no-store` y nunca `cf-cache-status: HIT`; `/_next/static/*` e imágenes de R2 sí salen `HIT` en la segunda petición.
- **AC-22** El build en Vercel ejecuta migraciones con `DIRECT_URL` y la app corre con el pooler (`DATABASE_URL`); 20 peticiones concurrentes no agotan conexiones.
- **AC-23** Un registro público no puede obtener rol `INSTRUCTOR`; el script `pnpm make-instructor <email>` sí lo asigna.
- **AC-24** Ninguna imagen del catálogo ni del seed carga desde dominios de terceros (`lh3.googleusercontent.com` / `images.unsplash.com`).

---

## 6. Plan de ejecución por fases

Cada fase termina con `pnpm lint`, `tsc --noEmit` y `pnpm build` en verde.

| Fase | Contenido | Cubre |
| --- | --- | --- |
| **0 · Preparación y consolidación de rutas** (S) | Actualizar `architecture.md` y `README.md`; consolidar las vistas de `app/(student)` dentro de `app/(campus)/campus/*` (`/campus/cursos`, `/campus/certificados`, `/campus/perfil`, `/campus/mesa-de-ayuda`); configurar redirecciones en `next.config.ts` y eliminar `app/(student)`; dejar `/campus/calendario` y `/campus/comunidad` como vistas estáticas "Próximamente"; crear `.env.example` | AC-02 |
| **1 · Cimientos (BD, Auth y Policies)** (M) | Configurar Neon, R2, Cloudflare y Vercel; instalar dependencias (`prisma`, `better-auth`, `zod`, `react-hook-form`, `sonner`, `server-only`, AWS SDK S3, `@react-pdf/renderer`, `vitest`); crear `lib/env.ts`; definir `prisma/schema.prisma` + migración inicial + `prisma/seed.ts` + script `make-instructor`; implementar `server/db.ts`, `server/auth.ts`, `server/policies.ts` (con tests en Vitest); conectar `/ingresar` y `app/(campus)/layout.tsx` a la sesión real de Better Auth (`proxy.ts` para protección de `/campus/*`) | AC-01, 03, 08, 09, 10, 22, 23 |
| **2 · Verificación pública real** (S) | Conectar `/verificar` y `/verificar/[codigo]` a Prisma; cálculo al vuelo de `EXPIRED` (RF-23); 404 real; enmascarado de documento de identidad; cabecera `no-store` | AC-04, 05, 06 |
| **3 · Catálogo y flujo de matrícula** (M) | Conectar `/`, `/cursos` y `/cursos/[id]` a Prisma; actualizar `EnrollmentModal` con instrucciones de **Yape/Plin + Transferencia BCP/Interbank + botón WhatsApp** y Server Action `requestEnrollment` (`PENDING`); conectar `/campus/estudiantes` (vista instructor) para listar matrículas y acción `confirmPayment` (`ACTIVE`) | AC-11, 12, 15 |
| **4 · Aula, tareas y aprendizaje del estudiante** (M) | Crear `/campus/cursos/[cursoSlug]` (reproductor de lecciones con video embebido y botón "Marcar como completada"); conectar dashboard `/campus` y `/campus/cursos` del estudiante a datos reales; conectar `/campus/tareas` para envío de entrega (texto/URL) por el alumno y calificación/aprobación por el instructor (pasa matrícula a `COMPLETED`) | AC-13, 14 |
| **5 · Gestión de cursos y Certificados (PDF + QR)** (M) | CRUD de cursos/módulos/lecciones para el instructor en `/campus/cursos`; emisión de certificado (código de alta entropía + SHA-256) y revocación con `AuditLog` en `/campus/certificados`; Route Handler `/api/certificados/[codigo]/pdf` con `@react-pdf/renderer` y QR; descarga en `/campus/certificados` del estudiante | AC-07, 16, 17, 18 |
| **6 · R2, vistas secundarias y cierre de producción** (S) | Presigned URLs de subida a R2 para portadas/avatares y migración de imágenes del seed a R2; conectar `/campus/perfil` y `/campus/mesa-de-ayuda` a BD; páginas legales (`/privacidad`, `/terminos`); validar reglas de caché en Cloudflare y ejecutar flujo de humo completo en producción | AC-19, 20, 21, 24 |

**Orden de recorte si falta tiempo:** primero RF-16 (mesa de ayuda) y RF-15 (edición de perfil), luego la evaluación pasa a "auto-aprobada al completar lecciones", luego el CRUD de cursos se sustituye por seed. **No recortar:** RF-02, RF-05/06, RF-12/13 ni las policies (RNF-01).

---

## 7. Decisiones cerradas

| # | Tema | Decisión tomada |
| --- | --- | --- |
| D1 | Base de datos | **Neon (Postgres)** con `DATABASE_URL` (pooler) y `DIRECT_URL` (migraciones) |
| D2 | Alojamiento de video y sesiones | **URL embebida** (YouTube no listado / Vimeo) para lecciones asíncronas y link externo (Zoom/Meet) para sesiones en vivo |
| D3 | Generación de PDF de certificados | **`@react-pdf/renderer`** en Route Handler Node (`/api/certificados/[codigo]/pdf`) con código QR hacia `/verificar/[codigo]` |
| D4 | Entregas de tareas | **Texto o enlace (URL)** en `/campus/tareas`; sin subida de archivos por parte del estudiante en el MVP |
| D5 | Repo externo `leoaguinaga/certifox` | Proyecto B2B separado; solo referencia técnica para Better Auth + Prisma |
| D6 | Rate limit en verificación | **30 consultas/min por IP** (en Cloudflare y/o aplicación) |
| D7 | Optimización de imágenes | **Directo desde R2 + Cloudflare** (`unoptimized` en `next/image`) para evitar cuota de Vercel |
| D8 | Estructura de rutas autenticadas | **Unificada en `/campus` (`app/(campus)/campus/*`)** para estudiante e instructor; las vistas de `(student)` se migran a `/campus/*` con redirecciones |
| D9 | Medios de pago manuales (RF-20) | **Yape / Plin + Transferencia bancaria (BCP / Interbank) + botón de confirmación por WhatsApp** |

---

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Falta de capa API separada difumina permisos | Todo acceso a datos pasa por `server/services` + `server/policies.ts`; test unitario obligatorio de AC-10 |
| Selector de rol en `/campus` expone vistas de docente a alumnos | Reemplazar el toggle libre de `CampusRoleContext` por el rol real de la sesión (`getSession()`) en el Server Layout de `(campus)`, y validar `requireRole("INSTRUCTOR")` en cada query/acción de docente |
| Server Actions con IDs manipulables | Autorizar por propiedad (`ownsEnrollment`, `canManageCourse`) en cada acción; nunca confiar en IDs enviados por el cliente |
| Next 16 cambia convenciones (`proxy`, `params` asíncronos, caché) | Leer `node_modules/next/dist/docs/` antes de implementar cada pieza nueva (regla de `AGENTS.md`) |
| Filtración de datos personales en verificación pública | Mostrar solo el mínimo (nombre, documento enmascarado, curso, fechas, hash) |
| Doble caché (Cloudflare + Vercel) sirve datos obsoletos | Reglas de §2.1 (`no-store` en `/campus/*` y `/verificar/*`); verificar con `cf-cache-status` (AC-17 y AC-21) |
| Conexiones agotadas contra Neon en serverless | Pooler + adaptador de driver; AC-22 |
| Migraciones en build de Vercel | Probar `prisma migrate deploy` en un preview antes del deploy final |
