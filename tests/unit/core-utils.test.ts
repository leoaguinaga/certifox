import { describe, expect, it } from "vitest";
import { consume } from "@/server/core/rate-limit";
import { resetMemoryKv } from "@/server/core/kv";
import { pageArgs, toPage } from "@/server/core/pagination";
import { backoffSeconds } from "@/server/core/outbox";
import { clientIp, pickActiveMembership, tenantSlugFromHost } from "@/server/core/request-context";
import { buildObjectKey, validateUpload } from "@/server/modules/files/files.service";
import { buildPaymentInstructions, parsePaymentSettings } from "@/server/modules/organization/payment-settings";
import { maskDocumentNumber } from "@/lib/masking";
import { formatPrice } from "@/lib/utils";

describe("rate limit (ventana fija, fallback en memoria)", () => {
  it("permite hasta max y luego informa retryAfter", async () => {
    resetMemoryKv();
    const rule = { window: 60, max: 3 };
    for (let i = 0; i < 3; i++) expect((await consume("k", rule)).allowed).toBe(true);
    const blocked = await consume("k", rule);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
    expect((await consume("otra", rule)).allowed).toBe(true);
  });
});

describe("paginación por cursor", () => {
  it("pide limit+1 y calcula nextCursor", () => {
    expect(pageArgs({ limit: 2, cursor: "abc" })).toEqual({ take: 3, cursor: { id: "abc" }, skip: 1, limit: 2 });
    const rows = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(toPage(rows, 2)).toEqual({ items: [{ id: "a" }, { id: "b" }], nextCursor: "b" });
    expect(toPage(rows.slice(0, 2), 2).nextCursor).toBeNull();
  });

  it("acota el tamaño de página", () => {
    expect(() => pageArgs({ limit: 10_000 })).toThrow();
  });
});

describe("outbox", () => {
  it("backoff exponencial con tope de 1h", () => {
    expect(backoffSeconds(1)).toBe(30);
    expect(backoffSeconds(2)).toBe(60);
    expect(backoffSeconds(20)).toBe(3600);
  });
});

describe("tenancy y request", () => {
  it("resuelve el slug del subdominio", () => {
    expect(tenantSlugFromHost("acme.certifox.pe", "certifox.pe")).toBe("acme");
    expect(tenantSlugFromHost("acme.certifox.pe:3000", "certifox.pe")).toBe("acme");
    expect(tenantSlugFromHost("certifox.pe", "certifox.pe")).toBeNull();
    expect(tenantSlugFromHost("www.certifox.pe", "certifox.pe")).toBeNull();
    expect(tenantSlugFromHost("a.b.certifox.pe", "certifox.pe")).toBeNull();
    expect(tenantSlugFromHost("evil.com", "certifox.pe")).toBeNull();
  });

  it("elige la organización activa: cookie válida > host > staff > primera", () => {
    const m = (id: string, slug: string, role: "STUDENT" | "INSTRUCTOR") => ({ organization: { id, slug, name: id }, role });
    const list = [m("o1", "uno", "STUDENT"), m("o2", "dos", "INSTRUCTOR"), m("o3", "tres", "STUDENT")];
    expect(pickActiveMembership(list, "o3", "uno")?.organization.id).toBe("o3");
    expect(pickActiveMembership(list, "ajena", "uno")?.organization.id).toBe("o1");
    expect(pickActiveMembership(list, undefined, null)?.organization.id).toBe("o2");
    expect(pickActiveMembership([], undefined, null)).toBeNull();
  });

  it("IP real detrás de Cloudflare", () => {
    expect(clientIp(new Headers({ "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "2.2.2.2" }))).toBe("1.1.1.1");
    expect(clientIp(new Headers({ "x-forwarded-for": "3.3.3.3, 10.0.0.1" }))).toBe("3.3.3.3");
  });
});

describe("archivos en R2", () => {
  it("valida tipo y tamaño por uso", () => {
    expect(() => validateUpload("COURSE_COVER", "image/gif", 100)).toThrow(/Formato/);
    expect(() => validateUpload("COURSE_COVER", "image/png", 3 * 1024 * 1024)).toThrow(/tamaño/);
    expect(() => validateUpload("CERTIFICATE_PDF", "application/pdf", 100)).toThrow(/sistema/);
    expect(validateUpload("SUBMISSION_ATTACHMENT", "application/pdf", 1024).visibility).toBe("PRIVATE");
  });

  it("genera claves no adivinables y con alcance por tenant", () => {
    const key = buildObjectKey("COURSE_COVER", "image/webp", { organizationId: "org1", userId: "u1" });
    expect(key).toMatch(/^org\/org1\/covers\/[0-9a-f-]{36}\.webp$/);
    expect(buildObjectKey("USER_AVATAR", "image/png", { organizationId: null, userId: "u1" })).toMatch(/^user\/u1\/avatars\//);
  });
});

describe("datos de pago por organización", () => {
  it("ignora configuraciones inválidas y arma instrucciones", () => {
    expect(parsePaymentSettings({ whatsapp: "abc" })).toEqual({ bankAccounts: [] });
    const settings = parsePaymentSettings({ whatsapp: "51999999999", bankAccounts: [] });
    const ins = buildPaymentInstructions({
      organizationName: "Org",
      settings,
      priceCents: 68000,
      currency: "PEN",
      courseTitle: "Curso",
      studentName: "Ana",
    });
    expect(ins.amount).toBe(680);
    expect(ins.whatsappUrl).toMatch(/^https:\/\/wa\.me\/51999999999\?text=/);
  });
});

describe("presentación", () => {
  it("enmascara documentos (Ley 29733)", () => {
    expect(maskDocumentNumber("72499203")).toBe("•••• 9203");
    expect(maskDocumentNumber(null)).toBe("No registrado");
  });
  it("formatea precios", () => {
    expect(formatPrice(0, "PEN")).toBe("Gratuito");
    expect(formatPrice(680, "PEN")).toMatch(/680/);
  });
});
