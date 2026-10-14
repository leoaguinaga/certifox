# Certifox — Plan MVP: un solo proyecto Next.js, un solo deploy

> Estado: borrador · 2026-10-14
> Enfoque: **"monorepo" = una única app Next.js** que contiene sitio público, aula del estudiante, panel del instructor **y** su propio backend (Server Actions + Route Handlers + Prisma). Sin NestJS, sin Turborepo, sin `packages/`. MVP **desechable pero funcional**: se prioriza que los flujos críticos funcionen de punta a punta sobre la perfección arquitectónica.
> Los umbrales numéricos son propuestas a validar.

---

## 1. Punto de partida (verificado en el repo)

- Next 16.3.4 + React 19 + Tailwind 4 + shadcn/base-ui. Rutas ya maquetadas con datos mock (`data/*.ts`): `/`, `/cursos`, `/cursos/[id]`, `/verificar[/codigo|/no-encontrado]`, `/ingresar`, `/mi-aprendizaje`, `/mis-certificados`, `/perfil`, `/mesa-de-ayuda`.
- Faltan: aula (`aula/[cursoSlug]`), panel `/gestion`, recuperar contraseña, y **todo el backend** (no hay `fetch`, env, auth ni BD; el login hace `console.log`).
- Ninguna dependencia de `architecture.md` está instalada.
- `architecture.md` está desalineado (habla de `src/`, `/iniciar-sesion`, NestJS y repos hermanos). Se actualizará en la Fase 0.

### Cambios respecto a `architecture.md` (este plan los sustituye)
| `architecture.md` | Este plan |
| --- | --- |
| Backend NestJS aparte; "no crear APIs de negocio en Next" | Backend **dentro** de Next: Server Actions para mutaciones, Server Components para lecturas |
| Front no importa Prisma | Prisma solo en `server/`, protegido con `import "server-only"` y regla de lint |
| TanStack Query para estado remoto | No por defecto: RSC + `revalidatePath`. Se añade solo si una pantalla lo necesita |
| Back-office separado | Fuera del MVP (seed + Prisma Studio) |
| Pago: sin comprobante | Se mantiene: confirmación manual por el instructor |

---

## 2. Arquitectura objetivo

```txt
app/
├── (public)/        # landing, cursos, verificar, ingresar   (ya existe)
├── (student)/       # mi-aprendizaje, aula/[cursoSlug], mis-certificados, perfil, mesa-de-ayuda
├── (instructor)/gestion/   # cursos, matriculas, evaluaciones, certificados
├── api/
│   ├── auth/[...all]/route.ts           # Better Auth
│   └── certificados/[codigo]/pdf/route.ts
└── layout.tsx, error.tsx, not-found.tsx
features/<dominio>/   # components/, actions.ts ("use server"), queries.ts, schemas.ts (zod)
server/               # solo servidor ("server-only")
├── db.ts             # cliente Prisma
├── auth.ts           # Better Auth + getSession()
├── policies.ts       # requireRole(), canManageCourse(), ownsEnrollment()…
└── services/         # reglas: confirmarPago, emitirCertificado, revocar…
prisma/               # schema.prisma, migrations, seed.ts (reutiliza data/*.ts)
lib/env.ts            # variables validadas con zod
```

**Reglas**
1. **La autorización vive en `server/policies.ts` y se invoca en cada query/acción.** Layouts y `proxy`/middleware solo redirigen por UX (en Next 16 el middleware se llama `proxy`: verificar contra `node_modules/next/dist/docs/` antes de implementarlo, como exige `AGENTS.md`).
2. Componentes cliente (`"use client"`) nunca importan de `server/`.
3. Toda entrada de usuario se valida con zod en la Server Action; los DTO devueltos a la UI no incluyen campos internos.
4. Texto de estado (`statusLabel`, etc.) se deriva en la UI desde enums; el modelo guarda solo el enum.

**Stack mínimo a instalar:** `prisma` + `@prisma/client` + adaptador de driver para Neon (`@prisma/adapter-neon` o `adapter-pg`, según la versión de Prisma; verificar docs), `better-auth`, `zod`, `react-hook-form` + `@hookform/resolvers`, `sonner`, `date-fns`, `server-only`, `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` (R2 habla API S3), `vitest` (tests de `policies`). PDF: `@react-pdf/renderer` (o página imprimible, ver D3). Diferido: `nuqs`, TanStack Table/Query, `react-dropzone`.

**Modelo de datos mínimo:** `User(role: STUDENT|INSTRUCTOR)`, `Course`, `Module`, `Lesson`, `Enrollment(status: PENDING|ACTIVE|COMPLETED)`, `LessonProgress`, `Assessment`, `Submission`, `Certificate(code, sha256, status: VALID|EXPIRED|REVOKED|OBSERVED, issuedAt, expiresAt, revokedAt, revocationReason)`, `Ticket`, `AuditLog`.

## 2.1 Infraestructura (decidida)

| Pieza | Decisión | Puntos a cubrir |
| --- | --- | --- |
| ORM | Prisma | `prisma.config.ts`; migraciones con `prisma migrate deploy` en el build |
| BD | Neon (Postgres) | **Dos URLs**: `DATABASE_URL` (pooler, `-pooler`, para runtime serverless) y `DIRECT_URL` (sin pooler, para migraciones). Región de Neon = región de las funciones de Vercel. Rama de Neon por preview (opcional) |
| Imágenes | Cloudflare R2 | Bucket con dominio propio (p. ej. `media.certifox.…`); **subida con URL prefirmada** desde el navegador (Vercel limita el body de funciones a ~4,5 MB); validar tipo y tamaño en la acción que firma; CORS del bucket; añadir el dominio a `images.remotePatterns` |
| Caché | Cloudflare delante de Vercel (DNS con proxy) | Ver reglas abajo |
| Deploy | Vercel | Env vars por entorno (Production/Preview); mantener `next build --webpack`; PDF en runtime Node |

**Reglas de caché en Cloudflare (críticas)**
1. **No cachear HTML autenticado**: bypass si hay cookie de sesión; `/mi-aprendizaje`, `/aula`, `/gestion`, `/perfil`, `/api/*` → `no-store`.
2. **La verificación de certificados no puede quedar obsoleta** (AC-17): `Cache-Control: no-store`/TTL ≤ 60 s en `/verificar/*`, **o** purga por API de Cloudflare al revocar. Se recomienda `no-store` + rate limit de Cloudflare.
3. Cachear agresivamente: `/_next/static/*` (inmutable) y el dominio de R2 (imágenes).
4. Opcional: catálogo con `s-maxage` corto (60–300 s). `revalidatePath` **no** purga Cloudflare.
5. SSL en modo *Full (strict)*; leer IP real desde `CF-Connecting-IP` para el rate limit; Better Auth con `trustedOrigins` para dominio de producción y previews.
6. Cloudflare aporta además WAF/rate limiting para `/verificar/*` y login (cubre RNF-04) y Turnstile (anti-bots) si hace falta en registro.

**Variables de entorno** (`lib/env.ts` las valida con zod): `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `NEXT_PUBLIC_MEDIA_URL`, y (si se purga) `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN`.

---

## 3. Requisitos funcionales

Prioridad: **M**ust / **S**hould / **C**ould / **W**on't (MVP). "UI" = ya maquetada con mock.

| ID | Requisito | P | UI |
| --- | --- | --- | --- |
| RF-01 | Catálogo y detalle de curso leídos de BD (búsqueda y filtro categoría/nivel por query string) | M | ✅ |
| RF-02 | **Verificación pública** `/verificar/[codigo]` sin sesión; estados válido/vencido/revocado/observado con etiqueta textual; "no encontrado" sin revelar existencia | M | ✅ |
| RF-03 | Registro, login y logout con email + contraseña (Better Auth) | M | ⚠️ sin lógica |
| RF-04 | Rutas protegidas por rol: estudiante → `/mi-aprendizaje`, instructor → `/gestion`; resto a `/ingresar` | M | ❌ |
| RF-05 | Solicitar matrícula → queda **PENDIENTE**; sin acceso al aula | M | ❌ |
| RF-06 | Instructor del curso **confirma pago** → matrícula ACTIVA (sin comprobante) | M | ❌ |
| RF-07 | Aula: ver lecciones (video por URL/embed), marcar completada, progreso persistente | M | ❌ |
| RF-08 | Evaluación simple (quiz o entrega de texto/enlace) y calificación por el instructor | M | ❌ |
| RF-09 | "Mi aprendizaje" con cursos pendientes/activos/completados y progreso reales | M | ✅ |
| RF-10 | Instructor: crear/editar sus cursos (módulos y lecciones) | M | ❌ |
| RF-11 | Instructor: lista de matrículas con filtro por estado y acción de confirmar | M | ❌ |
| RF-12 | Emisión de certificado al completar: código aleatorio, SHA-256, PDF con QR a `/verificar/[codigo]` | M | ⚠️ sin PDF |
| RF-13 | Revocación con motivo + registro en `AuditLog`; reflejada en la verificación | M | ✅ vista |
| RF-14 | "Mis certificados": listar, ver, descargar PDF | M | ✅ |
| RF-15 | Perfil (editar datos; documento enmascarado) | S | ✅ |
| RF-16 | Mesa de ayuda: crear y listar tickets propios | S | ✅ |
| RF-17 | Recuperar contraseña / Login con Google / emails transaccionales | C | ❌ |
| RF-18 | Subida de archivos adjuntos en tareas, ledger/blockchain, back-office, pasarela de pago | W | — |
| RF-19 | **Alta de instructores sin back-office**: rol INSTRUCTOR asignado por seed/script (`pnpm make-instructor email`); el registro público siempre crea ESTUDIANTE | M | ❌ |
| RF-20 | **Instrucciones de pago** visibles al matricularse (transferencia/WhatsApp fuera de la plataforma) y estado "pendiente" explicado | M | ⚠️ modal |
| RF-21 | Subida de imágenes a R2 (portada de curso, avatar) con URL prefirmada; las imágenes del seed se migran a R2 (hoy hay hotlinks a `lh3.googleusercontent.com`) | M | ❌ |
| RF-22 | Páginas legales: política de privacidad y términos (datos personales y documento de identidad) | S | ❌ |
| RF-23 | Vencimiento de certificados calculado **al leer** (`expiresAt < now` ⇒ EXPIRED), sin cron | M | ❌ |

---

## 4. Requisitos no funcionales (nivel "desechable pero funcional")

**Innegociables** (aunque sea desechable): seguridad y privacidad de datos reales.

| ID | Requisito |
| --- | --- |
| RNF-01 | **Autorización por propiedad y rol en servidor** (policies). Un estudiante no puede leer/modificar datos ajenos aunque manipule IDs. |
| RNF-02 | Contraseñas gestionadas por Better Auth (hash); cookies `HttpOnly` + `Secure`; sin secretos en el bundle cliente (solo `NEXT_PUBLIC_*`). |
| RNF-03 | Documento de identidad enmascarado en toda vista pública; sin PII en logs. Validar con asesoría legal la normativa de datos personales aplicable. |
| RNF-04 | Códigos de certificado no secuenciales y de alta entropía (≥ 96 bits). Límite de consultas simple en verificación (**S**). |
| RNF-12 | Unicidad en BD: una matrícula por (usuario, curso) y un certificado por matrícula; emisión y confirmación idempotentes. |
| RNF-13 | Subidas a R2: solo `image/jpeg|png|webp`, tamaño máx. 2 MB, nombre de objeto generado por el servidor. |
| RNF-05 | Toda mutación valida entrada con zod y devuelve errores de UI legibles (sin trazas). |

**Calidad mínima**

| ID | Requisito |
| --- | --- |
| RNF-06 | `pnpm lint`, `tsc --noEmit` y `pnpm build` en verde antes de cada deploy (GitHub Action simple). |
| RNF-07 | Estados de carga/vacío/error en pantallas con datos; el estado de un certificado nunca solo por color. |
| RNF-08 | Usable desde 360 px en pantallas de estudiante y verificación. |
| RNF-09 | Páginas públicas rápidas: LCP ≤ 3 s en móvil (medición manual con Lighthouse; sin gate en CI). |
| RNF-10 | Catálogo y detalle con `metadata`; verificación con `noindex`. |
| RNF-11 | Arranque local en ≤ 5 comandos documentados (`pnpm i`, `.env`, `prisma migrate dev`, `prisma db seed`, `pnpm dev`). |

**Deuda aceptada conscientemente (no se hará):** cobertura de tests amplia, e2e exhaustivo, observabilidad/APM, accesibilidad AA formal, i18n, caché avanzada, CI por afectados, tests de carga.

---

## 5. Criterios de aceptación del MVP

El MVP se acepta cuando **todos** pasan en el entorno desplegado (Dado / Cuando / Entonces).

**Plataforma**
- **AC-01** Con un clon limpio, `pnpm i && prisma migrate deploy && prisma db seed && pnpm build` termina sin errores y la app arranca con datos de demostración (cursos, un instructor, un estudiante, certificados en cada estado).
- **AC-02** Las rutas y redirecciones existentes (`/verificar-certificado` → `/verificar`, etc.) siguen funcionando.
- **AC-03** El bundle cliente no contiene `DATABASE_URL`, secretos de auth ni código de `server/` (revisión de `.next/static` y regla de lint).

**Verificación pública (RF-02, RF-13)**
- **AC-04** Dado un código válido, cuando un visitante sin sesión abre `/verificar/{codigo}`, entonces ve curso, titular con documento enmascarado, fechas, huella SHA-256 y la etiqueta **"Válido"**.
- **AC-05** Dado un certificado revocado/vencido/observado, entonces la etiqueta textual lo indica (y para revocado: fecha y motivo).
- **AC-06** Dado un código inexistente, entonces se muestra "no encontrado" con HTTP 404.
- **AC-07** El QR del PDF abre la verificación del mismo código.

**Auth y permisos (RF-03, RF-04)**
- **AC-08** Un email nuevo puede registrarse e iniciar sesión; credenciales inválidas muestran un mensaje genérico.
- **AC-09** Sin sesión, `/mi-aprendizaje` y `/gestion/*` redirigen a `/ingresar`; un estudiante en `/gestion/*` es rechazado.
- **AC-10** Un estudiante que consulta por ID cursos, entregas o certificados de otro estudiante recibe 404/403 (verificado con un test de la capa `policies`).

**Matrícula y aprendizaje (RF-05 – RF-09)**
- **AC-11** Al solicitar matrícula, el estado es PENDIENTE y `/aula/{curso}` no es accesible.
- **AC-12** El instructor **dueño del curso** confirma el pago y el estudiante accede al aula; otro instructor no puede confirmarlo.
- **AC-13** Al completar una lección y recargar, el progreso persiste y coincide con "Mi aprendizaje".
- **AC-14** Aprobada la evaluación y completadas las lecciones, la matrícula pasa a COMPLETADA.
- **AC-15** No existe UI ni endpoint para subir comprobante de pago.

**Certificación (RF-12 – RF-14)**
- **AC-16** Con la matrícula completada, el instructor emite el certificado: se crea código único + SHA-256 y el estudiante lo ve y descarga en PDF.
- **AC-17** Al revocarlo con motivo, `/verificar/{codigo}` muestra "Revocado" de inmediato **también a través de Cloudflare** (comprobado con la respuesta real del dominio, cabecera `cf-cache-status` = `BYPASS`/`DYNAMIC`) y queda un `AuditLog`.

**Instructor (RF-10, RF-11)**
- **AC-18** El instructor crea un curso con módulos y lecciones y aparece en el catálogo; solo ve/edita sus propios cursos.

**Infraestructura (R2, Cloudflare, Neon)**
- **AC-20** Un instructor sube la portada de un curso: el navegador sube directo a R2 con URL prefirmada, un archivo > 2 MB o de otro tipo es rechazado, y la imagen se sirve desde el dominio de medios.
- **AC-21** Rutas autenticadas devuelven `no-store` y nunca `cf-cache-status: HIT`; `/_next/static/*` e imágenes de R2 sí salen `HIT` en la segunda petición.
- **AC-22** El build en Vercel ejecuta migraciones con `DIRECT_URL` y la app corre con el pooler; una segunda petición concurrente de 20 usuarios no agota conexiones.
- **AC-23** Un registro público no puede obtener rol INSTRUCTOR; `make-instructor` sí lo asigna.
- **AC-24** Ninguna imagen del catálogo carga desde dominios de terceros (Google/Unsplash).

**Flujo de humo (manual o un único test Playwright)**
Registro → solicitar matrícula → (instructor) confirmar pago → completar lecciones y evaluación → emitir certificado → verificar públicamente → revocar → verificar de nuevo.

**Deploy**
- **AC-19** Existe una URL desplegada con el flujo de humo funcionando y el procedimiento para restaurar/reseedear la BD documentado en el README.

---

## 6. Plan de ejecución

Estimación relativa; cada fase termina con la app desplegable.

| Fase | Contenido | Cubre |
| --- | --- | --- |
| **0 · Preparación** (S) | Actualizar `architecture.md` y README a este plan; decidir D1–D4; crear `.env.example`; eliminar `mockups/` del flujo de build si molesta | — |
| **1 · Cimientos** (M) | Crear proyecto Neon, bucket R2, zona Cloudflare y proyecto Vercel; instalar stack mínimo; `lib/env.ts`; Prisma schema + migración inicial; `prisma/seed.ts` a partir de `data/*.ts`; Better Auth + `server/auth.ts`; `server/policies.ts`; `proxy` de redirección; lint `server-only`; CI (lint+tsc+build) | AC-01, 02, 03, 08, 09, 22 |
| **2 · Verificación pública real** (S) | `/verificar/[codigo]` desde BD; 404 real; enmascarado de documento | AC-04, 05, 06 |
| **3 · Catálogo y matrícula** (M) | Catálogo/detalle desde BD; acción de matrícula pendiente; vista de matrículas del instructor + "Confirmar pago" | AC-11, 12, 15 |
| **4 · Aula y evaluación** (M) | `aula/[cursoSlug]`, progreso, evaluación simple, "Mi aprendizaje" real | AC-10, 13, 14 |
| **5 · Instructor y certificados** (M) | CRUD de cursos; emisión (hash + código + PDF/QR); revocación + auditoría; "Mis certificados" | AC-07, 16, 17, 18 |
| **6 · Cierre** (S) | Reglas de caché de Cloudflare, subida a R2 (RF-21), páginas legales, perfil, tickets (S), pulido móvil, deploy, flujo de humo, README de operación | AC-19, 20, 21, 23, 24 |

**Orden de recorte si falta tiempo:** primero RF-16 y RF-15, luego la evaluación pasa a "auto-aprobada al completar lecciones", luego el CRUD de cursos se sustituye por seed. **No recortar:** RF-02, RF-05/06, RF-12/13 ni las policies (RNF-01).

---

## 7. Decisiones abiertas

| # | Pregunta | Recomendación |
| --- | --- | --- |
| D1 | ~~Base de datos~~ | **Resuelta:** Neon |
| D7 | ¿Las imágenes se sirven con la optimización de Next (`next/image` en Vercel) o directo desde R2 con `unoptimized`? | Directo desde R2 + Cloudflare (evita cuota de optimización de Vercel); generar tamaños al subir si hace falta |
| D8 | ¿Dominio ya adquirido y gestionado en Cloudflare? Necesario para proxy y dominio de medios | Confirmar antes de la Fase 1 |
| D9 | ¿Cómo se cobra hoy (cuenta bancaria, Yape/WhatsApp)? Define el texto de RF-20 | Definir con negocio |
| D2 | ¿Dónde se aloja el video de las lecciones? | URL embebida (YouTube no listado o similar); sin infraestructura propia |
| D3 | ¿PDF del certificado con `@react-pdf/renderer` o página imprimible? | `@react-pdf/renderer` (descarga real); imprimible si se quiere cero dependencias |
| D4 | ¿Entregas de tareas con archivos? | No en MVP: texto o enlace |
| D5 | ¿Qué hacer con el repo `leoaguinaga/certifox` (producto B2B de vencimientos)? | Tratarlo como proyecto aparte; puede servir de referencia de Better Auth + Prisma, no se mezcla aquí |
| D6 | ¿Umbrales de §4 y límite de consultas de verificación (propuesta 30/min)? | Aceptar propuestas |

## 8. Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Falta de capa API separada difumina permisos | Todo acceso a datos pasa por `server/services` + `policies`; test de AC-10 |
| Server Actions con IDs manipulables | Autorizar por propiedad en cada acción, nunca confiar en el ID del cliente |
| Next 16 cambia convenciones (`proxy`, caché, etc.) | Leer `node_modules/next/dist/docs/` antes de cada pieza nueva (regla de `AGENTS.md`) |
| Filtración de datos personales en verificación pública | Mostrar solo el mínimo (nombre, documento enmascarado, curso, fechas) |
| Alcance de "desechable" crece | Respetar el orden de recorte y la lista de deuda aceptada de §4 |
| Doble caché (Cloudflare + Vercel) sirve datos obsoletos | Reglas de §2.1; AC-17 y AC-21 |
| Conexiones agotadas contra Neon en serverless | Pooler + adaptador de driver; AC-22 |
| Migraciones en build de Vercel | Probar `prisma migrate deploy` en un preview antes del deploy final |
