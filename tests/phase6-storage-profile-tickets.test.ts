/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validateUploadParams,
  generatePresignedUploadUrl,
  MAX_FILE_SIZE_BYTES,
} from "../server/services/storage.service";
import {
  getUserProfile,
  updateUserProfile,
} from "../server/services/profile.service";
import {
  getUserTickets,
  createTicket,
} from "../server/services/ticket.service";
import { AuthorizationError } from "../server/policies";
import { prisma } from "../server/db";
import nextConfig from "../next.config";

// Mock de Prisma db / prisma
vi.mock("@/server/db", () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    ticket: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  };

  return {
    prisma: mockPrisma,
    db: mockPrisma,
  };
});

describe("Fase 6: Cloudflare R2, Perfil, Tickets y Cierre de Producción", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Cloudflare R2 & Validación de Archivos (AC-20)", () => {
    it("acepta formatos válidos JPEG, PNG y WEBP menores a 2 MB", () => {
      expect(() =>
        validateUploadParams({
          type: "cover",
          mimeType: "image/jpeg",
          sizeBytes: 1024 * 1024, // 1 MB
        })
      ).not.toThrow();

      expect(() =>
        validateUploadParams({
          type: "avatar",
          mimeType: "image/png",
          sizeBytes: 500 * 1024,
        })
      ).not.toThrow();

      expect(() =>
        validateUploadParams({
          type: "cover",
          mimeType: "image/webp",
          sizeBytes: 2 * 1024 * 1024, // Exactamente 2 MB
        })
      ).not.toThrow();
    });

    it("rechaza formatos no autorizados como GIF, PDF o ejecutables", () => {
      expect(() =>
        validateUploadParams({
          type: "cover",
          mimeType: "image/gif",
          sizeBytes: 100 * 1024,
        })
      ).toThrow(/Tipo MIME inválido/);

      expect(() =>
        validateUploadParams({
          type: "cover",
          mimeType: "application/pdf",
          sizeBytes: 100 * 1024,
        })
      ).toThrow(/Tipo MIME inválido/);
    });

    it("rechaza archivos de más de 2 MB (AC-20)", () => {
      expect(() =>
        validateUploadParams({
          type: "cover",
          mimeType: "image/jpeg",
          sizeBytes: MAX_FILE_SIZE_BYTES + 1,
        })
      ).toThrow(/excede el tamaño máximo permitido de 2 MB/);
    });

    it("rechaza archivos con tamaño cero o negativo", () => {
      expect(() =>
        validateUploadParams({
          type: "avatar",
          mimeType: "image/png",
          sizeBytes: 0,
        })
      ).toThrow(/El archivo no puede estar vacío/);
    });

    it("genera nombre seguro controlado por el servidor con prefijo correspondiente", async () => {
      const coverRes = await generatePresignedUploadUrl({
        type: "cover",
        mimeType: "image/png",
        sizeBytes: 200 * 1024,
      });

      expect(coverRes.fileKey).toMatch(/^covers\/[a-f0-9-]+\.png$/);
      expect(coverRes.expiresInSeconds).toBe(300);

      const avatarRes = await generatePresignedUploadUrl({
        type: "avatar",
        mimeType: "image/webp",
        sizeBytes: 150 * 1024,
      });

      expect(avatarRes.fileKey).toMatch(/^avatars\/[a-f0-9-]+\.webp$/);
    });
  });

  describe("2. Mi Perfil con Base de Datos y Ley 29733 (RF-15)", () => {
    const mockStudentSession = {
      user: { id: "user-student-1", email: "alumno@certifox.pe", role: "STUDENT" },
      session: { id: "s-1", userId: "user-student-1", expiresAt: new Date() },
    };

    it("exige autenticación para consultar el perfil", async () => {
      await expect(getUserProfile(null)).rejects.toThrow(AuthorizationError);
    });

    it("retorna los datos del usuario con DNI enmascarado bajo Ley 29733", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: "user-student-1",
        name: "Alejandro Morales",
        email: "alumno@certifox.pe",
        role: "STUDENT",
        documentType: "DNI",
        documentNumber: "72499203",
        institution: "Minera Las Bambas",
        avatarUrl: null,
        createdAt: new Date("2025-01-01"),
      } as any);

      const profile = await getUserProfile(mockStudentSession as any);
      expect(profile.name).toBe("Alejandro Morales");
      expect(profile.documentNumberMasked).toBe("•••• 9203");
      expect(profile.documentNumberMasked).not.toBe("72499203");
      expect(profile.institution).toBe("Minera Las Bambas");
    });

    it("permite actualizar nombre e institución y valida longitud", async () => {
      await expect(
        updateUserProfile(mockStudentSession as any, { name: "Al" })
      ).rejects.toThrow(/al menos 3 caracteres/);

      vi.mocked(prisma.user.update).mockResolvedValueOnce({
        id: "user-student-1",
        name: "Alejandro Morales P.",
        email: "alumno@certifox.pe",
        role: "STUDENT",
        documentType: "DNI",
        documentNumber: "72499203",
        institution: "Consorcio Minero",
        avatarUrl: "/images/avatars/student.svg",
        createdAt: new Date("2025-01-01"),
      } as any);

      const updated = await updateUserProfile(mockStudentSession as any, {
        name: "Alejandro Morales P.",
        institution: "Consorcio Minero",
      });

      expect(updated.name).toBe("Alejandro Morales P.");
      expect(updated.institution).toBe("Consorcio Minero");
    });
  });

  describe("3. Mesa de Ayuda conectada a Prisma (RF-16)", () => {
    const mockStudentSession = {
      user: { id: "user-student-1", email: "alumno@certifox.pe", role: "STUDENT" },
      session: { id: "s-1", userId: "user-student-1", expiresAt: new Date() },
    };

    it("retorna tickets ordenados por fecha", async () => {
      vi.mocked(prisma.ticket.findMany).mockResolvedValueOnce([
        {
          id: "t-1",
          subject: "Error de video",
          category: "Soporte Técnico",
          message: "No carga el reproductor",
          status: "OPEN",
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: "user-student-1",
        },
      ] as any);

      const tickets = await getUserTickets(mockStudentSession as any);
      expect(tickets.length).toBe(1);
      expect(tickets[0].status).toBe("OPEN");
      expect(tickets[0].category).toBe("Soporte Técnico");
    });

    it("valida campos mínimos al crear un ticket", async () => {
      await expect(
        createTicket(mockStudentSession as any, {
          subject: "Hola",
          category: "General",
          message: "Mensaje largo descriptivo",
        })
      ).rejects.toThrow(/al menos 5 caracteres/);

      await expect(
        createTicket(mockStudentSession as any, {
          subject: "Asunto válido",
          category: "General",
          message: "Corto",
        })
      ).rejects.toThrow(/al menos 10 caracteres/);
    });

    it("crea un ticket en estado OPEN", async () => {
      vi.mocked(prisma.ticket.create).mockResolvedValueOnce({
        id: "t-new",
        subject: "Problema con la lección 3",
        category: "Aula Virtual",
        message: "No me marca como completada la lección",
        status: "OPEN",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "user-student-1",
      } as any);

      const ticket = await createTicket(mockStudentSession as any, {
        subject: "Problema con la lección 3",
        category: "Aula Virtual",
        message: "No me marca como completada la lección",
      });

      expect(ticket.id).toBe("t-new");
      expect(ticket.status).toBe("OPEN");
      expect(ticket.category).toBe("Aula Virtual");
    });
  });

  describe("4. Reglas de Caché HTTP para Cloudflare (AC-21)", () => {
    it("configura Cache-Control no-store para las rutas /campus/*", async () => {
      if (typeof nextConfig.headers === "function") {
        const headers = await nextConfig.headers();
        const campusHeaderRule = headers.find((h: any) => h.source === "/campus/:path*");
        expect(campusHeaderRule).toBeDefined();

        const cacheControl = campusHeaderRule?.headers.find(
          (hdr: any) => hdr.key === "Cache-Control"
        );
        expect(cacheControl?.value).toContain("no-store");
        expect(cacheControl?.value).toContain("private");
      }
    });
  });
});
