-- Multi-tenancy (organizaciones + membresías), archivos en R2, outbox,
-- snapshot de certificados e índices en todas las claves foráneas.
-- Migración con preservación de datos: hace backfill antes de aplicar NOT NULL.

-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('USER', 'SUPERADMIN');
CREATE TYPE "OrgRole" AS ENUM ('OWNER', 'ADMIN', 'INSTRUCTOR', 'STUDENT');
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "FileKind" AS ENUM ('COURSE_COVER', 'USER_AVATAR', 'ORGANIZATION_LOGO', 'LESSON_VIDEO', 'LESSON_RESOURCE', 'SUBMISSION_ATTACHMENT', 'CERTIFICATE_PDF');
CREATE TYPE "FileVisibility" AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE "FileStatus" AS ENUM ('PENDING', 'READY', 'DELETED');
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');

CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "taxId" TEXT,
    "customDomain" TEXT,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "paymentSettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "logoFileId" TEXT,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "kind" "FileKind" NOT NULL,
    "visibility" "FileVisibility" NOT NULL DEFAULT 'PUBLIC',
    "status" "FileStatus" NOT NULL DEFAULT 'PENDING',
    "bucket" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "checksumSha256" TEXT,
    "originalName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "organizationId" TEXT,
    "uploadedById" TEXT,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lesson_resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lessonId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "lesson_resources_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "outbox_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 8,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- =============================================================================
-- Columnas nuevas (nullable primero para poder hacer backfill sin perder datos)
-- =============================================================================
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_actorId_fkey";
ALTER TABLE "audit_logs" ADD COLUMN "organizationId" TEXT, ALTER COLUMN "actorId" DROP NOT NULL;

ALTER TABLE "certificates"
  ADD COLUMN "courseTitle" TEXT,
  ADD COLUMN "finalScore" INTEGER,
  ADD COLUMN "holderName" TEXT,
  ADD COLUMN "hours" INTEGER,
  ADD COLUMN "organizationId" TEXT,
  ADD COLUMN "pdfFileId" TEXT;

ALTER TABLE "courses"
  ADD COLUMN "coverFileId" TEXT,
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'PEN',
  ADD COLUMN "lessonsCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "organizationId" TEXT,
  ADD COLUMN "priceCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "totalDurationMin" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "enrollments"
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'PEN',
  ADD COLUMN "organizationId" TEXT,
  ADD COLUMN "priceCents" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "lessons" ADD COLUMN "videoFileId" TEXT;
ALTER TABLE "submissions" ADD COLUMN "attachmentFileId" TEXT;
ALTER TABLE "tickets" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "users"
  ADD COLUMN "avatarFileId" TEXT,
  ADD COLUMN "platformRole" "PlatformRole" NOT NULL DEFAULT 'USER';

-- =============================================================================
-- Backfill
-- =============================================================================

-- 1. Organización por defecto: todo el contenido existente pasa a pertenecer a ella.
--    Renombrar luego con `pnpm org:update` o desde SQL (slug/nombre).
INSERT INTO "organizations" ("id", "slug", "name", "status", "createdAt", "updatedAt")
VALUES ('org_default', 'certifox', 'Certifox', 'ACTIVE', NOW(), NOW());

UPDATE "courses" SET "organizationId" = 'org_default';
UPDATE "courses" c SET
  "lessonsCount" = s.cnt,
  "totalDurationMin" = s.dur
FROM (
  SELECT m."courseId", COUNT(l."id")::int AS cnt, COALESCE(SUM(l."durationMin"), 0)::int AS dur
  FROM "modules" m JOIN "lessons" l ON l."moduleId" = m."id"
  GROUP BY m."courseId"
) s
WHERE s."courseId" = c."id";

UPDATE "enrollments" e SET "organizationId" = c."organizationId"
FROM "courses" c WHERE c."id" = e."courseId";

-- 2. Membresías: instructores e inscritos actuales.
INSERT INTO "memberships" ("id", "role", "createdAt", "updatedAt", "organizationId", "userId")
SELECT 'mem_' || md5(u."id" || 'org_default'), 'INSTRUCTOR', NOW(), NOW(), 'org_default', u."id"
FROM "users" u WHERE u."role" = 'INSTRUCTOR';

INSERT INTO "memberships" ("id", "role", "createdAt", "updatedAt", "organizationId", "userId")
SELECT DISTINCT 'mem_' || md5(e."userId" || 'org_default'), 'STUDENT'::"OrgRole", NOW(), NOW(), 'org_default', e."userId"
FROM "enrollments" e
WHERE NOT EXISTS (
  SELECT 1 FROM "memberships" m WHERE m."userId" = e."userId" AND m."organizationId" = 'org_default'
);

-- 3. Archivos en R2: las URLs del dominio de medios se convierten en filas de "files".
--    Rutas locales (/images/...) se descartan y la UI usa la imagen por defecto.
INSERT INTO "files" ("id", "kind", "visibility", "status", "bucket", "key", "contentType", "sizeBytes", "createdAt", "updatedAt", "organizationId", "uploadedById")
SELECT 'file_' || md5('cover' || c."id"), 'COURSE_COVER', 'PUBLIC', 'READY', 'certifox-media',
       substring(c."coverUrl" from '^https?://[^/]+/(covers/.+)$'),
       CASE
         WHEN c."coverUrl" ILIKE '%.png' THEN 'image/png'
         WHEN c."coverUrl" ILIKE '%.webp' THEN 'image/webp'
         ELSE 'image/jpeg'
       END,
       0, NOW(), NOW(), c."organizationId", c."instructorId"
FROM "courses" c
WHERE c."coverUrl" ~ '^https?://[^/]+/covers/.+$';

UPDATE "courses" c SET "coverFileId" = f."id"
FROM "files" f WHERE f."id" = 'file_' || md5('cover' || c."id");

INSERT INTO "files" ("id", "kind", "visibility", "status", "bucket", "key", "contentType", "sizeBytes", "createdAt", "updatedAt", "uploadedById")
SELECT 'file_' || md5('avatar' || u."id"), 'USER_AVATAR', 'PUBLIC', 'READY', 'certifox-media',
       substring(u."avatarUrl" from '^https?://[^/]+/(avatars/.+)$'),
       CASE
         WHEN u."avatarUrl" ILIKE '%.png' THEN 'image/png'
         WHEN u."avatarUrl" ILIKE '%.webp' THEN 'image/webp'
         ELSE 'image/jpeg'
       END,
       0, NOW(), NOW(), u."id"
FROM "users" u
WHERE u."avatarUrl" ~ '^https?://[^/]+/avatars/.+$';

UPDATE "users" u SET "avatarFileId" = f."id"
FROM "files" f WHERE f."id" = 'file_' || md5('avatar' || u."id");

-- Avatares externos (OAuth u otros) se conservan en el campo estándar "image".
UPDATE "users" SET "image" = "avatarUrl"
WHERE "image" IS NULL AND "avatarFileId" IS NULL AND "avatarUrl" ~ '^https://';

-- 4. Certificados: tenant + snapshot inmutable de lo certificado.
UPDATE "certificates" ce SET
  "organizationId" = e."organizationId",
  "holderName" = u."name",
  "courseTitle" = c."title",
  "hours" = c."hours",
  "finalScore" = (
    SELECT MAX(s."score") FROM "submissions" s
    WHERE s."enrollmentId" = e."id" AND s."status" = 'APPROVED'
  )
FROM "enrollments" e
JOIN "users" u ON u."id" = e."userId"
JOIN "courses" c ON c."id" = e."courseId"
WHERE e."id" = ce."enrollmentId";

-- 5. Auditoría: tenant y targetId siempre como id interno.
UPDATE "audit_logs" a SET "targetId" = ce."id", "organizationId" = ce."organizationId"
FROM "certificates" ce
WHERE a."targetType" = 'Certificate' AND a."targetId" = ce."code";

UPDATE "audit_logs" a SET "organizationId" = e."organizationId"
FROM "enrollments" e
WHERE a."targetType" = 'Enrollment' AND a."targetId" = e."id";

UPDATE "audit_logs" a SET "organizationId" = c."organizationId"
FROM "courses" c
WHERE a."targetType" = 'Course' AND a."targetId" = c."id";

-- 6. Una sola entrega por (matrícula, evaluación): se conserva la más reciente.
DELETE FROM "submissions" s
USING "submissions" newer
WHERE s."enrollmentId" = newer."enrollmentId"
  AND s."assessmentId" = newer."assessmentId"
  AND (s."submittedAt" < newer."submittedAt" OR (s."submittedAt" = newer."submittedAt" AND s."id" < newer."id"));

-- =============================================================================
-- Restricciones finales y columnas obsoletas
-- =============================================================================
ALTER TABLE "courses" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "enrollments" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "certificates"
  ALTER COLUMN "organizationId" SET NOT NULL,
  ALTER COLUMN "holderName" SET NOT NULL,
  ALTER COLUMN "courseTitle" SET NOT NULL,
  ALTER COLUMN "hours" SET NOT NULL;

ALTER TABLE "courses" DROP COLUMN "coverUrl";
ALTER TABLE "users" DROP COLUMN "avatarUrl", DROP COLUMN "role";
DROP TYPE "Role";

-- Índices
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");
CREATE UNIQUE INDEX "organizations_customDomain_key" ON "organizations"("customDomain");
CREATE UNIQUE INDEX "organizations_logoFileId_key" ON "organizations"("logoFileId");
CREATE INDEX "memberships_userId_idx" ON "memberships"("userId");
CREATE INDEX "memberships_organizationId_role_idx" ON "memberships"("organizationId", "role");
CREATE UNIQUE INDEX "memberships_organizationId_userId_key" ON "memberships"("organizationId", "userId");
CREATE UNIQUE INDEX "files_key_key" ON "files"("key");
CREATE INDEX "files_organizationId_kind_idx" ON "files"("organizationId", "kind");
CREATE INDEX "files_status_createdAt_idx" ON "files"("status", "createdAt");
CREATE INDEX "files_uploadedById_idx" ON "files"("uploadedById");
CREATE INDEX "lesson_resources_lessonId_order_idx" ON "lesson_resources"("lessonId", "order");
CREATE INDEX "lesson_resources_fileId_idx" ON "lesson_resources"("fileId");
CREATE INDEX "outbox_events_status_availableAt_idx" ON "outbox_events"("status", "availableAt");
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");
CREATE INDEX "accounts_providerId_accountId_idx" ON "accounts"("providerId", "accountId");
CREATE INDEX "assessments_courseId_idx" ON "assessments"("courseId");
CREATE INDEX "audit_logs_targetType_targetId_idx" ON "audit_logs"("targetType", "targetId");
CREATE INDEX "audit_logs_actorId_createdAt_idx" ON "audit_logs"("actorId", "createdAt");
CREATE INDEX "audit_logs_organizationId_createdAt_idx" ON "audit_logs"("organizationId", "createdAt");
CREATE UNIQUE INDEX "certificates_pdfFileId_key" ON "certificates"("pdfFileId");
CREATE INDEX "certificates_organizationId_issuedAt_idx" ON "certificates"("organizationId", "issuedAt");
CREATE INDEX "certificates_organizationId_status_idx" ON "certificates"("organizationId", "status");
CREATE UNIQUE INDEX "courses_coverFileId_key" ON "courses"("coverFileId");
CREATE INDEX "courses_organizationId_published_createdAt_idx" ON "courses"("organizationId", "published", "createdAt");
CREATE INDEX "courses_organizationId_category_idx" ON "courses"("organizationId", "category");
CREATE INDEX "courses_instructorId_idx" ON "courses"("instructorId");
CREATE INDEX "enrollments_courseId_status_idx" ON "enrollments"("courseId", "status");
CREATE INDEX "enrollments_organizationId_status_createdAt_idx" ON "enrollments"("organizationId", "status", "createdAt");
CREATE INDEX "enrollments_userId_createdAt_idx" ON "enrollments"("userId", "createdAt");
CREATE INDEX "lesson_progress_lessonId_idx" ON "lesson_progress"("lessonId");
CREATE UNIQUE INDEX "lessons_videoFileId_key" ON "lessons"("videoFileId");
CREATE INDEX "lessons_moduleId_order_idx" ON "lessons"("moduleId", "order");
CREATE INDEX "modules_courseId_order_idx" ON "modules"("courseId", "order");
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");
CREATE UNIQUE INDEX "submissions_attachmentFileId_key" ON "submissions"("attachmentFileId");
CREATE INDEX "submissions_assessmentId_status_idx" ON "submissions"("assessmentId", "status");
CREATE UNIQUE INDEX "submissions_enrollmentId_assessmentId_key" ON "submissions"("enrollmentId", "assessmentId");
CREATE INDEX "tickets_userId_createdAt_idx" ON "tickets"("userId", "createdAt");
CREATE INDEX "tickets_organizationId_status_createdAt_idx" ON "tickets"("organizationId", "status", "createdAt");
CREATE UNIQUE INDEX "users_avatarFileId_key" ON "users"("avatarFileId");
CREATE INDEX "verifications_identifier_idx" ON "verifications"("identifier");

-- Claves foráneas
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_logoFileId_fkey" FOREIGN KEY ("logoFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_avatarFileId_fkey" FOREIGN KEY ("avatarFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "files" ADD CONSTRAINT "files_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "files" ADD CONSTRAINT "files_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "courses" ADD CONSTRAINT "courses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "courses" ADD CONSTRAINT "courses_coverFileId_fkey" FOREIGN KEY ("coverFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_videoFileId_fkey" FOREIGN KEY ("videoFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lesson_resources" ADD CONSTRAINT "lesson_resources_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lesson_resources" ADD CONSTRAINT "lesson_resources_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_attachmentFileId_fkey" FOREIGN KEY ("attachmentFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_pdfFileId_fkey" FOREIGN KEY ("pdfFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
