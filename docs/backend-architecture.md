# Certifox — Auditoría del backend y arquitectura objetivo

> Fecha: 2026-11-05 · Alcance: `server/`, `features/*/actions.ts`, `app/api/*`, `prisma/`, `lib/env.ts`, `proxy.ts`.
> Objetivo: preparar el monolito Next.js para recibir muchos clientes nuevos sin reescribirlo.

## 1. Resumen ejecutivo

La base es sana para un MVP: Server Components para leer, Server Actions para mutar, `server-only`, políticas de autorización centralizadas (`server/policies.ts`) y tests de las reglas críticas. **No hace falta salir del monolito**: un monolito modular en Next.js + Postgres (Neon) aguanta con holgura decenas de miles de usuarios si se corrigen los puntos de abajo.

Lo que hoy impide escalar o expone riesgo no es el "monolito", sino:

1. **Tres problemas de seguridad** que hay que cerrar antes de sumar clientes (código de certificado adivinable + PDF público con DNI completo, matrícula anónima que secuestra emails, secretos con valores por defecto en producción).
2. **Patrones de acceso a datos que no escalan**: sin índices en claves foráneas, sin paginación, sobre-lectura (se cargan currículos completos para contar lecciones) y sesión consultada varias veces por request.
3. **Estado en memoria en un entorno serverless** (rate limit) y **mutaciones no atómicas** (update + audit log sin transacción, carreras en emisión de certificados).
4. **Falta de capas transversales**: manejo de errores, logging/observabilidad, migraciones en el deploy, multi-tenancy.

## 2. Hallazgos

Severidad: 🔴 bloqueante antes de nuevos clientes · 🟠 alta (escala/correctitud) · 🟡 media.

### 2.1 Seguridad

| # | Sev. | Hallazgo | Dónde | Recomendación |
|---|---|---|---|---|
| S1 | 🔴 | El código de certificado tiene **24 bits** de entropía (`randomBytes(4).toString("hex").slice(0, 6)`), no los ≥ 96 que documenta el schema. Con el prefijo de año fijo hay ~16,7 M combinaciones: enumerable. | `server/services/certificate-management.service.ts` (`generateCertificateCode`) | Generar ≥ 16 caracteres Crockford base32 (≥ 80–96 bits). Los códigos antiguos siguen siendo válidos (solo cambia la generación). |
| S2 | 🔴 | `GET /api/certificados/[codigo]/pdf` es **público, sin rate limit** y el PDF incluye el **número de documento completo**. Combinado con S1 permite extraer DNIs de todos los titulares (Ley 29733). | `app/api/certificados/[codigo]/pdf/route.ts`, `server/pdf/certificate-pdf-document.tsx` | Enmascarar el documento en el PDF público (o exigir sesión del titular para el PDF completo) y aplicar rate limit. |
| S3 | 🔴 | `requestEnrollmentAction` acepta **usuarios anónimos** y crea un `User` sin `Account` con el email que se envíe. Cualquiera puede registrar emails ajenos y luego esa persona no puede crear cuenta (Better Auth ve el email como existente); además permite spam de matrículas. | `features/catalog/actions.ts`, `server/services/enrollment.service.ts` | Exigir sesión para matricular (el modal manda a `/ingresar?from=…`). Si se quiere "matrícula sin cuenta", usar invitación con verificación de email. |
| S4 | 🔴 | `lib/env.ts` tiene **defaults en producción**: `BETTER_AUTH_SECRET` cae a un secreto conocido y `DATABASE_URL` a localhost si faltan. Un deploy mal configurado firmaría sesiones con un secreto público. | `lib/env.ts` | Sin defaults cuando `NODE_ENV === "production"`; fallar al arrancar. |
| S5 | 🟠 | Rate limit en memoria (`Map`): en Vercel cada instancia tiene su propio mapa y se reinicia en cada cold start, por lo que el límite real es N×30/min. | `server/rate-limit.ts` | Rate limit distribuido (Upstash Redis / Vercel KV) + regla de rate limiting en Cloudflare WAF para `/verificar/*` y `/api/*`. |
| S6 | 🟠 | Las Server Actions devuelven `err.message` crudo al cliente: los errores de Prisma (nombres de tablas, constraints) llegan al navegador. | todos los `features/*/actions.ts` | Errores de dominio tipados; todo lo demás → mensaje genérico + log con id de correlación. |
| S7 | 🟡 | `PUT /api/upload/local` responde 200 siempre y está activo también en producción. Better Auth sin `trustedOrigins` explícitos y con su rate limit en memoria (mismo problema que S5). | `app/api/upload/local/route.ts`, `server/auth.ts` | Desactivar la ruta local cuando `NODE_ENV === "production"`; configurar `trustedOrigins` y mover el `rateLimit` de Better Auth a almacenamiento secundario (Redis). |

### 2.2 Datos y rendimiento

| # | Sev. | Hallazgo | Recomendación |
|---|---|---|---|
| D1 | 🔴 | **Ninguna clave foránea tiene índice** (Postgres no los crea solo). Toda consulta por `courseId`, `instructorId`, `moduleId`, `enrollmentId`, `userId` (sessions/accounts/tickets) hace *seq scan*. Con pocos datos no se nota; con miles de matrículas el campus del instructor y el login se degradan linealmente. | Añadir `@@index` en: `sessions(userId)`, `accounts(userId)`, `courses(instructorId)`, `courses(published, createdAt)`, `modules(courseId, order)`, `lessons(moduleId, order)`, `enrollments(courseId, status)`, `lesson_progress(lessonId)`, `assessments(courseId)`, `submissions(enrollmentId)`, `submissions(assessmentId, status)`, `tickets(userId, createdAt)`, `audit_logs(targetType, targetId)`, `audit_logs(actorId, createdAt)`. |
| D2 | 🟠 | **Sin paginación** en ningún listado: catálogo, matrículas del instructor, entregas, certificados, tickets. | Paginación por cursor (`take` + `cursor`) en todos los listados; límite máximo por página en el servidor. |
| D3 | 🟠 | **Sobre-lectura**: el catálogo carga todos los cursos con todos sus módulos y lecciones para mostrar un contador; `getInstructorEnrollments` trae todo `progress` de cada matrícula; varias consultas hacen `include: { user: true }` (incluye todo el usuario). | `select` explícito con solo los campos del DTO; contadores con `_count`; columnas desnormalizadas (`Course.lessonsCount`) actualizadas en la misma transacción que crea/borra lecciones. |
| D4 | 🟠 | `getSession()` no está memoizado: layout + página + acción consultan la sesión 2–3 veces por request, y Better Auth no tiene `cookieCache`, así que **cada request toca la tabla `sessions`**. | Envolver `getSession` en `cache()` de React y activar `session.cookieCache` (p. ej. 5 min) en Better Auth. |
| D5 | 🟠 | Mutaciones **no atómicas**: `update` + `auditLog.create` van por separado (si falla el segundo, se pierde la auditoría). `issueCertificate` tiene carrera: dos clics simultáneos → el segundo choca con el `@unique(enrollmentId)` y devuelve error en vez de ser idempotente. Igual en `checkAndCompleteCourse`. | `db.$transaction` para cada caso de uso que escribe más de una fila; idempotencia vía `upsert`/captura de `P2002`; `updateMany where status != COMPLETED` para transiciones de estado. |
| D6 | 🟡 | `toggleLessonProgress` hace ~7 queries secuenciales por clic (curso, matrícula, lección, upsert, check de completitud con currículo entero, 2 counts, re-lectura). | Una transacción con las lecturas mínimas; reutilizar el conteo ya calculado. |
| D7 | 🟡 | El PDF se renderiza con `@react-pdf` **en cada request** (CPU-bound, ~cientos de ms). | Generarlo una vez al emitir, guardarlo en R2 (clave inmutable) y servir por redirect/URL firmada; la verdad del estado vive en `/verificar`. |
| D8 | 🟡 | Valores de negocio hardcodeados en servicios: precio (180 USD / 680 PEN), cuentas Yape/BCP, rating 4.9, nº de alumnos 850, competencias, nota por defecto 18.5 en la verificación pública. | Precio y datos de pago al modelo (`Course.pricePen`, `PaymentMethod` por organización). Quitar datos ficticios de los DTOs — **sobre todo de la verificación pública de certificados**, que debe mostrar solo datos reales. |

### 2.3 Operación

| # | Sev. | Hallazgo | Recomendación |
|---|---|---|---|
| O1 | 🟠 | Las migraciones no se aplican en el deploy y el README usaba `db push` (que no deja historial). | `pnpm db:deploy` en el pipeline (step previo al build en CI o `vercel-build`), nunca `db push` contra producción. Neon branches para previews. |
| O2 | 🟠 | Sin observabilidad: solo `console.error` puntuales. Sin trazas, sin métricas de latencia, sin alertas. | `instrumentation.ts` con OpenTelemetry/Sentry, logger estructurado (pino) con `requestId`, dashboards de p95 por ruta y de conexiones en Neon. |
| O3 | 🟡 | Tests solo unitarios con Prisma mockeado. | Tests de integración contra Postgres real (contenedor en CI o branch de Neon) para servicios críticos, y prueba de carga (k6) sobre `/verificar/[codigo]`, login y aula antes de cada salto de clientes. |

### 2.4 Modelo de dominio

| # | Sev. | Hallazgo | Recomendación |
|---|---|---|---|
| M1 | 🟠 | **No hay concepto de cliente/organización.** Si "clientes" son instituciones o empresas (B2B), hoy todos los cursos, instructores y certificados viven en un único espacio global; `institution` es un string libre en `User`. Añadir tenancy después, con datos, es mucho más caro que ahora. | Ver §3.4. |
| M2 | 🟡 | Roles solo `STUDENT`/`INSTRUCTOR`, sin administrador; alta de instructores por script CLI. | Roles por membresía de organización (`OWNER`, `ADMIN`, `INSTRUCTOR`, `STUDENT`) y rol de plataforma (`SUPERADMIN`). |
| M3 | 🟡 | `AuditLog.targetId` mezcla ids y códigos de certificado; `metadata` sin esquema. | Siempre id interno en `targetId`; esquema zod por `action`. |

## 3. Arquitectura objetivo: monolito modular

Un solo deploy de Next.js, pero con fronteras internas explícitas para que cada dominio pueda crecer (o extraerse algún día) sin tocar los demás.

```text
app/                         # TRANSPORTE: páginas, layouts, route handlers. Sin lógica de negocio.
features/<feature>/          # UI por feature + actions.ts finas (parse → llamar caso de uso → revalidar)
server/
├── core/                    # Infraestructura transversal (sin dominio)
│   ├── db.ts                # PrismaClient + helper de transacción
│   ├── env.ts               # validación estricta (fail-fast en prod)
│   ├── auth.ts              # Better Auth + getSession() memoizado con cache()
│   ├── context.ts           # RequestContext { user, organizationId, requestId, ip }
│   ├── errors.ts            # DomainError, NotFound, Forbidden, Conflict, RateLimited
│   ├── action.ts            # createAction(): zod + sesión + rate limit + errores + logging
│   ├── rate-limit.ts        # Redis/Upstash (distribuido)
│   ├── logger.ts            # pino con requestId
│   ├── jobs.ts              # cola (Inngest / QStash / Vercel Queues) + outbox
│   └── storage.ts           # R2
└── modules/
    ├── catalog/             # cursos públicos, búsqueda
    ├── enrollment/          # matrícula, pagos manuales
    ├── learning/            # aula, progreso, completitud
    ├── assessment/          # tareas y calificación
    ├── certification/       # emisión, revocación, verificación, PDF
    ├── organization/        # tenants, membresías, roles
    ├── support/             # tickets
    └── audit/
        # cada módulo:
        ├── <x>.service.ts   # casos de uso (orquestan, abren transacciones, emiten eventos)
        ├── <x>.repository.ts# acceso a datos con select explícito + scoping por tenant
        ├── <x>.policies.ts  # autorización del módulo (sobre el contexto)
        ├── <x>.schemas.ts   # zod de entrada/salida (compartidos con el formulario)
        └── <x>.dto.ts       # tipos de salida para la UI
```

### 3.1 Reglas de dependencia

1. `app/` y `features/` solo importan **servicios** de `server/modules/*` (nunca `db` ni repositorios).
2. Un módulo no importa el repositorio de otro; si necesita algo, llama a su servicio o reacciona a un evento.
3. Solo los repositorios importan `server/core/db`.
4. Se hace cumplir con `eslint-plugin-boundaries` (o `no-restricted-imports`) en CI.

### 3.2 Flujo de una mutación

```text
Client form ──► features/x/actions.ts
                 createAction({ schema, auth: "INSTRUCTOR", rateLimit, handler })
                   1. zod.parse(input)
                   2. ctx = await getRequestContext()      // sesión memoizada + tenant + requestId
                   3. rateLimit(ctx)
                   4. handler(ctx, input) ─► modules/x/service
                                               policies.assertX(ctx, …)
                                               db.$transaction(tx => repo.update(tx) + audit.record(tx) + outbox.add(tx))
                   5. revalidateTag(...)
                   6. DomainError → { ok:false, code, message } ; otro error → log + mensaje genérico
```

Resultado uniforme `{ ok: true, data } | { ok: false, code, message }` en todas las acciones.

### 3.3 Lecturas y caché

- **Públicas** (landing, catálogo, detalle de curso): caché de datos de Next con tags (`course:<id>`, `catalog`) invalidados con `revalidateTag` desde los casos de uso de gestión de cursos; `s-maxage` corto en Cloudflare. Revisar la guía de caché de Next 16 en `node_modules/next/dist/docs/` antes de implementarlo.
- **Verificación de certificados**: siempre dinámica (`no-store`), pero es una sola consulta indexada por `code` con `select` mínimo; protegida con rate limit distribuido + WAF.
- **Campus**: dinámico por usuario; consultas paginadas y con `select`. Nada de caché compartida.

### 3.4 Multi-tenancy (si "clientes" = instituciones)

Recomendación: **base de datos compartida con `organizationId` en cada tabla de dominio** (el modelo más simple que escala a miles de tenants).

```prisma
model Organization {
  id        String   @id @default(cuid())
  slug      String   @unique   // subdominio o ruta: acme.certifox.pe
  name      String
  plan      String   @default("standard")
  createdAt DateTime @default(now())
}

model Membership {
  id             String       @id @default(cuid())
  organizationId String
  userId         String
  role           OrgRole      // OWNER | ADMIN | INSTRUCTOR | STUDENT
  @@unique([organizationId, userId])
  @@index([userId])
}

// Course, Enrollment, Certificate, Ticket, AuditLog… ganan:
//   organizationId String  + @@index([organizationId, ...])
```

- El tenant se resuelve **una vez** en `RequestContext` (subdominio/ruta + membresía del usuario) y los repositorios lo aplican siempre (`where: { organizationId: ctx.organizationId, … }`) mediante un helper/extensión de Prisma, de forma que olvidarlo sea imposible.
- Defensa en profundidad opcional más adelante: Row-Level Security de Postgres con `SET app.organization_id` por transacción.
- Los usuarios son globales (un alumno puede estar en varias organizaciones); los roles viven en `Membership`.
- Si "clientes" significa solo más alumnos (B2C), esta sección se omite y basta con §3.1–3.3.

### 3.5 Trabajo asíncrono

Nada pesado ni externo dentro del request: generación de PDF, emails (confirmación de pago, certificado emitido), webhooks futuros de pasarela de pago, exportaciones. Patrón **outbox**: el caso de uso escribe el evento en la misma transacción y un worker (Inngest / QStash / Vercel Queues) lo procesa con reintentos e idempotencia.

### 3.6 Base de datos y conexiones

- Una sola `DATABASE_URL` (pooler de Neon) para runtime; `pnpm db:*` deriva la conexión directa para migraciones (ya implementado).
- Región de Neon = región de las funciones de Vercel.
- Vigilar conexiones: con PgBouncer de Neon el límite de clientes es alto, pero conviene fijar `connection_limit` bajo (p. ej. 5) en la URL de runtime para que cada instancia serverless no abra demasiadas.
- Escalado de lectura cuando haga falta: réplica de lectura de Neon para listados pesados/reportes (Prisma `readReplicas`).

### 3.7 Señales para extraer un servicio (no antes)

Extraer solo si se cumple alguna: un dominio necesita escalar o desplegarse con un ritmo muy distinto (p. ej. verificación pública con picos de tráfico masivos), requiere otro runtime (procesamiento de video), o un equipo separado lo posee. Con las fronteras de §3.1, extraer un módulo es mover una carpeta detrás de una API.

## 4. Plan por fases

**Fase 0 — Bloqueantes (antes de sumar clientes, ~1 semana)**
- S1 código de certificado ≥ 80 bits · S2 PDF sin DNI completo + rate limit · S3 matrícula solo con sesión · S4 env estricto en producción.
- D1 índices en todas las FKs (una migración).
- D5 transacciones en confirmar pago, calificar, completar curso, emitir y revocar certificado.
- S5 rate limit distribuido + regla en Cloudflare.

**Fase 1 — Cimientos (2–3 semanas)**
- `server/core` (errors, action wrapper, context, logger) y migrar las acciones existentes.
- D4 sesión memoizada + `cookieCache`.
- D2/D3 paginación y `select` explícitos; quitar datos ficticios de los DTOs (D8).
- O1 migraciones en el pipeline; O2 Sentry + logs estructurados.
- Reglas de dependencia en ESLint.

**Fase 2 — Escala (según tipo de cliente)**
- M1/M2 organizaciones y membresías (si es B2B).
- Caché con tags en lecturas públicas.
- D7 PDF pre-generado en R2; outbox + cola para emails.
- O3 tests de integración y prueba de carga como gate de release.

**Fase 3 — Continuo**
- Réplicas de lectura, RLS, extracción de servicios solo si aparecen las señales de §3.7.
