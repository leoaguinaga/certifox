# Certifox

Plataforma de capacitación técnica y acreditación profesional con verificación criptográfica pública.

> **Arquitectura:** Un único proyecto full-stack en **Next.js 16** (App Router + Server Components + Server Actions + Prisma + Better Auth) con un solo deploy. Consulta [`architecture.md`](./architecture.md) y el plan maestro en [`docs/monorepo-plan.md`](./docs/monorepo-plan.md).

## Estructura principal

- `app/(public)`: Sitio público (`/`, `/cursos`, `/cursos/[id]`, `/verificar/[codigo]`, `/ingresar`, `/privacidad`, `/terminos`).
- `app/(campus)/campus`: Campus virtual unificado por rol (`STUDENT` | `INSTRUCTOR`):
  - `/campus`: Panel principal de estudiante o docente.
  - `/campus/cursos`: Cursos matriculados del alumno o cursos asignados/gestionados por el instructor.
  - `/campus/certificados`: Colección de certificados del alumno o bandeja de emisión/revocación docente.
  - `/campus/tareas`: Entregas prácticas y bandeja de calificación.
  - `/campus/estudiantes`: Gestión de matrículas y confirmación de pago (instructor).
  - `/campus/perfil`: Datos del titular, cambio de clave y avatar seguro en R2 (Ley 29733).
  - `/campus/mesa-de-ayuda`: Tickets de soporte y consultas con persistencia en PostgreSQL.
- `features/`: Módulos de dominio (`campus`, `catalog`, `learning`, `certificates`, `courses-management`, `certificates-management`, `profile`, `help-desk`, `auth`, `landing`).
- `server/`: Cliente Prisma, configuración de Better Auth, políticas de autorización (`policies.ts`), servicios de dominio y generación de PDFs con QR.

## Requisitos previos

- **Node.js** 20+
- **pnpm** 10+

## Arranque local

1. Instalar dependencias:
   ```bash
   pnpm install
   ```

2. Configurar variables de entorno (`.env`):
   ```env
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   BETTER_AUTH_SECRET="tu-clave-secreta-32-bytes"
   BETTER_AUTH_URL="http://localhost:3000"
   
   # Cloudflare R2 (Opcional en desarrollo local; usa fallback si está vacío)
   R2_ACCOUNT_ID="tu-account-id"
   R2_ACCESS_KEY_ID="tu-access-key-id"
   R2_SECRET_ACCESS_KEY="tu-secret-access-key"
   R2_BUCKET="certifox-media"
   NEXT_PUBLIC_MEDIA_URL="https://media.certifox.edu"
   ```

3. Restaurar y re-seedear base de datos (Neon PostgreSQL):
   ```bash
   pnpm prisma db push
   pnpm prisma db seed
   ```

4. Convertir un usuario en instructor (CLI):
   ```bash
   pnpm make-instructor profe@certifox.pe
   ```

5. Iniciar el servidor de desarrollo:
   ```bash
   pnpm dev
   ```

6. Abrir [http://localhost:3000](http://localhost:3000).

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

Antes de cada commit o deploy deben pasar todos en verde:

```bash
pnpm test
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```
