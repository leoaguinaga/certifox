# Certifox

Plataforma de capacitación técnica y acreditación profesional con verificación criptográfica pública.

> **Arquitectura:** Un único proyecto full-stack en **Next.js 16** (App Router + Server Components + Server Actions + Prisma + Better Auth) con un solo deploy. Consulta [`architecture.md`](./architecture.md) y el plan maestro en [`docs/monorepo-plan.md`](./docs/monorepo-plan.md).

## Estructura principal

- `app/(public)`: Sitio público (`/`, `/cursos`, `/cursos/[id]`, `/verificar/[codigo]`, `/ingresar`).
- `app/(campus)/campus`: Campus virtual unificado por rol (`STUDENT` | `INSTRUCTOR`):
  - `/campus`: Panel principal de estudiante o docente.
  - `/campus/cursos`: Cursos matriculados del alumno o cursos asignados/gestionados por el instructor.
  - `/campus/certificados`: Colección de certificados del alumno o bandeja de emisión/revocación docente.
  - `/campus/tareas`: Entregas prácticas y bandeja de calificación.
  - `/campus/estudiantes`: Gestión de matrículas y confirmación de pago (instructor).
  - `/campus/perfil`: Datos del titular y seguridad de cuenta.
  - `/campus/mesa-de-ayuda`: Tickets de soporte académico y técnico.
- `features/`: Módulos de dominio (`campus`, `catalog`, `learning`, `certificates`, `auth`, `landing`).
- `server/` *(Fase 1+)*: Cliente Prisma, configuración de Better Auth, políticas de autorización (`policies.ts`) y servicios de dominio.

## Requisitos previos

- **Node.js** 20+
- **pnpm** 10+

## Arranque local

1. Instalar dependencias:
   ```bash
   pnpm install
   ```

2. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   ```

3. *(A partir de Fase 1)* Ejecutar migraciones y seed de demostración:
   ```bash
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```

4. Iniciar el servidor de desarrollo:
   ```bash
   pnpm dev
   ```

5. Abrir [http://localhost:3000](http://localhost:3000).

## Comandos de verificación

Antes de cada deploy deben pasar en verde:

```bash
pnpm lint
npx tsc --noEmit
pnpm build
```
