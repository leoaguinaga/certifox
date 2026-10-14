# Certifox — Planificación del Monorepo y Criterios de Aceptación del MVP

> Estado: **borrador para decisión** · Fecha: 2026-10-14
> Fuentes: `architecture.md`, código actual de `front-office`, repo `leoaguinaga/certifox` (producto anterior).
> Los umbrales numéricos (rendimiento, cobertura, etc.) son **propuestas** a validar con el equipo.

---

## 1. Diagnóstico del punto de partida

### 1.1 Qué existe hoy
| Aspecto | Realidad verificada en el repo |
| --- | --- |
| Alcance | Solo `front-office` (Next.js 16.3.4, React 19, Tailwind 4, shadcn/base-ui). 3 commits. |
| Datos | 100 % mock: `data/cursos.ts`, `data/student.ts`, `data/certificados.ts`. No hay ningún `fetch`, ni `process.env`, ni capa `lib/api`. |
| Auth | UI de login/registro sin lógica (`console.log` en `login-form.tsx`). |
| Dependencias | Ninguna de la lista de `architecture.md` está instalada (better-auth, TanStack Query, RHF, zod, nuqs, sonner…). |
| Rutas implementadas | `(public)`: `/`, `/cursos`, `/cursos/[id]`, `/verificar`, `/verificar/[codigo]`, `/verificar/no-encontrado`, `/ingresar` · `(student)`: `/mi-aprendizaje`, `/mis-certificados`, `/perfil`, `/mesa-de-ayuda`. |
| Rutas **no** implementadas | `aula/[cursoSlug]`, todo `(instructor)/gestion/*`, recuperar contraseña, registro como ruta propia. |
| Workspace | `pnpm-workspace.yaml` existe pero solo contiene `ignoredBuiltDependencies`; no define `packages:`. |
| Build | `next build --webpack` (Turbopack desactivado en build). |

### 1.2 Inconsistencias a resolver (afectan al diseño del monorepo)
1. `architecture.md` describe `src/app/...` y `/(auth)/iniciar-sesion`; el código real usa `app/` en la raíz y `/ingresar` dentro de `(public)`.
2. `architecture.md` referencia `../back-office`, `../backend` (NestJS) y `../packages/ui` como **repos/carpetas hermanas que no existen**. El monorepo es justamente el mecanismo para materializarlas.
3. El repo `leoaguinaga/certifox` es **otro producto** (SaaS B2B multiempresa de vencimiento de certificados laborales: Next + Prisma + Better Auth, path-based multi-tenancy). No es el backend NestJS que asume `architecture.md`.
4. Existe un directorio `mockups/` con HTML estático (referencia visual, no código de producción).

### 1.3 Decisiones que bloquean la ejecución (ver §8)
- ¿Qué repo se convierte en el monorepo y qué pasa con `certifox` (producto B2B)?
- ¿La API NestJS ya existe en algún sitio o se construye dentro del monorepo?

---

## 2. Objetivos y alcance

**Objetivo del monorepo:** un único repositorio con `front-office`, `back-office`, `api` y paquetes compartidos, con contratos tipados de extremo a extremo, un solo pipeline de CI y versionado atómico de cambios que cruzan aplicaciones.

**Dentro del alcance de este plan**
- Estructura del monorepo, tooling, CI, migración del código existente.
- Requisitos funcionales y no funcionales del MVP.
- Criterios de aceptación verificables.

**Fuera de alcance del MVP** (de `architecture.md`)
- Carga de comprobante de pago.
- Gráficos/analítica (`recharts`), reproductor multi-proveedor (`react-player`), Redux/Zustand, Axios.
- Administración interna de Foxcode más allá del mínimo necesario para operar (`back-office`: ver RF-BO).

---

## 3. Arquitectura objetivo del monorepo

### 3.1 Herramientas (propuesta)
- **pnpm workspaces** (ya es el gestor: `packageManager: pnpm@10.11.1`).
- **Turborepo** para orquestar `build/lint/typecheck/test` con caché. *Alternativa:* Nx (más pesado; no justificado con 3 apps).
- **TypeScript project references no**; se usa `tsconfig` base compartido + paquetes consumidos como fuente (`transpilePackages` en Next) para evitar un paso de build en dev.
- **Changesets** solo si se publican paquetes; no es necesario en MVP (paquetes `private`).

### 3.2 Estructura

```txt
certifox/
├── apps/
│   ├── front-office/        # actual repo (Next.js) — visitante, estudiante, instructor
│   ├── back-office/         # administración interna Foxcode (Next.js)  [Fase 4]
│   └── api/                 # NestJS + Prisma + Better Auth, OpenAPI    [Fase 3]
├── packages/
│   ├── config/              # eslint, tsconfig.base, prettier
│   ├── contracts/           # zod schemas + tipos generados desde OpenAPI (única fuente de verdad del contrato)
│   └── ui/                  # componentes shadcn compartidos            [solo con ≥3 componentes compartidos]
├── docs/                    # architecture.md, ADRs, este plan
├── .github/workflows/
├── turbo.json
├── pnpm-workspace.yaml      # packages: ["apps/*", "packages/*"]
└── package.json             # scripts raíz, packageManager
```

### 3.3 Reglas de dependencia (se hacen cumplir con lint)
| Origen | Puede importar | No puede importar |
| --- | --- | --- |
| `apps/front-office`, `apps/back-office` | `packages/*` | `apps/api`, Prisma, secretos (respeta principio 5 de `architecture.md`) |
| `apps/api` | `packages/contracts`, `packages/config` | `packages/ui`, apps de Next |
| `packages/contracts` | solo `zod` | cualquier otro paquete o app |
| `packages/ui` | `react`, `tailwind` utils | `contracts`, apps |

Cumplimiento: regla ESLint `no-restricted-imports` por workspace + `pnpm-workspace` con `link-workspace-packages=false` + `dependency-cruiser` (o `eslint-plugin-boundaries`) en CI.

### 3.4 Decisiones de diseño clave (ADR resumidos)
| # | Decisión | Motivo | Alternativa descartada |
| --- | --- | --- | --- |
| ADR-1 | Turborepo + pnpm | Ya hay pnpm; mínimo costo de adopción | Nx, Lerna |
| ADR-2 | Prisma **solo** en `apps/api` | Mantiene la regla "front no toca BD" | Prisma compartido en `packages/db` |
| ADR-3 | Contrato en `packages/contracts` generado desde OpenAPI de Nest | `architecture.md` exige alineación con Swagger | Tipos duplicados a mano |
| ADR-4 | `packages/ui` se crea cuando haya ≥3 componentes realmente compartidos | Regla ya escrita en `architecture.md` | Crearlo de inmediato |
| ADR-5 | Un solo `.env.example` por app; validación con zod en `lib/env.ts` | Evita secretos en cliente | `.env` raíz único |
| ADR-6 | Despliegue independiente por app (filtros `turbo --filter` + `affected`) | Front y API tienen ciclos distintos | Despliegue único |

---

## 4. Requisitos funcionales (RF)

Prioridad MoSCoW. **Estado UI** indica si ya hay pantalla (maqueta con mock) o no. Reglas de negocio tomadas de `architecture.md` §"Reglas de negocio".

### 4.1 Público
| ID | Requisito | Prior. | Estado UI |
| --- | --- | --- | --- |
| RF-PUB-01 | Landing con propuesta de valor, instituciones, FAQ y CTA | Must | ✅ |
| RF-PUB-02 | Catálogo de cursos con búsqueda, filtros (categoría, nivel) y paginación persistidos en URL (`nuqs`) | Must | ✅ (filtros locales) |
| RF-PUB-03 | Detalle de curso: temario, competencias, prerequisitos, instructor, FAQ, precio | Must | ✅ |
| RF-PUB-04 | **Verificación pública de certificado por código**, sin registro; estados válido / vencido / revocado / observado con **etiqueta textual** | Must | ✅ |
| RF-PUB-05 | Página "no encontrado" para códigos inexistentes (sin filtrar si el código existió) | Must | ✅ |

### 4.2 Autenticación y cuenta
| ID | Requisito | Prior. | Estado UI |
| --- | --- | --- | --- |
| RF-AUTH-01 | Registro (email + contraseña) con validación zod/RHF | Must | ⚠️ UI sin lógica |
| RF-AUTH-02 | Inicio/cierre de sesión (Better Auth, cookies con credenciales) | Must | ⚠️ UI sin lógica |
| RF-AUTH-03 | Recuperar contraseña | Should | ❌ |
| RF-AUTH-04 | Login con Google | Could | ⚠️ botón sin lógica |
| RF-AUTH-05 | Redirección por rol (visitante→público, estudiante→`/mi-aprendizaje`, instructor→`/gestion`) | Must | ❌ |

### 4.3 Matrícula
| ID | Requisito | Prior. |
| --- | --- | --- |
| RF-ENR-01 | Solicitar matrícula desde el detalle del curso (requiere sesión) | Must |
| RF-ENR-02 | Matrícula nace **pendiente**; no da acceso al aula | Must |
| RF-ENR-03 | Instructor autorizado **confirma pago** → matrícula activa. Sin carga de comprobante | Must |
| RF-ENR-04 | Notificación (email) al estudiante al activarse la matrícula | Should |

### 4.4 Estudiante
| ID | Requisito | Prior. | Estado UI |
| --- | --- | --- | --- |
| RF-STU-01 | "Mi aprendizaje": cursos activos, pendientes y completados con progreso | Must | ✅ |
| RF-STU-02 | Aula: reproducir lecciones, marcar completada, progreso persistente | Must | ❌ |
| RF-STU-03 | Evaluaciones/quiz y entrega de tareas con adjuntos | Must | ❌ |
| RF-STU-04 | "Mis certificados": listar, ver detalle y descargar PDF | Must | ✅ (sin PDF) |
| RF-STU-05 | Perfil: ver/editar datos; documento enmascarado | Should | ✅ |
| RF-STU-06 | Mesa de ayuda: crear y consultar tickets | Should | ✅ |
| RF-STU-07 | Aislamiento: nunca acceder a cursos, tareas o certificados ajenos | Must | n/a (backend) |

### 4.5 Instructor / certificadora (`/gestion`)
| ID | Requisito | Prior. |
| --- | --- | --- |
| RF-INS-01 | CRUD de cursos (módulos, lecciones, recursos, portada) | Must |
| RF-INS-02 | Lista de matrículas (TanStack Table) con filtro por estado y acción "Confirmar pago" | Must |
| RF-INS-03 | Crear evaluaciones y calificar entregas | Must |
| RF-INS-04 | Emitir certificado al aprobar; **revocar** con motivo y resolución | Must |
| RF-INS-05 | Autorización por curso (un instructor solo gestiona lo suyo) | Must |

### 4.6 Certificados (transversal)
| ID | Requisito | Prior. |
| --- | --- | --- |
| RF-CER-01 | Código único, no adivinable, con huella SHA-256 del contenido emitido | Must |
| RF-CER-02 | Estados: `valido`, `expirado`, `revocado`, `observado` (alineado a `CertificateStatus` actual) | Must |
| RF-CER-03 | QR que apunta a `/verificar/[codigo]` | Must |
| RF-CER-04 | Auditoría (quién emitió/revocó y cuándo) visible en la verificación | Should |
| RF-CER-05 | Anclaje en ledger (`ledgerBlock`/`ledgerId` aparecen en el tipo mock) | **Won't (MVP)** — mantener campos opcionales; ver §8 |

### 4.7 Back-office (Foxcode) — mínimo operativo
| ID | Requisito | Prior. |
| --- | --- | --- |
| RF-BO-01 | Alta/baja de instituciones e instructores | Should |
| RF-BO-02 | Revisión de tickets de mesa de ayuda | Could |
| RF-BO-03 | Auditoría de revocaciones | Could |

### 4.8 Requisitos funcionales del **monorepo** (habilitadores)
| ID | Requisito | Prior. |
| --- | --- | --- |
| RF-MONO-01 | `pnpm install` en la raíz instala todos los workspaces | Must |
| RF-MONO-02 | `pnpm dev --filter front-office` (y `api`) arranca cada app de forma aislada | Must |
| RF-MONO-03 | `pnpm build / lint / typecheck / test` ejecutables desde raíz vía Turborepo | Must |
| RF-MONO-04 | `contracts` consumible por `front-office` y `api`; un cambio de contrato rompe el typecheck del consumidor que no se actualice | Must |
| RF-MONO-05 | El historial git de `front-office` se conserva tras la migración | Must |

---

## 5. Requisitos no funcionales (RNF)

| ID | Categoría | Requisito (propuesta medible) |
| --- | --- | --- |
| RNF-SEC-01 | Seguridad | Autorización real **solo en la API**; middleware/layouts de Next son UX (de `architecture.md`). |
| RNF-SEC-02 | Seguridad | Cookies de sesión `HttpOnly`, `Secure`, `SameSite=Lax`; CORS restringido por entorno. |
| RNF-SEC-03 | Seguridad | Ningún secreto en bundle cliente; solo `NEXT_PUBLIC_*` expuestos; validado en build con zod. |
| RNF-SEC-04 | Seguridad | Rate limit en `GET /certificates/verify/:code` y en login (anti enumeración/fuerza bruta). |
| RNF-SEC-05 | Seguridad | `pnpm audit` sin vulnerabilidades *high/critical* en CI; secret-scanning activo. |
| RNF-PRIV-01 | Privacidad | Documento de identidad siempre enmascarado en vistas públicas; sin PII en logs. Validar con asesoría legal el cumplimiento de la ley de protección de datos aplicable (el mock cita `documentLawNotice`). |
| RNF-PERF-01 | Rendimiento | Páginas públicas (`/`, `/cursos`, `/verificar/[codigo]`): LCP ≤ 2.5 s, CLS ≤ 0.1 en móvil (Lighthouse CI, 4G simulado). |
| RNF-PERF-02 | Rendimiento | `GET /certificates/verify/:code` p95 ≤ 300 ms en el entorno de staging bajo 50 req/s. |
| RNF-PERF-03 | Rendimiento | JS inicial de rutas públicas ≤ 200 KB gzip; componentes de servidor por defecto. |
| RNF-A11Y-01 | Accesibilidad | WCAG 2.2 AA en flujos críticos; **estado de certificado nunca solo por color**. |
| RNF-SEO-01 | SEO | Catálogo y detalle de curso SSR/SSG con `metadata`, `sitemap.xml` y `robots.txt`; verificación con `noindex` por código. |
| RNF-RESP-01 | Responsive | Pantallas de estudiante y verificación usables desde 360 px. |
| RNF-I18N-01 | Localización | UI en español (es-PE); fechas/moneda con `Intl`/`date-fns` (locale `es`). |
| RNF-REL-01 | Fiabilidad | Estados de carga, vacío, error y éxito en toda pantalla con datos (checklist de feature). |
| RNF-REL-02 | Fiabilidad | Errores de API traducidos a mensajes de UI; sin trazas ni mensajes internos. |
| RNF-OBS-01 | Observabilidad | Logs estructurados con `requestId` en API; error tracking (p. ej. Sentry) en front y API. |
| RNF-OBS-02 | Observabilidad | `GET /health` en API y verificación post-deploy. |
| RNF-TEST-01 | Calidad | Tests unitarios en `contracts` y reglas de negocio de la API; e2e (Playwright) de los 3 flujos críticos (§6.3). Cobertura mínima propuesta: 70 % en reglas de negocio de la API. |
| RNF-TEST-02 | Calidad | `typecheck` estricto (`strict: true`) en todos los workspaces. |
| RNF-DX-01 | Mantenibilidad | Instalación en frío ≤ 3 min; `turbo` con caché: reconstrucción sin cambios ≤ 30 s. |
| RNF-DX-02 | Mantenibilidad | Node y pnpm fijados (`engines`, `packageManager`, `.nvmrc`). |
| RNF-CI-01 | CI/CD | PR ejecuta solo lo afectado (`turbo --affected`) y tarda ≤ 10 min p90. |
| RNF-CI-02 | CI/CD | Despliegue independiente por app; rollback documentado. |
| RNF-PORT-01 | Portabilidad | Variables de entorno documentadas en `.env.example` por app; arranque con Docker Compose (Postgres) para desarrollo local de la API. |

---

## 6. Criterios de aceptación del MVP

Formato *Dado / Cuando / Entonces*. El MVP se considera **aceptado** solo si todos los criterios **Must** pasan en el entorno de staging.

### 6.1 Monorepo (habilitadores)
| ID | Criterio |
| --- | --- |
| AC-MONO-01 | **Dado** un clon limpio, **cuando** se ejecuta `pnpm install && pnpm build` en la raíz, **entonces** termina con código 0 y construye `front-office` (y `api` cuando exista). |
| AC-MONO-02 | **Dado** un cambio solo en `apps/front-office`, **cuando** corre el CI del PR, **entonces** no se reconstruye `apps/api` y el job tarda menos que el pipeline completo. |
| AC-MONO-03 | **Dado** que se modifica un schema en `packages/contracts`, **cuando** el consumidor no se adapta, **entonces** `pnpm typecheck` falla. |
| AC-MONO-04 | **Dado** un import de Prisma o de `apps/api` desde `front-office`, **cuando** corre `pnpm lint`, **entonces** falla por la regla de límites. |
| AC-MONO-05 | `git log --follow` sobre `apps/front-office/app/(public)/page.tsx` muestra los commits previos a la migración. |
| AC-MONO-06 | Las rutas existentes y sus redirecciones (`/verificar-certificado` → `/verificar`, etc.) responden igual que antes de la migración (smoke test automático). |
| AC-MONO-07 | `README.md` raíz documenta estructura, comandos y reglas de dependencia; `architecture.md` refleja la estructura real (sin `src/` fantasma). |

### 6.2 Producto

**Verificación pública (RF-PUB-04/05, RF-CER-\*)**
- **AC-VER-01** Dado un código de certificado válido, cuando un visitante **sin sesión** abre `/verificar/{codigo}`, entonces ve titular (documento enmascarado), curso, fecha de emisión, vigencia, huella SHA-256 y la etiqueta textual **"Válido"**.
- **AC-VER-02** Dado un certificado revocado, entonces se muestra la etiqueta textual **"Revocado"**, fecha, motivo y resolución; igual para *expirado* y *observado*, sin depender solo del color.
- **AC-VER-03** Dado un código inexistente o mal formado, entonces se redirige/muestra "no encontrado" con HTTP 404 y sin revelar si el código existió.
- **AC-VER-04** Dado el escaneo del QR del certificado, entonces se abre la URL de verificación correcta.
- **AC-VER-05** Más de N consultas/minuto desde una IP reciben `429` (N a definir; propuesta 30).

**Autenticación (RF-AUTH-\*)**
- **AC-AUTH-01** Dado un email nuevo, cuando se registra con datos válidos, entonces se crea la cuenta con rol *estudiante* y se inicia sesión.
- **AC-AUTH-02** Dadas credenciales inválidas, entonces se muestra un mensaje genérico (sin indicar cuál campo falló).
- **AC-AUTH-03** Dado un usuario sin sesión, cuando entra a `/mi-aprendizaje` o `/gestion/*`, entonces es redirigido a `/ingresar`; y un estudiante en `/gestion/*` recibe 403 desde la API.
- **AC-AUTH-04** Cerrar sesión invalida la cookie; el botón "atrás" no expone datos privados.

**Catálogo y matrícula (RF-PUB-02/03, RF-ENR-\*)**
- **AC-ENR-01** Dado un catálogo servido por la API, cuando se filtra por categoría/nivel/búsqueda, entonces la URL refleja los filtros y al recargar el resultado es idéntico.
- **AC-ENR-02** Dado un estudiante autenticado, cuando solicita matrícula, entonces queda **"pendiente de confirmación"** y el acceso a `/aula/{curso}` está bloqueado (API responde 403).
- **AC-ENR-03** Dado un instructor autorizado del curso, cuando pulsa **"Confirmar pago"**, entonces la matrícula pasa a *activa* y el estudiante accede al aula. Un instructor de otro curso recibe 403.
- **AC-ENR-04** No existe ninguna UI ni endpoint de carga de comprobante de pago.

**Aprendizaje y evaluación (RF-STU-\*)**
- **AC-STU-01** Dado un curso activo, cuando el estudiante completa una lección y recarga, entonces el progreso persiste y coincide con "Mi aprendizaje".
- **AC-STU-02** Dado un estudiante A, cuando consulta por ID un curso, tarea o certificado del estudiante B, entonces recibe 403/404.
- **AC-STU-03** Dada una evaluación con nota mínima, cuando el estudiante la aprueba y se cumplen todos los requisitos del curso, entonces el curso pasa a *completado*.

**Emisión y revocación (RF-INS-04)**
- **AC-CER-01** Dado un estudiante que completó el curso, cuando el instructor emite el certificado, entonces se genera código único, huella SHA-256 y PDF con QR, visible en "Mis certificados".
- **AC-CER-02** Dado un certificado emitido, cuando el instructor lo revoca indicando motivo, entonces `/verificar/{codigo}` pasa a "Revocado" en ≤ 1 minuto (sin caché obsoleta) y queda registro de auditoría.
- **AC-CER-03** El PDF descargado coincide con los datos de la verificación pública (mismo código, nota y fechas).

**Mesa de ayuda y perfil (Should)**
- **AC-SUP-01** El estudiante crea un ticket y lo ve en su lista con estado *abierto*; no ve tickets ajenos.
- **AC-PRO-01** El estudiante edita sus datos permitidos; el documento de identidad se muestra siempre enmascarado.

### 6.3 Flujos e2e obligatorios (Playwright, en CI)
1. **Visitante → verificación:** abrir `/verificar/{codigo}` para válido, revocado y no encontrado.
2. **Matrícula:** registro → solicitar matrícula → bloqueo de aula → instructor confirma pago → acceso al aula.
3. **Certificación:** completar curso → emitir → verificar públicamente → revocar → verificar de nuevo.

### 6.4 Criterios no funcionales de aceptación
| ID | Criterio | Verificación |
| --- | --- | --- |
| AC-NFR-01 | Lighthouse móvil en `/`, `/cursos`, `/verificar/{codigo}`: Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 95 | Lighthouse CI |
| AC-NFR-02 | 0 violaciones *serious/critical* de axe en los flujos §6.3 | `@axe-core/playwright` |
| AC-NFR-03 | 0 secretos en el bundle cliente y en el historial | gitleaks + inspección de `.next/static` |
| AC-NFR-04 | `pnpm audit --prod` sin *high/critical* | CI |
| AC-NFR-05 | `GET /certificates/verify/:code` p95 ≤ 300 ms a 50 req/s | k6 en staging |
| AC-NFR-06 | `lint`, `typecheck`, `test`, `build` en verde con `strict: true` | CI |
| AC-NFR-07 | Dashboards/alertas mínimos: error rate y `/health` monitorizados | Revisión manual en staging |
| AC-NFR-08 | Despliegue y rollback de `front-office` y `api` ejecutados con éxito al menos una vez en staging | Runbook |

---

## 7. Plan de ejecución por fases

Estimaciones relativas (T-shirt) para un equipo pequeño; recalibrar tras la Fase 0.

### Fase 0 — Decisiones y preparación (S)
- Resolver decisiones abiertas de §8.
- Congelar `architecture.md` como fuente y corregir discrepancias (§1.2).
- Definir convención de commits, ramas y CODEOWNERS.
- **Salida:** ADR-1…6 firmados.

### Fase 1 — Esqueleto del monorepo (M)
1. Crear estructura `apps/`, `packages/`, `docs/`; mover el proyecto actual a `apps/front-office` con `git mv` en un commit dedicado (preserva `--follow`). Si el monorepo es un repo nuevo: `git filter-repo --to-subdirectory-filter apps/front-office` y merge con `--allow-unrelated-histories`.
2. `pnpm-workspace.yaml` con `packages:`; conservar `ignoredBuiltDependencies` (movido al `package.json` raíz si pnpm lo requiere).
3. Raíz: `package.json` (scripts + `packageManager` + `engines`), `turbo.json`, `.nvmrc`, `.gitignore` consolidado.
4. `packages/config`: `tsconfig.base.json`, preset ESLint flat, reglas de límites.
5. Ajustar `apps/front-office`: `extends` del tsconfig base, mantener alias `@/*`, `outputFileTracingRoot` si el deploy lo exige.
6. CI mínimo (GitHub Actions): install con caché de pnpm → `turbo run lint typecheck build --affected`.
7. Smoke test de rutas y redirecciones existentes (AC-MONO-06).
- **Salida:** AC-MONO-01, 02, 05, 06, 07.

### Fase 2 — Contratos y base de datos de aplicación (M)
1. `packages/contracts`: schemas zod de `Course`, `Enrollment`, `Certificate`, `StudentProfile`, `Ticket` (derivados de `features/*/types.ts`, **eliminando campos de presentación** como `statusLabel`, `categoryLabel`, `timeAgo`).
2. Cliente `lib/api` en front (fetch wrapper + manejo de errores) y `lib/env.ts` con zod.
3. Instalar el stack de `architecture.md` (§Dependencias) **solo lo que se use en la fase**.
4. Sustituir `data/*.ts` por *fixtures* en `contracts/fixtures` (para tests y Storybook/MSW) y retirar el mock de runtime.
- **Salida:** AC-MONO-03, 04.

### Fase 3 — API NestJS (L)
1. `apps/api`: módulos `auth`, `catalog`, `enrollments`, `learning`, `assessments`, `certificates`, `support`.
2. Prisma + PostgreSQL (migraciones, seed); Better Auth con cookies y CORS.
3. OpenAPI → generación de tipos/cliente en `contracts`.
4. Guards por rol y por propiedad (RF-STU-07, RF-INS-05); rate limiting; `/health`; logs con `requestId`.
5. Docker Compose para Postgres local.
- **Salida:** AC-AUTH-\*, AC-ENR-02/03, AC-STU-02, AC-NFR-05 (parcial).
- **Nota:** se puede reutilizar el aprendizaje del repo `certifox` (Better Auth + Prisma + auditoría + cron), pero no su modelo multi-tenant por `companySlug`, que no corresponde a este producto.

### Fase 4 — Integración vertical por flujo (L, iterativa)
Orden por valor y riesgo:
1. **Verificación pública** (la más simple y el diferenciador del producto) → AC-VER-\*.
2. **Auth + guards de rutas** → AC-AUTH-\*.
3. **Catálogo + matrícula pendiente/confirmada** → AC-ENR-\*.
4. **Aula + progreso + evaluaciones** → AC-STU-\*.
5. **Panel `/gestion`** (matrículas, cursos, evaluaciones) → RF-INS-\*.
6. **Emisión/revocación + PDF + QR** → AC-CER-\*.
7. Mesa de ayuda y perfil → AC-SUP/PRO.
Cada flujo: contrato → endpoint → pantalla → e2e → criterio de aceptación marcado.

### Fase 5 — `packages/ui` y `back-office` (M, condicionada)
- Extraer `packages/ui` cuando existan ≥3 componentes compartidos con back-office (ADR-4).
- `apps/back-office` con RF-BO mínimos; si no hay urgencia, se difiere post-MVP.

### Fase 6 — Endurecimiento y salida (M)
- Lighthouse CI, axe, k6, gitleaks, `pnpm audit` (AC-NFR-\*).
- Observabilidad, runbooks de despliegue/rollback, `sitemap`/`robots`.
- Revisión de privacidad con asesoría legal.
- **Salida:** checklist de §6 completo → MVP aceptado.

### Hitos
| Hito | Contenido | Criterios cubiertos |
| --- | --- | --- |
| M1 | Monorepo operativo (Fase 1) | AC-MONO-01/02/05/06/07 |
| M2 | Contratos + API base con auth (Fases 2-3) | AC-MONO-03/04, AC-AUTH-\* |
| M3 | Verificación pública real + matrícula | AC-VER-\*, AC-ENR-\* |
| M4 | Aula, evaluaciones, emisión/revocación | AC-STU-\*, AC-CER-\* |
| M5 | Hardening y aceptación | AC-NFR-\*, e2e §6.3 |

---

## 8. Decisiones abiertas (necesito tu respuesta)

| # | Pregunta | Recomendación |
| --- | --- | --- |
| D1 | **¿Qué repo es el monorepo?** (a) renombrar/extender `certifox-frontoffice`, (b) crear repo nuevo `certifox` limpio e importar front-office con historia, (c) reutilizar `leoaguinaga/certifox` | **(b)** si `certifox` (B2B de vencimientos) es un producto distinto y se archiva; **(a)** si quieres el camino más corto. No mezclar (c) con este producto sin decidir su destino. |
| D2 | ¿Qué hacer con el producto B2B actual en `certifox`? (archivar, mantener como `apps/` aparte, o convergir) | Archivar y tomar solo aprendizajes (auth, auditoría, cron de alertas). |
| D3 | ¿La API NestJS existe ya en otro lado o se construye aquí? | Construirla en `apps/api` (Fase 3). |
| D4 | ¿Alcance de back-office en el MVP? | Diferir; operar el MVP con seed/scripts + panel de instructor. |
| D5 | ¿Ledger/blockchain (`ledgerBlock`) forma parte del MVP? | No; dejar campos opcionales y confiar en SHA-256 + auditoría. |
| D6 | ¿Hosting? (Vercel para Next; ¿dónde NestJS + Postgres?) | Definir antes de Fase 1 para ajustar `turbo --affected` y `outputFileTracingRoot`. |
| D7 | ¿Pasarela de pago futura? Hoy el pago se confirma manualmente | Mantener manual en MVP (RF-ENR-03). |
| D8 | Umbrales RNF (LCP, p95, cobertura, rate limits) | Aceptar propuestas de §5 o ajustar. |

---

## 9. Riesgos

| Riesgo | Prob. | Impacto | Mitigación |
| --- | --- | --- | --- |
| Perder historia git al mover el proyecto | M | M | `git mv` en commit aislado o `filter-repo`; AC-MONO-05 |
| Deriva entre `architecture.md` y el código | A | M | Corregir en Fase 0; revisión en cada PR de estructura |
| Contratos duplicados front/API | M | A | `packages/contracts` como única fuente; typecheck cruzado |
| `next build --webpack` y Turborepo/caché de Next | B | M | Declarar `.next/**` como output en `turbo.json`; probar caché temprano |
| Alcance de la API subestimado (no existe hoy) | A | A | Entregar por verticales (Fase 4); verificación pública primero |
| Exposición de datos personales en verificación pública | M | A | Enmascarado por defecto, revisión legal, tests de contrato |
| Enumeración de códigos de certificado | M | M | Códigos no secuenciales de alta entropía + rate limit (AC-VER-05) |
| Equipos pequeños sobrecargados por tooling | M | B | Turborepo (no Nx); sin Changesets en MVP |

---

## 10. Definición de "Hecho" (DoD) por tarea

- Código en `main` vía PR con CI verde (`lint`, `typecheck`, `test`, `build`).
- Estados de carga/vacío/error/éxito implementados.
- Permisos validados en la API (no solo en la UI) y probados.
- Probado en móvil (≥ 360 px) si es pantalla de estudiante.
- Criterio(s) de aceptación asociados marcados en este documento.
- Sin dependencias fuera de las aprobadas en `architecture.md` sin ADR.
