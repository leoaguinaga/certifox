import { describe, it, expect, vi } from "vitest";
import {
  maskDocumentNumber,
  getPublicCertificateByCode,
} from "../server/services/certificate.service";
import { db } from "../server/db";

// Mock de Prisma db para pruebas unitarias del servicio
vi.mock("@/server/db", () => {
  return {
    db: {
      certificate: {
        findUnique: vi.fn(),
      },
    },
  };
});

describe("Servicio de Certificados Públicos (server/services/certificate.service.ts)", () => {
  it("maskDocumentNumber enmascara los primeros dígitos y preserva los últimos 4", () => {
    expect(maskDocumentNumber("72499203")).toBe("•••• 9203");
    expect(maskDocumentNumber("1234")).toBe("•••• 1234");
    expect(maskDocumentNumber("")).toBe("•••• 0000");
    expect(maskDocumentNumber(null)).toBe("•••• 0000");
  });

  it("AC-04: Certificado VÁLIDO muestra titular enmascarado, curso, fechas, SHA-256 y etiqueta Válido", async () => {
    const mockDbCert = {
      id: "cert-1",
      code: "CFX-2025-9831",
      sha256: "8a9fe409b3628e811c0f0f49c01742de8b7c4270f92275ba2c4b8e2cb927c24e",
      status: "VALID",
      issuedAt: new Date("2026-10-14T18:42:00Z"),
      expiresAt: new Date("2028-10-14T18:42:00Z"), // Vigente en el futuro
      revokedAt: null,
      revocationReason: null,
      enrollment: {
        user: {
          name: "Alejandro Morales Peñaloza",
          documentNumber: "72499203",
          institution: "Minera Las Bambas",
        },
        course: {
          title: "Seguridad Operativa en Maquinaria Pesada",
          slug: "seguridad-operativa-maquinaria-pesada",
          summary: "Protocolos integrales de mitigación de fatalidades.",
          hours: 48,
          instructor: {
            name: "Ing. Marco Viteri Valdivia",
          },
        },
        submissions: [{ score: 19.4 }],
      },
    };

    vi.mocked(db.certificate.findUnique).mockResolvedValueOnce(
      mockDbCert as unknown as Awaited<ReturnType<typeof db.certificate.findUnique>>
    );

    const result = await getPublicCertificateByCode("CFX-2025-9831");

    expect(result).not.toBeNull();
    expect(result?.code).toBe("CFX-2025-9831");
    expect(result?.status).toBe("valido");
    expect(result?.statusLabel).toContain("Válido y Vigente");
    expect(result?.student.documentMasked).toBe("•••• 9203");
    expect(result?.cryptography.sha256).toBe(mockDbCert.sha256);
    expect(result?.course.title).toBe("Seguridad Operativa en Maquinaria Pesada");
  });

  it("AC-05 / RF-23: Certificado vencido calcula estado 'expirado' al vuelo sin cron", async () => {
    const mockDbExpiredCert = {
      id: "cert-2",
      code: "CFX-2024-4412",
      sha256: "3f82d1c990b764a2e5840d210fa094d1b827e1f409581a0b368412e09841f391",
      status: "VALID", // En BD dice VALID pero expiresAt ya pasó
      issuedAt: new Date("2023-01-10T11:15:00Z"),
      expiresAt: new Date("2024-01-10T11:15:00Z"), // Vencido hace más de 2 años
      revokedAt: null,
      revocationReason: null,
      enrollment: {
        user: { name: "Lucía Fernández", documentNumber: "45891204" },
        course: {
          title: "Operaciones Mineras",
          slug: "operaciones-mineras",
          summary: "Curso técnico",
          hours: 32,
          instructor: { name: "Ing. Marco Viteri" },
        },
        submissions: [],
      },
    };

    vi.mocked(db.certificate.findUnique).mockResolvedValueOnce(
      mockDbExpiredCert as unknown as Awaited<ReturnType<typeof db.certificate.findUnique>>
    );

    const result = await getPublicCertificateByCode("CFX-2024-4412");

    expect(result).not.toBeNull();
    expect(result?.status).toBe("expirado");
    expect(result?.statusLabel).toContain("Credencial Vencida");
  });

  it("AC-05: Certificado REVOCADO muestra fecha de revocación y motivo obligatorio", async () => {
    const mockDbRevokedCert = {
      id: "cert-3",
      code: "CFX-2023-1102",
      sha256: "e7c2a5d99214b60f1b218412e873400192a71f021e8432a901f4c718b209e992",
      status: "REVOKED",
      issuedAt: new Date("2022-11-12T14:20:00Z"),
      expiresAt: null,
      revokedAt: new Date("2025-01-31T09:00:00Z"),
      revocationReason: "Recertificación Anual Vencida",
      enrollment: {
        user: { name: "Alejandro Morales", documentNumber: "72499203" },
        course: {
          title: "Supervisor de Seguridad G-050",
          slug: "supervisor-seguridad-g050",
          summary: "PETAR e IPERC",
          hours: 40,
          instructor: { name: "Ing. Marco Viteri" },
        },
        submissions: [],
      },
    };

    vi.mocked(db.certificate.findUnique).mockResolvedValueOnce(
      mockDbRevokedCert as unknown as Awaited<ReturnType<typeof db.certificate.findUnique>>
    );

    const result = await getPublicCertificateByCode("CFX-2023-1102");

    expect(result).not.toBeNull();
    expect(result?.status).toBe("revocado");
    expect(result?.statusLabel).toContain("Revocada");
    expect(result?.revocationDetails?.reason).toBe("Recertificación Anual Vencida");
    expect(result?.revocationDetails?.revocationDate).toContain("2025");
  });

  it("AC-06: Código inexistente retorna null (que detona notFound 404 en la página)", async () => {
    vi.mocked(db.certificate.findUnique).mockResolvedValueOnce(null);

    const result = await getPublicCertificateByCode("CODIGO-INEXISTENTE");
    expect(result).toBeNull();
  });
});
