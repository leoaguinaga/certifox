# Front Office — Arquitectura

## Propósito

Este proyecto contiene toda la experiencia externa de Certifox. Incluye:

- Landing, catálogo y páginas públicas de cursos.
- Registro e inicio de sesión.
- Aula virtual y perfil del estudiante.
- Panel de gestión para instructores y certificadoras.
- Verificación pública de certificados.

No incluye la administración interna de Foxcode; esa responsabilidad pertenece a `../back-office`. Toda regla de negocio y acceso a datos se resuelve mediante la API NestJS de `../backend`.

## Principios

1. Un solo proyecto Next.js para visitante, estudiante e instructor.
2. Las rutas definen navegación y layouts; las funcionalidades viven en `features/`.
3. Los componentes de servidor son la opción por defecto; los componentes cliente solo se usan para interactividad o APIs del navegador.
4. El navegador nunca contiene reglas críticas de permisos, certificación, pagos o notas.
5. Este proyecto no importa Prisma, entidades del backend ni secretos.
6. Las peticiones de datos usan la API de NestJS; no se crean APIs paralelas de negocio en Next.js.

## Estructura de carpetas

```txt
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── cursos/
│   │   ├── verificar/[codigo]/
│   │   └── layout.tsx
│   ├── (auth)/
│   │   ├── iniciar-sesion/
│   │   ├── registro/
│   │   └── recuperar-contrasena/
│   ├── (student)/
│   │   ├── layout.tsx
│   │   ├── mi-aprendizaje/
│   │   ├── aula/[cursoSlug]/
│   │   ├── mis-certificados/
│   │   └── perfil/
│   ├── (instructor)/
│   │   └── gestion/
│   │       ├── layout.tsx
│   │       ├── cursos/
│   │       ├── matriculas/
│   │       ├── evaluaciones/
│   │       └── certificados/
│   ├── layout.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   └── providers.tsx
│
├── features/
│   ├── catalog/
│   ├── enrollments/
│   ├── learning/
│   ├── assessments/
│   ├── certificates/
│   ├── instructor/
│   ├── profile/
│   └── auth/
│
├── components/
│   ├── layout/
│   └── shared/
│
├── lib/
│   ├── api/
│   ├── auth/
│   ├── env.ts
│   └── utils.ts
│
├── hooks/
├── types/
└── styles/
```

## Rutas y layouts

| Grupo | Público | Layout | Ejemplos |
| --- | --- | --- | --- |
| `(public)` | Visitantes | Header y footer de marketing | `/`, `/cursos`, `/verificar/[codigo]` |
| `(auth)` | Usuarios sin sesión | Centrado, sin navegación compleja | `/iniciar-sesion`, `/registro` |
| `(student)` | Estudiantes autenticados | Navegación de aprendizaje | `/mi-aprendizaje`, `/aula/...` |
| `(instructor)` | Instructores autenticados | Sidebar operativo | `/gestion/cursos`, `/gestion/matriculas` |

La comprobación real de rol se hace en la API. El middleware y layout de Next solo mejoran la experiencia redirigiendo a rutas apropiadas; nunca sustituyen los guards del backend.

## Organización por feature

Cada feature es dueño de sus componentes específicos, hooks, esquemas y llamadas de API.

```txt
features/learning/
├── api/
│   └── get-course-progress.ts
├── components/
│   ├── course-player.tsx
│   ├── lesson-sidebar.tsx
│   └── progress-summary.tsx
├── hooks/
│   └── use-mark-lesson-complete.ts
├── schemas/
├── types.ts
└── index.ts
```

No crear un directorio global `services/` o `helpers/` para lógica de dominios. Si una pieza solo sirve para cursos, matrículas o evaluaciones, debe permanecer en su feature.

## Componentes y UI

- Los componentes base de shadcn permanecen en `components/ui` hasta que haya una necesidad real de compartirlos con `back-office`.
- Componentes compartidos de este proyecto: `components/shared`.
- Componentes de navegación y shell: `components/layout`.
- Componentes de dominio: siempre dentro de la feature correspondiente.
- No mezclar consultas a API, formularios extensos y presentación en un componente único.

Cuando se comparta el mismo componente sin variaciones significativas entre `front-office` y `back-office`, se mueve a `../packages/ui`. No crear `packages/ui` antes de tener al menos tres componentes realmente compartidos.

## Datos, estado y formularios

- **TanStack Query:** estado remoto, caché, mutaciones e invalidación.
- **React Hook Form + Zod:** formularios y validaciones de cliente.
- **nuqs:** filtros, búsqueda y paginación que deban persistir en URL.
- **Estado local:** `useState`, `useReducer` o contexto local; no instalar Redux/Zustand sin una necesidad concreta.
- **sonner:** feedback breve de acciones exitosas o fallidas.

Las claves de Query deben estar agrupadas por dominio, por ejemplo: `courses`, `enrollments`, `learning-progress` y `certificates`.

## API y autenticación

- La URL de API proviene de `NEXT_PUBLIC_API_URL`.
- Better Auth se consume desde `lib/auth/auth-client.ts`.
- Las llamadas autenticadas incluyen credenciales de acuerdo con la configuración de Better Auth y CORS de la API.
- Los contratos de request/response no se redefinen libremente: se mantienen alineados con Swagger/OpenAPI del backend.
- Los errores de API se transforman a mensajes de interfaz; no se muestran mensajes internos ni trazas al usuario.

## Reglas de negocio que la UI debe respetar

1. Una matrícula pendiente no permite entrar al aula.
2. El estudiante no puede consultar cursos, tareas o certificados ajenos.
3. La UI solo muestra la acción “Confirmar pago” a instructores autorizados; el backend vuelve a validarlo.
4. Un certificado válido, vencido o revocado debe conservar siempre su etiqueta textual, no solo color.
5. La verificación de certificado es pública y no solicita registro.
6. No existe carga de comprobante de pago en el MVP.

## Checklist para agregar una feature

1. Crear la ruta en `app/` si necesita una URL propia.
2. Crear la carpeta de dominio en `features/`.
3. Definir componentes de presentación y hooks por separado.
4. Usar contratos de API existentes o coordinar el cambio con `backend`.
5. Implementar estados de carga, vacío, error y éxito.
6. Validar permisos y comportamiento en móvil cuando sea una pantalla de estudiante.
7. Añadir tests del flujo crítico cuando aplique.

## Dependencias y checklist de instalación

Ejecutar desde `front-office/` para revisar el estado real:

```bash
pnpm ls --depth 0
```

El checklist refleja la base requerida para el MVP. Marcar una dependencia solo después de confirmarla en `package.json` o con el comando anterior.

### Base del proyecto

- [ ] `next`
- [ ] `react`
- [ ] `react-dom`
- [ ] `typescript`
- [ ] `tailwindcss`
- [x] Componentes de shadcn/ui instalados
- [ ] `lucide-react` — confirmar; shadcn suele agregarlo al instalar componentes.
- [ ] `better-auth` — cliente de autenticación de Certifox.

### Datos y formularios

- [ ] `@tanstack/react-query` — consultas, caché y mutaciones contra NestJS.
- [ ] `@tanstack/react-table` — tablas del panel de instructor.
- [ ] `react-hook-form` — formularios.
- [ ] `@hookform/resolvers` — conexión entre formularios y esquemas.
- [ ] `zod` — validación y tipado de formularios/URL.
- [ ] `nuqs` — filtros, búsqueda y paginación persistidos en URL.
- [ ] `sonner` — notificaciones de interfaz.
- [ ] `date-fns` — fechas de matrícula, tareas y certificados.

### Archivos y desarrollo

- [ ] `react-dropzone` — adjuntos de tareas, recursos y portadas.
- [ ] `@tanstack/react-query-devtools` — recomendado solo como dependencia de desarrollo.

### No instalar todavía

- `react-player`: añadir solo si se integrarán múltiples proveedores de video; para Stream/R2 basta `<video>` inicialmente.
- `recharts`: no es necesario en el aula ni en el panel docente del MVP.
- Redux o Zustand: no instalar mientras React Query y estado local sean suficientes.
- Axios: usar `fetch` nativo o un wrapper pequeño sobre `fetch`.

### Comando de instalación pendiente

```bash
pnpm add better-auth @tanstack/react-query @tanstack/react-table react-hook-form @hookform/resolvers zod nuqs sonner date-fns react-dropzone
pnpm add -D @tanstack/react-query-devtools
```
