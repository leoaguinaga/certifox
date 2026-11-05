# Configuración de producción — checklist

Todo el código funciona sin estas integraciones (modo degradado seguro), pero para operar con muchos clientes hay que completarlas. Orden recomendado:

## 1. Base de datos (Neon) — obligatorio

- [ ] `DATABASE_URL` = URL del **pooler** (`-pooler` en el host) con `sslmode=require&connection_limit=5`.
- [ ] Región de Neon = región de las funciones de Vercel.
- [ ] Borrar `DIRECT_URL` de Vercel si existía (ya no se usa; se deriva sola).
- [ ] Primer deploy: Vercel ejecuta `vercel-build` → `pnpm db:deploy` (solo en Production). La migración `20261105120000_tenancy_r2_files_outbox` migra los datos existentes a la organización `certifox` (id `org_default`). Después: renombrarla (`UPDATE organizations SET slug=..., name=... WHERE id='org_default'`) si corresponde.
- [ ] Previews: instalar la integración Neon ↔ Vercel (una rama de BD por preview) y definir `MIGRATE_ON_BUILD=1` solo en Preview. **Nunca** apuntar previews a la BD de producción.
- [ ] Opcional: réplica de lectura → `DATABASE_READ_REPLICA_URL`.

## 2. Auth — obligatorio

- [ ] `BETTER_AUTH_SECRET` (≥ 32 caracteres, `openssl rand -base64 32`). Sin él la app no arranca en producción.
- [ ] `BETTER_AUTH_URL` y `NEXT_PUBLIC_APP_URL` = dominio público (`https://certifox.pe`).
- [ ] `ROOT_DOMAIN=certifox.pe` para subdominios por cliente y cookies compartidas.
- [ ] `TRUSTED_ORIGINS` con dominios propios de clientes, si los hay.

## 3. Cloudflare R2

- [ ] Crear **dos** buckets: `certifox-media` (público) y `certifox-private` (**sin** dominio público ni acceso r2.dev).
- [ ] Dominio propio en el bucket público (`media.certifox.pe`) → `NEXT_PUBLIC_MEDIA_URL`. Agregar ese host a `images.remotePatterns` en `next.config.ts` si cambia.
- [ ] Token de API con permisos de lectura/escritura sobre ambos buckets → `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.
- [ ] CORS en **ambos** buckets: `AllowedOrigins` = dominios de la app, `AllowedMethods` = `PUT, GET`, `AllowedHeaders` = `Content-Type`.
- [ ] Cache rule en Cloudflare: `media.certifox.pe/*` → cache everything, TTL largo (las claves son UUID inmutables).

## 4. Rate limit distribuido (Upstash Redis)

- [ ] Crear base Redis (región cercana a Vercel) → `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- [ ] Sin esto, en producción se registra `kv.memory_fallback` en los logs y el límite es por instancia.

## 5. Cloudflare delante de Vercel

- [ ] SSL *Full (strict)*.
- [ ] Bypass cache: `/campus/*`, `/api/*`, `/verificar/*`.
- [ ] Rate limiting rule (WAF) en `/verificar/*` y `/api/certificados/*` como primera barrera.
- [ ] Opcional: cache corto (60–300 s) en `/cursos*`. El caché de datos de Next ya se invalida con `revalidateTag`; Cloudflare no se purga solo.

## 6. Jobs y emails

- [ ] `CRON_SECRET` (aleatorio). `vercel.json` programa `/api/internal/cron` cada 5 min (requiere plan Pro; en Hobby, usar 1 vez/día o un cron externo con el mismo header).
- [ ] Resend: verificar dominio de envío → `RESEND_API_KEY`, `EMAIL_FROM`.
- [ ] Revisar periódicamente `outbox_events` con `status = 'FAILED'` (dead letter).

## 7. Observabilidad

- [ ] Log drain de Vercel → Axiom / Better Stack / Datadog. Los logs ya son JSON con `requestId`, `userId`, `orgId`, `action`, `ms`.
- [ ] Alertas: `level=error`, `msg=outbox.dead_letter`, `msg=kv.upstash_error`, p95 de rutas.
- [ ] Opcional: Sentry/OTel enganchado en `instrumentation.ts` (`onRequestError` ya centraliza los errores).

## 8. Organizaciones

- [ ] `pnpm org:payments certifox pagos.json` con los datos reales de Yape/Plin/bancos (antes estaban fijos en el código).
- [ ] Alta de cada cliente: `pnpm org:create`, luego `pnpm org:member` para su staff.
- [ ] Opcional: `pnpm platform:superadmin <email>`.

## 9. Antes de cada salto de clientes

- [ ] `k6 run -e BASE_URL=https://staging... loadtest/smoke.js` en staging y revisar umbrales.
