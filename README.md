# Certifox

Plataforma de capacitación técnica y acreditación profesional con verificación criptográfica pública.

> **Arquitectura:** Un único proyecto full-stack en **Next.js 16** (App Router + Server Components + Server Actions + Prisma + Better Auth) con un solo deploy. Consulta [`architecture.md`](./architecture.md) y el plan maestro en [`docs/monorepo-plan.md`](./docs/monorepo-plan.md).

## Estructura principal

- `app/(public)`: sitio público (`/`, `/cursos`, `/cursos/[id]`, `/verificar/[codigo]`, `/ingresar`, ...). En `<slug>.ROOT_DOMAIN` muestra solo la organización correspondiente.
- `app/(campus)/campus`: campus por rol dentro de la **organización activa** (staff = OWNER/ADMIN/INSTRUCTOR → panel docente; resto → panel de estudiante).
- `app/api`: auth, PDF de certificados, subida directa a R2 (`upload/presigned` → PUT → `upload/confirm`) y cron interno.
- `features/`: UI por dominio + `actions.ts` finas (`runAction`: zod → contexto → rate limit → caso de uso).
- `server/core/`: infraestructura transversal (env estricto, Prisma, auth, contexto de request, políticas, errores, logger, rate limit, R2, outbox, email, caché).
- `server/modules/`: casos de uso por dominio (`catalog`, `course-management`, `enrollment`, `learning`, `assessment`, `certification`, `files`, `organization`, `profile`, `support`, `jobs`, `audit`).

Arquitectura y decisiones: [`docs/backend-architecture.md`](./docs/backend-architecture.md). Configuración de producción: [`docs/configuracion-produccion.md`](./docs/configuracion-produccion.md).

## Requisitos previos

- **Node.js** 22+ (`process.loadEnvFile`)
- **pnpm** 10+
- PostgreSQL (Neon en producción; uno local para desarrollo y tests de integración)

## Arranque local

1. `pnpm install`
2. Copia `.env.example` a `.env`. Para desarrollo basta con `DATABASE_URL`; el resto tiene modo local.
3. Migraciones y datos demo:
   ```bash
   pnpm db:deploy   # aplica migraciones (usa la conexión directa derivada de DATABASE_URL)
   pnpm db:seed     # organización demo "certifox" + usuarios (Password123!)
   ```
4. `pnpm dev` y abre [http://localhost:3000](http://localhost:3000).

Usuarios demo: `profe@certifox.pe` (OWNER de la organización demo), `alumno@certifox.pe`, `lucia@certifox.pe`.

## Organizaciones (clientes)

```bash
pnpm org:create <slug> "<Nombre>" <ownerEmail> [dominioPropio]
pnpm org:member <orgSlug> <email> <OWNER|ADMIN|INSTRUCTOR|STUDENT>
pnpm org:payments <orgSlug> pagos.json      # Yape/Plin/bancos/WhatsApp (validado con zod)
pnpm platform:superadmin <email>
```

El usuario debe haberse registrado antes en `/ingresar`. El registro público nunca otorga roles.

## Reglas de Caché y Cloudflare (AC-21)

1. **Rutas Privadas del Campus (`/campus/*`):**
   - Configurado con cabecera `Cache-Control: private, no-store, no-cache, must-revalidate, max-age=0`.
   - En Cloudflare Page Rules / Cache Rules:
     - Regla: `*certifox.pe/campus/*` -> **Bypass Cache** (nunca dar `HIT`).
2. **Verificación Pública (`/verificar/*`):**
   - Headers `Cache-Control: public, no-cache, must-revalidate`.
   - Al revocar un certificado, la respuesta dinámica en Cloudflare garantiza estatus inmediato sin retener certificados invalidados.
3. **Archivos Estáticos y Medios R2:**
   - Dominio de medios `media.certifox.edu` con `Cache-Control: public, max-age=31536000, immutable` (darán `HIT` a partir de la segunda petición).

## Comandos de verificación (Definition of Done)

```bash
pnpm lint
pnpm typecheck
pnpm test                                                    # unitarios
TEST_DATABASE_URL=postgresql://... pnpm test:integration     # contra Postgres real (borra esa BD)
pnpm build
```

CI (`.github/workflows/ci.yml`) ejecuta todo lo anterior con un Postgres efímero y verifica que las migraciones no tengan drift. Prueba de carga: `loadtest/smoke.js` (k6).
