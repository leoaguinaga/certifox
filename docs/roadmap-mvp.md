# Roadmap de desarrollo del MVP Certifox

> **Documento de referencia para el desarrollador:** qué se construye, cómo se construye, en qué orden y cómo sabremos que está terminado.
> 
> - **Versión:** 1.0  
> - **Fecha:** 19 oct 2026  
> - **Duración estimada:** ≈ 9 semanas  
> - **Repositorio:** `front-office`  
> - **Autor / Organización:** Foxcode · Certifox  

---

## 00. Cómo usar este documento

Este documento es el faro del proyecto. Si tienes que tomar una decisión sobre alcance, arquitectura, prioridad o criterios de aceptación, la respuesta debería estar aquí. Si no está, o si encuentras una contradicción, **pregunta antes de decidir por tu cuenta**.

### Orden de precedencia de las fuentes
1. **Este documento.**
2. `front-office/docs/monorepo-plan.md` (plan aprobado el 16 oct 2026).
3. `front-office/architecture.md` y `docs/design.md`.

*Los documentos `docs/planning.md`, `backend/architecture.md` y `back-office/architecture.md` describen una arquitectura anterior con tres servicios y NestJS. **No aplican al MVP**; se conservan como referencia para la etapa posterior.*

### Contenido
- [01. El producto en una página](#01-el-producto-en-una-página)
- [02. Alcance del MVP](#02-alcance-del-mvp)
- [03. Arquitectura y stack](#03-arquitectura-y-stack)
- [04. Modelo de datos y estados](#04-modelo-de-datos-y-estados)
- [05. Reglas de negocio innegociables](#05-reglas-de-negocio-innegociables)
- [06. Estado actual del repositorio](#06-estado-actual-del-repositorio)
- [07. Roadmap y cronograma](#07-roadmap-y-cronograma)
- [08. Fases detalladas (F1–F7)](#08-fases-detalladas-f1f7)
- [09. Requisitos no funcionales](#09-requisitos-no-funcionales)
- [10. Forma de trabajo y Definition of Done](#10-forma-de-trabajo-y-definition-of-done)
- [11. Sistema de diseño: guía rápida](#11-sistema-de-diseño-guía-rápida)
- [12. Riesgos, decisiones cerradas y backlog](#12-riesgos-decisiones-cerradas-y-backlog)

---

## 01. El producto en una página

**Certifox** es una plataforma **B2B2C** para profesionales independientes y certificadoras pequeñas que venden cursos grabados con certificado. Reemplaza el uso disperso de Google Drive, WhatsApp y hojas de cálculo por un solo lugar donde el alumno estudia y aprueba, y donde recibe un certificado que cualquiera puede verificar.

### Propuesta de valor
> Convierte tus cursos dispersos en una plataforma profesional donde tus alumnos estudian, aprueban y reciben certificados verificables.

### Cliente inicial
Profesionales con unos **4 cursos** y **15–20 alumnos** cada uno. El MVP se valida con **dos prospectos reales**, con sus cursos y alumnos reales.

### Usuarios del MVP

| Rol | Qué necesita |
| :--- | :--- |
| **Visitante** | Explorar cursos y verificar un certificado sin cuenta. |
| **Estudiante** (`STUDENT`) | Matricularse, estudiar, entregar tareas y descargar su certificado. |
| **Instructor** (`INSTRUCTOR`) | Publicar cursos, confirmar pagos, calificar y emitir o revocar certificados. |

### Problema → Respuesta

| Dolor Actual | Certifox |
| :--- | :--- |
| Videos y materiales en carpetas | Aula por curso, módulo y lección. |
| Seguimiento por WhatsApp | Progreso y matrículas en un panel. |
| Control informal de pagos | Estado de matrícula y confirmación manual. |
| Evaluación poco trazable | Tareas con calificación docente. |
| Certificados falsificables | PDF con código único, QR y verificación pública. |

---

### Flujo central del MVP (Lo único que tiene que funcionar de punta a punta)

1. **Visitante (Catálogo):** Encuentra el curso y lo revisa.
2. **Estudiante (Solicita matrícula):** Queda `PENDING` y ve cómo pagar.
3. **Fuera de la web (Paga):** Yape, Plin o transferencia bancaria, y avisa por WhatsApp.
4. **Instructor (Confirma pago):** La matrícula pasa a `ACTIVE`.
5. **Estudiante (Aula):** Ve lecciones y su progreso se guarda.
6. **Estudiante + Instructor (Tarea):** Entrega, calificación y pasa a `COMPLETED`.
7. **Instructor (Certificado):** Emite PDF con código y QR.
8. **Cualquiera (Verifica):** Consulta `/verificar/[codigo]`.

### Indicadores del piloto (Cómo sabremos que el MVP funciona)

| Indicador | Señal de validación |
| :--- | :--- |
| **Activación de cliente** | Un instructor publica un curso y matricula alumnos reales. |
| **Activación estudiantil** | Al menos el 70% de los alumnos confirmados entra al aula. |
| **Consumo** | Al menos el 50% completa una lección o una evaluación durante el piloto. |
| **Eficiencia operativa** | El instructor ve pagos, avance y pendientes sin usar Excel. |
| **Certificación** | Se emite y se verifica por QR al menos un certificado real. |

---

## 02. Alcance del MVP

El MVP es **desechable pero funcional**: lo prioritario es que los flujos críticos funcionen de punta a punta con datos reales y sean seguros. La perfección arquitectónica no es la meta. La seguridad y la privacidad de los datos reales no se negocian.

### ✓ Dentro del MVP
- Landing, catálogo con búsqueda y filtros, detalle de curso.
- Registro, login y logout con email y contraseña.
- Campus unificado `/campus` que se adapta al rol.
- Solicitud de matrícula con instrucciones de pago manual (Yape/Plin, BCP/Interbank y botón de WhatsApp).
- Confirmación manual del pago por el instructor.
- Aula: video embebido (YouTube no listado o Vimeo), marcar lecciones como completadas y progreso guardado.
- Tareas por texto o enlace con calificación del instructor.
- CRUD de cursos, módulos y lecciones por el instructor.
- Emisión de certificados (PDF + QR + SHA-256) y revocación con motivo.
- Verificación pública `/verificar/[codigo]`.
- Perfil (documento enmascarado) y mesa de ayuda básica.
- Subida de portadas y avatares a R2.
- Páginas legales: privacidad y términos.

### ✕ Fuera del MVP (no construir)
- Pasarela de pagos, conciliación o subida de comprobantes.
- Back-office de Foxcode: en su lugar se usan seed, scripts CLI y Prisma Studio.
- API NestJS separada.
- Multi-organización y marca blanca: en el MVP el curso pertenece al instructor.
- Quizzes autocalificados y examen final con intentos.
- Subida de archivos en las entregas de tareas.
- Login con Google, recuperación de contraseña y emails transaccionales.
- Calendario y comunidad reales (solo una vista «Próximamente»).
- App móvil, clases en vivo integradas, chat, foros y gamificación.
- Facturación electrónica, proctoring, IA y analítica avanzada.
- Suplantación de usuarios.

### Si falta tiempo, este es el orden de recorte
1. Mesa de ayuda (RF-16)
2. Edición de perfil (RF-15)
3. La evaluación pasa a «auto-aprobada al completar lecciones»
4. El CRUD de cursos se reemplaza por seed.

> **Nunca se recorta:** la verificación pública (RF-02), la matrícula y la confirmación de pago (RF-05/06), la emisión y revocación de certificados (RF-12/13) ni las policies de autorización (RNF-01).

---

## 03. Arquitectura y stack

**Una sola app Next.js y un solo deploy.** La app contiene el sitio público, el campus por rol y su propio backend: Server Components para leer, Server Actions para mutar y Route Handlers para auth y PDF. No hay Turborepo, `packages/` ni NestJS.

| Capa | Tecnología | Notas |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3 (App Router) · React 19 · TypeScript | Next 16 cambia convenciones: `proxy.ts` reemplaza a middleware y `params` es asíncrono. Lee `node_modules/next/dist/docs/` antes de usar una API nueva. |
| **UI** | Tailwind 4 · shadcn/base-ui · Lucide · Manrope | Tokens en `app/globals.css`; ver sección 11. |
| **Formularios** | React Hook Form + Zod 4 · sonner | El mismo esquema zod se usa en el cliente y en la Server Action. |
| **Datos** | Prisma 6 · Neon Postgres | `DATABASE_URL` (pooler) en runtime y `DIRECT_URL` en migraciones. |
| **Auth** | Better Auth (email + contraseña) | El registro público siempre crea `STUDENT`. |
| **Archivos** | Cloudflare R2 (SDK S3) con URLs prefirmadas | Las imágenes se sirven desde el dominio de medios con `unoptimized`. |
| **PDF y QR** | `@react-pdf/renderer` + `qrcode` | Route Handler en runtime Node. |
| **Tests** | Vitest | Obligatorios en policies y en los servicios críticos. |
| **Deploy y CDN** | Vercel + Cloudflare (proxy DNS) | Reglas de caché críticas: ver RNF. |
| **Paquetes** | pnpm 10 | No usar npm ni yarn. |

### Estructura de carpetas

```text
app/
├── (public)/          # landing, /cursos, /cursos/[id], /verificar/[codigo], /ingresar, /privacidad, /terminos
├── (campus)/campus/   # dashboard por rol, cursos, cursos/[cursoSlug], certificados, tareas,
│                      # estudiantes (solo instructor), perfil, mesa-de-ayuda, calendario*, comunidad*
└── api/               # auth/[...all] · certificados/[codigo]/pdf
features/              # components/ · actions.ts ("use server") · queries.ts (server-only) · schemas.ts · types.ts
server/                # db.ts · auth.ts · policies.ts · services/ ← solo servidor, import "server-only"
prisma/                # schema.prisma · migrations/ · seed.ts
lib/env.ts             # variables de entorno validadas con zod
                       # * vista estática «Próximamente»
```

### Reglas arquitectónicas (no negociables)

- **A1:** La autorización vive en `server/policies.ts` y se invoca en cada query y en cada Server Action. `proxy.ts` y los layouts solo redirigen por UX: **nunca son la barrera de seguridad**.
- **A2:** Prisma, Better Auth server y la lógica de negocio solo viven en `server/`, con import `"server-only"`. Un componente `"use client"` nunca importa de `server/`.
- **A3:** Flujo de una mutación: la Server Action valida con zod → la policy autoriza (rol y propiedad) → `server/services` aplica la regla → `revalidatePath`. Nunca se confía en IDs que envía el cliente.
- **A4:** El rol sale de la sesión real (`getSession()` en el layout de `(campus)`). El selector de rol mock de `CampusRoleContext` se elimina.
- **A5:** Los DTO que llegan a la UI no incluyen campos internos. La BD guarda enums y la UI deriva las etiquetas legibles.
- **A6:** Server Components por defecto; `"use client"` solo para interactividad. No añadir TanStack Query, Redux ni Zustand salvo que una pantalla lo justifique.

---

## 04. Modelo de datos y estados

El esquema ya existe en `prisma/schema.prisma` (≈300 líneas). Este es el resumen. Si una fase necesita cambiar el modelo, el cambio se hace con una migración nueva y se explica en el PR.

| Modelo | Campos clave | Restricciones |
| :--- | :--- | :--- |
| **User** (+ Session, Account, Verification de Better Auth) | `name`, `email`, `role`, `documentType`, `documentNumber`, `institution`, `avatarUrl` | `role ∈ STUDENT \| INSTRUCTOR` |
| **Course** | `slug`, `title`, `summary`, `category`, `level`, `hours`, `coverUrl`, `liveSessionUrl?`, `instructorId`, `published` | Pertenece a un instructor. |
| **Module / Lesson** | `title`, `order` · `videoUrl`, `durationMin` | Ordenados por `order`. |
| **Enrollment** | `userId`, `courseId`, `status`, `activatedAt`, `completedAt` | Única por `(userId, courseId)`. |
| **LessonProgress** | `enrollmentId`, `lessonId`, `completedAt` | Única por `(enrollmentId, lessonId)`. |
| **Assessment / Submission** | `passingScore` · `contentUrlOrText`, `score?`, `feedback?`, `status` | Entrega por texto o URL. |
| **Certificate** | `code`, `sha256`, `status`, `issuedAt`, `expiresAt?`, `revokedAt?`, `revocationReason?` | Único por `enrollmentId`; `code` único con ≥ 96 bits. |
| **Ticket** | `subject`, `category`, `message`, `status` | `OPEN \| CLOSED` |
| **AuditLog** | `actorId`, `action`, `targetType`, `targetId`, `metadata`, `createdAt` | Solo se inserta; nunca se edita. |

### Máquinas de estado

- **Matrícula:**
  - `PENDING` — *(instructor confirma pago)* → `ACTIVE` — *(lecciones completas + tarea aprobada)* → `COMPLETED`
  - *Solo con `ACTIVE` o `COMPLETED` se ven las lecciones. La confirmación es idempotente y genera `AuditLog`.*
- **Entrega:**
  - `PENDING` — *(instructor califica)* → `APPROVED` o `REJECTED` *(se puede volver a entregar)*
- **Certificado:**
  - `VALID` → `EXPIRED` *(calculado al leer: `expiresAt < now`, sin cron)* · `REVOKED` *(con motivo + AuditLog)* · `OBSERVED`

### Diferencias con el documento de producto, aceptadas para el MVP
`docs/product.md` describe seis estados de matrícula, organizaciones con varios instructores, quizzes y examen final con intentos. El MVP se simplifica a tres estados de matrícula, cursos que pertenecen al instructor y tareas con calificación manual.  
**No implementes el modelo completo de product.md: llegará en la siguiente etapa.**

---

## 05. Reglas de negocio innegociables

- **R1:** Solo una matrícula con pago confirmado (`ACTIVE` / `COMPLETED`) da acceso a las lecciones. El estado se vuelve a validar en el servidor en cada acceso.
- **R2:** Solo el instructor dueño del curso puede confirmar pagos, calificar entregas y emitir o revocar certificados de ese curso.
- **R3:** Un estudiante nunca puede leer ni modificar matrículas, entregas, progreso o certificados de otro, aunque manipule IDs o llame a las Server Actions directamente.
- **R4:** No existe UI ni endpoint para subir comprobantes de pago. El pago ocurre fuera de la plataforma.
- **R5:** El registro público siempre asigna `STUDENT`. El rol `INSTRUCTOR` solo se asigna con el seed o con `pnpm make-instructor <email>`.
- **R6:** Todo cambio sensible deja un registro en `AuditLog` con actor, recurso, acción, fecha y motivo: confirmación de pago, calificación, emisión y revocación.
- **R7:** La verificación pública muestra el mínimo: nombre, documento enmascarado, curso, fechas, hash y estado. Responde `no-store` y un código inexistente da 404 sin revelar nada.
- **R8:** Los códigos de certificado no son secuenciales y tienen ≥ 96 bits de entropía. La emisión es idempotente: un solo certificado por matrícula.
- **R9:** El estado de un certificado siempre se comunica con texto, nunca solo con color.

---

## 06. Estado actual del repositorio

Trabajarás sobre el repo `front-office`. Esta es la foto al 19 oct 2026, para que sepas desde dónde partes:

### Hecho
- ✓ Next 16 + React 19 + Tailwind 4 + shadcn instalados.
- ✓ Rutas públicas maquetadas: `/`, `/cursos`, `/cursos/[id]`, `/verificar`, `/verificar/[codigo]` e `/ingresar`.
- ✓ Fase 0: campus unificado en `/campus/*` con sidebar por rol y redirecciones de las rutas antiguas.
- ✓ Componentes ricos de estudiante (cursos, certificados, perfil, mesa de ayuda) alimentados por `data/*.ts`.
- ✓ Plan, requisitos y criterios de aceptación aprobados.

### Empezado, sin commit (Foxcode commiteará este trabajo antes de que empieces)
- `prisma/schema.prisma` y `seed.ts`.
- `server/db.ts`, `auth.ts` y `policies.ts` (7 funciones) con 6 tests en Vitest.
- `lib/env.ts`, `lib/auth-client.ts` y la ruta `api/auth`.
- Formularios de login y registro conectándose.
- Script `make-instructor`.
- Workflow de CI: lint, tsc, tests y build.

### Falta
- Migración inicial (no existe `prisma/migrations/`).
- Infraestructura: Neon, R2, Cloudflare y Vercel.
- `server/services/` completo.
- Conectar todas las vistas a datos reales.
- Aula `/campus/cursos/[cursoSlug]`.
- Vistas operativas del instructor.
- PDF de certificados, subida a R2 y páginas legales.

### Primer día
Clona el repo y sigue el arranque local del `README.md` (≤ 5 comandos: `pnpm i`, `.env`, `prisma migrate dev`, `prisma db seed` y `pnpm dev`). Lee `AGENTS.md`, `architecture.md`, `docs/monorepo-plan.md` y `docs/design.md`. Revisa el código de la Fase 1 y anota tus dudas antes de continuar.

### Variables de entorno (validadas en `lib/env.ts`)
```env
DATABASE_URL
DIRECT_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET
NEXT_PUBLIC_MEDIA_URL
NEXT_PUBLIC_PAYMENT_WHATSAPP
# y los datos de Yape y de cuentas bancarias si se parametrizan.
# Foxcode entrega las credenciales; nunca se commitean.
```

---

## 07. Roadmap y cronograma

Las duraciones son orientativas, para un desarrollador a tiempo completo; se ajustan al firmar. Cada fase termina con una demo sobre el entorno desplegado y con los criterios de aceptación de la fase en verde. Una fase no se da por cerrada hasta que Foxcode la aprueba.

| Fase | Duración estimada | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **F0 · Consolidación de rutas** | Hecha | █ | | | | | | | | |
| **F1 · Cimientos: BD, auth, policies** | 1 semana | █ | | | | | | | | |
| **F2 · Verificación pública real** | 0,5 semanas | | █ | | | | | | | |
| **F3 · Catálogo y matrícula** | 1,5 semanas | | █ | █ | | | | | |
| **F4 · Aula, tareas y progreso** | 2 semanas | | | | █ | █ | | | |
| **F5 · Gestión de cursos y certificados** | 2 semanas | | | | | | █ | █ | |
| **F6 · R2, vistas secundarias y prod** | 1 semana | | | | | | | | █ |
| **F7 · Piloto con prospectos** | 1 sem + soporte | | | | | | | | | █ |

### Hitos de entrega

| Hito | Semana | Qué se puede demostrar |
| :--- | :--- | :--- |
| **H1** | Fin S1 | Login real, rol desde la sesión, policies con tests y deploy en Vercel con Neon. |
| **H2** | Fin S3 | Verificación pública real y el flujo de matrícula hasta la confirmación de pago. |
| **H3** | Fin S5 | Un alumno estudia el curso completo, entrega la tarea y queda `COMPLETED`. |
| **H4** | Fin S7 | El instructor crea un curso y emite un certificado; el PDF con QR se verifica. |
| **H5** | Fin S8 | MVP aceptado: los 24 criterios de aceptación pasan en producción. |
| **H6** | Fin S9 | Dos prospectos usan Certifox con cursos y alumnos reales. |

---

## 08. Fases detalladas (F1–F7)

Cada fase indica su objetivo, lo que hay que entregar y los criterios de aceptación (AC) que deben pasar en el entorno desplegado. Los códigos RF y AC coinciden con los de `docs/monorepo-plan.md`. Toda fase termina con `pnpm lint`, `tsc --noEmit`, `pnpm test` y `pnpm build` en verde.

---

### FASE 1 · RF-03, RF-04, RF-19 | Cimientos: base de datos, auth y policies
- **Duración:** 1 semana
- **Tamaño:** M · parte avanzada
- **Objetivo:** Que un usuario real inicie sesión y vea exactamente lo que su rol le permite, con la seguridad aplicada en el servidor.

#### Entregables
- Neon (pooler + direct), R2, Cloudflare y Vercel configurados; `.env.example` completo.
- Revisar y cerrar `schema.prisma`; migración inicial; seed con cursos demo, un instructor, un estudiante y certificados en cada estado.
- `server/db.ts`, `auth.ts` y `policies.ts` terminados, con tests.
- `/ingresar` conectado a Better Auth; `proxy.ts` protege `/campus/*`.
- Layout de `(campus)` con la sesión real; se elimina el rol mock.
- Regla de lint que impide importar `server/` desde el cliente.

#### Criterios de Aceptación
- **AC-01:** Con un clon limpio, `pnpm i → migrate deploy → db seed → build` termina sin errores y la app arranca con datos demo.
- **AC-03:** El bundle cliente no contiene `DATABASE_URL`, secretos ni código de `server/`.
- **AC-08:** Un email nuevo se registra como `STUDENT` y entra; con credenciales inválidas recibe un mensaje genérico.
- **AC-09:** Sin sesión, `/campus/*` redirige a `/ingresar`. Un estudiante recibe 403 en `/campus/estudiantes` y en las acciones de instructor.
- **AC-10:** Pedir por ID los datos de otro estudiante da 404/403 (test de policies).
- **AC-22:** Las migraciones usan `DIRECT_URL` y el runtime usa el pooler; 20 peticiones concurrentes no agotan conexiones.
- **AC-23:** El registro público no puede obtener `INSTRUCTOR`; `make-instructor` sí lo asigna.

---

### FASE 2 · RF-02, RF-23 | Verificación pública real
- **Duración:** 0,5 semanas
- **Tamaño:** S
- **Objetivo:** Que cualquiera pueda comprobar en segundos si un certificado es auténtico. Es la propuesta diferencial de Certifox.

#### Entregables
- `/verificar` y `/verificar/[codigo]` leen de Prisma.
- Estado `EXPIRED` calculado al leer, sin cron.
- 404 real para códigos inexistentes, sin revelar si existen.
- Documento de identidad enmascarado; cabecera `Cache-Control: no-store`.
- Rate limit de 30 consultas/min por IP.

#### Criterios de Aceptación
- **AC-04:** Con un código válido y sin sesión se ve el curso, el titular con documento enmascarado, las fechas, el SHA-256 y la etiqueta «Válido».
- **AC-05:** Revocado, vencido u observado se indica con texto; si está revocado, también la fecha y el motivo.
- **AC-06:** Un código inexistente muestra «no encontrado» con HTTP 404.

---

### FASE 3 · RF-01, RF-05, RF-06, RF-11, RF-20 | Catálogo y flujo de matrícula
- **Duración:** 1,5 semanas
- **Tamaño:** M
- **Objetivo:** Que un visitante encuentre un curso y solicite matrícula, y que el instructor confirme el pago y habilite el acceso.

#### Entregables
- `/`, `/cursos` (búsqueda y filtro por categoría y nivel en el query string) y `/cursos/[id]` leen de Prisma; metadata SEO.
- `EnrollmentModal` con instrucciones de Yape/Plin, transferencia BCP/Interbank y botón de WhatsApp con mensaje prellenado. Explica que la matrícula queda «Pendiente de activación».
- Server Action `requestEnrollment` que deja la matrícula en `PENDING` y es idempotente.
- `/campus/estudiantes`: matrículas filtrables por estado y acción «Confirmar pago» con modal (fecha y responsable) + `AuditLog`.

#### Criterios de Aceptación
- **AC-11:** Al solicitar matrícula se ven las instrucciones de pago, la matrícula queda `PENDING` y el aula no deja reproducir lecciones.
- **AC-12:** El instructor dueño confirma y el estudiante accede; otro instructor no puede confirmar.
- **AC-15:** No existe UI ni endpoint para subir comprobantes.

---

### FASE 4 · RF-07, RF-08, RF-09 | Aula, tareas y progreso del estudiante
- **Duración:** 2 semanas
- **Tamaño:** M
- **Objetivo:** Que un alumno con pago confirmado complete un curso de inicio a fin, también desde el móvil.

#### Entregables
- `/campus/cursos/[cursoSlug]`: reproductor con video embebido, lista de módulos (drawer o acordeón en móvil), «Marcar como completada» y «Siguiente lección».
- Lecciones completada, actual y bloqueada diferenciadas visualmente.
- Dashboard `/campus` y `/campus/cursos` del estudiante con datos reales (pendientes, activos, completados y progreso).
- `/campus/tareas`: entrega por texto o URL (estudiante) y bandeja de calificación con nota y feedback (instructor).
- Al completar las lecciones y tener la tarea aprobada, la matrícula pasa a `COMPLETED`.

#### Criterios de Aceptación
- **AC-13:** Al completar una lección y recargar, el progreso persiste y coincide con `/campus` y `/campus/cursos`.
- **AC-14:** Con la tarea entregada y aprobada y las lecciones completas, la matrícula queda `COMPLETED`.
- El aula es usable desde 360 px (RNF-08).

---

### FASE 5 · RF-10, RF-12, RF-13, RF-14 | Gestión de cursos y certificados (PDF + QR)
- **Duración:** 2 semanas
- **Tamaño:** M
- **Objetivo:** Que el instructor opere su curso sin ayuda de Foxcode y que el alumno reciba un certificado verificable.

#### Entregables
- CRUD de cursos, módulos y lecciones en `/campus/cursos`, con orden y publicar/despublicar.
- Emisión en `/campus/certificados`: código de alta entropía + SHA-256, idempotente y con `AuditLog`.
- Revocación con motivo obligatorio y confirmación reforzada + `AuditLog`.
- `/api/certificados/[codigo]/pdf` con `@react-pdf/renderer` y QR hacia `/verificar/[codigo]`.
- Colección del estudiante con descarga del PDF.

#### Criterios de Aceptación
- **AC-07:** El QR del PDF abre la verificación del mismo código.
- **AC-16:** Con la matrícula completada, el instructor emite el certificado y el estudiante lo ve y lo descarga.
- **AC-17:** Al revocarlo, `/verificar` muestra «Revocado» de inmediato, también a través de Cloudflare (`cf-cache-status BYPASS/DYNAMIC`), y queda registro en `AuditLog`.
- **AC-18:** El curso creado aparece en el catálogo; el instructor solo ve y edita los suyos.

---

### FASE 6 · RF-15, RF-16, RF-21, RF-22 | R2, vistas secundarias y cierre de producción
- **Duración:** 1 semana
- **Tamaño:** S
- **Objetivo:** Dejar la plataforma lista para usuarios reales: imágenes propias, páginas legales, caché correcta y un flujo de humo completo en producción.

#### Entregables
- Subida con URL prefirmada a R2 para portadas y avatares (`jpeg/png/webp`, máx. 2 MB, nombre generado por el servidor).
- Migrar a R2 las imágenes del seed (se eliminan los hotlinks a Google y Unsplash).
- `/campus/perfil` y `/campus/mesa-de-ayuda` con BD.
- `/privacidad` y `/terminos`.
- Reglas de caché de Cloudflare validadas; procedimiento para restaurar y re-seedear documentado en el `README`.

#### Criterios de Aceptación
- **AC-19:** Hay una URL desplegada con el flujo de humo funcionando y la restauración de la BD documentada.
- **AC-20:** La portada sube directo a R2; un archivo de más de 2 MB o de otro tipo se rechaza; la imagen se sirve desde el dominio de medios.
- **AC-21:** `/campus/*` devuelve `no-store` y nunca da `HIT`; los estáticos y R2 dan `HIT` en la segunda petición.
- **AC-24:** Ninguna imagen carga desde dominios de terceros.
- **AC-02:** Siguen funcionando todas las redirecciones.

---

### FASE 7 · VALIDACIÓN | Piloto con los dos prospectos
- **Duración:** 1 semana + soporte acordado
- **Objetivo:** Que los dos prospectos operen Certifox con cursos y alumnos reales, y corregir lo que aparezca.

#### Entregables
- Alta de los instructores (`make-instructor`) y carga de sus cursos reales.
- Pruebas end-to-end manuales con cada rol en producción.
- Acompañamiento del onboarding y corrección de los bugs que salgan.
- Lista priorizada de ajustes con el feedback semanal.

#### Definition of Done
- ✓ Dos prospectos usan Certifox con cursos y alumnos reales.
- ✓ El flujo matrícula → aula → tarea → certificado → verificación funciona completo.
- ✓ Ningún bug bloqueante abierto.

---

## 09. Requisitos no funcionales

### Innegociables: Seguridad y Privacidad
- **RNF-01:** Autorización por propiedad y rol en el servidor, en cada query y en cada acción.
- **RNF-02:** Contraseñas con hash (Better Auth); cookies `HttpOnly` y `Secure`; en el cliente solo variables `NEXT_PUBLIC_*`.
- **RNF-03:** Documento enmascarado en toda vista pública; sin PII en los logs.
- **RNF-04:** Códigos de ≥ 96 bits y rate limit de 30 req/min en la verificación.
- **RNF-05:** Toda mutación valida con Zod; los errores son legibles y sin trazas.
- **RNF-12:** Unicidad en BD; confirmación y emisión idempotentes.
- **RNF-13:** Subidas: solo imágenes, máx. 2 MB, nombre generado por el servidor.

### Calidad Mínima
- **RNF-06:** CI con lint, tsc, test y build en verde antes de cada deploy.
- **RNF-07:** Estados de carga, vacío y error en cada pantalla con datos.
- **RNF-08:** Usable desde 360 px en `/campus` y `/verificar`.
- **RNF-09:** LCP ≤ 3 s en móvil en las páginas públicas (Lighthouse manual).
- **RNF-10:** Metadata en el catálogo; `noindex` en `/verificar` y `/campus`.
- **RNF-11:** Arranque local en ≤ 5 comandos documentados.

### Caché: Cloudflare delante de Vercel

| Ruta | Regla |
| :--- | :--- |
| `/campus/*`, `/api/*` | `private, no-store`; bypass si hay cookie de sesión. Nunca se cachea HTML autenticado. |
| `/verificar/*` | `no-store` + rate limit. Una revocación tiene que verse al instante. |
| `/_next/static/*`, dominio R2 | Caché agresiva e inmutable. |
| `/cursos/*` (opcional) | `s-maxage` de 60–300 s. *Ojo: `revalidatePath` no purga Cloudflare.* |

### Deuda aceptada conscientemente
**No se pide en el MVP:** cobertura de tests amplia, e2e exhaustivo, APM u observabilidad, auditoría formal WCAG AA, i18n, caché avanzada ni tests de carga.  
**Sí se piden:** tests de policies y servicios críticos, y respetar la accesibilidad básica (foco visible, labels reales, contraste).

---

## 10. Forma de trabajo y Definition of Done

### Flujo de trabajo
- **Ramas:** una por fase o por funcionalidad (`feat/f3-matricula`). Nada se sube directo a `main`.
- **Pull requests:** pequeños y revisables, con descripción, capturas cuando haya UI y los AC que cubren. Foxcode revisa y aprueba.
- **Commits convencionales:** `feat:`, `fix:`, `chore:`, `docs:`.
- **Migraciones:** una por cambio de esquema, con nombre descriptivo. No se editan migraciones ya aplicadas.
- **Seguimiento:** un avance breve semanal (hecho, siguiente, bloqueos) y una demo al cerrar cada fase.
- **Dudas de alcance:** se preguntan; no se resuelven agregando funcionalidad.
- **Dependencias nuevas:** se justifican en el PR. Usar `pnpm`.

### Definition of Done de cada PR
- [ ] Lint, tsc, tests y build en verde en CI.
- [ ] Toda acción nueva valida con zod y pasa por una policy.
- [ ] Los cambios sensibles escriben en `AuditLog`.
- [ ] Hay estados de carga, vacío y error.
- [ ] Se ve bien a 360 px cuando aplica.
- [ ] Los estados se comunican con texto, no solo con color.
- [ ] No hay secretos, datos mock en producción ni `console.log` con PII.
- [ ] Si cambió el arranque o la infraestructura, el `README` está actualizado.
- [ ] Probado en el preview de Vercel.

### Definition of Done de cada fase
- [ ] Todos los AC de la fase pasan en el entorno desplegado.
- [ ] Demo hecha y fase aprobada por Foxcode.

---

## 11. Sistema de diseño: guía rápida

La referencia completa está en `docs/design.md`. La dirección es un **SaaS operacional moderno con acabado editorial**: confianza sobria de credencial académica y velocidad de herramienta operativa. Nunca debe parecer una carpeta de Drive ni un ERP pesado.  
*Los componentes consumen tokens semánticos de `app/globals.css`, nunca valores hex sueltos.*

### Paleta de colores
- `background`: `#F8F9FF` · canvas azulado
- `card`: `#FFFFFF` · se separa con borde, no con sombra
- `foreground`: `#0D1C2F`
- `primary`: `#151B2A` · navy, acciones definitivas
- `Fox Orange`: `#FD761A` · solo progreso, publicación y conversión
- `ring`: `#2563EB` · foco accesible

### Estados (siempre con texto)
- `Pago confirmado`
- `Pendiente`
- `En revisión`
- `Revocado`

### Reglas de interfaz
- **Tipografía:** Manrope.
- **Botones:** el primario es navy; la acción de negocio es naranja («Publicar», «Solicitar matrícula», «Continuar»); el secundario es blanco con borde; el destructivo es rojo y abre un modal con motivo y consecuencia.
- **Inputs:** de 40 px, radio de 6 px y un error textual debajo del campo.
- **Progreso:** con significado («6 de 8 lecciones»), nunca un anillo decorativo.
- **Tablas:** cabecera de 40 px, filas de 48 px y filtros visibles.
- **Aula:** el video y la lección actual son lo principal; en móvil, los módulos van en un drawer.
- **Instructor:** la siguiente acción pendiente (pagos, entregas) es evidente.
- **Copy:** español peruano neutro, con verbos de acción («Continuar», «Enviar tarea», «Emitir certificado»). Nunca «Completado» como etiqueta ambigua.
- **Verificación:** no promete validez oficial si la organización no está acreditada.

---

## 12. Riesgos, decisiones cerradas y backlog

### Riesgos técnicos y cómo evitarlos

| Riesgo | Mitigación |
| :--- | :--- |
| **Sin una capa API separada, los permisos se difuminan** | Todo acceso pasa por `server/services` + `policies.ts`; test obligatorio de AC-10. |
| **Server Actions con IDs manipulables** | Autorizar por propiedad (`assertOwnsEnrollment`, `assertCanManageCourse`) en cada acción. |
| **El selector de rol expone vistas de docente** | Rol tomado de `getSession()` + `requireRole("INSTRUCTOR")` en cada acción de docente. |
| **Next 16 cambia convenciones** | Leer `node_modules/next/dist/docs/` antes de cada pieza nueva. |
| **La doble caché sirve datos obsoletos** | Reglas `no-store`; verificar con `cf-cache-status` (AC-17, AC-21). |
| **Conexiones agotadas en Neon** | Pooler + adaptador de driver (AC-22). |
| **Migraciones en el build de Vercel** | Probar `migrate deploy` en un preview antes del deploy final. |
| **Fuga de datos en la verificación pública** | Mostrar el mínimo con el documento enmascarado (R7). |

### Decisiones cerradas (no se reabren sin hablarlo con Foxcode)
- **D1:** Neon Postgres con pooler + direct URL.
- **D2:** Video por URL embebida (YouTube no listado o Vimeo); sesiones en vivo por enlace externo.
- **D3:** PDF con `@react-pdf/renderer` en un Route Handler Node.
- **D4:** Entregas por texto o enlace, sin archivos.
- **D5:** Una sola app Next.js y un solo deploy, sin NestJS.
- **D6:** Rate limit de 30 consultas/min por IP en la verificación.
- **D7:** Imágenes directo desde R2 + Cloudflare (`unoptimized`).
- **D8:** Rutas autenticadas unificadas en `/campus`.
- **D9:** Pago manual: Yape/Plin, transferencia BCP/Interbank y WhatsApp.

### Backlog posterior al MVP (no construir ahora; sirve de contexto)

| Prioridad | Funcionalidad |
| :--- | :--- |
| **Alta** | Checkout con pasarela y conciliación de pagos · emails y recordatorios automáticos · recuperación de contraseña. |
| **Media** | Organizaciones multi-instructor · panel interno de Foxcode · quizzes y examen final con intentos · marca blanca y dominios propios · importación masiva · perfil profesional compartible. |
| **Baja** | Extraer la API a NestJS si la escala lo pide · marketplace · app móvil · comunidad y gamificación · renovación de certificados con vencimiento. |

> *Para que esta evolución no duela, mantén la lógica de negocio en `server/services`, separada de Next: así se puede mover a una API después sin reescribirla.*
