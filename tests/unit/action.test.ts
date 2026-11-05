import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const ctx = {
  requestId: "req-1",
  ip: "9.9.9.9",
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), child: vi.fn() },
  user: { id: "u1", email: "u@test.pe", name: "U", image: null, platformRole: "USER" },
  organization: null,
  role: null,
  memberships: [],
};

vi.mock("@/server/core/request-context", () => ({ getRequestContext: vi.fn(async () => ctx) }));

const { runAction } = await import("@/server/core/action");
const { notFound } = await import("@/server/core/errors");
const { resetMemoryKv } = await import("@/server/core/kv");
const { getRequestContext } = await import("@/server/core/request-context");

const schema = z.object({ n: z.number().min(1, "n debe ser ≥ 1") });

describe("runAction (pipeline uniforme de Server Actions)", () => {
  beforeEach(() => resetMemoryKv());

  it("valida con zod antes de tocar nada", async () => {
    const handler = vi.fn();
    const res = await runAction({ name: "t", schema, handler }, { n: 0 });
    expect(res).toEqual({ success: false, code: "VALIDATION", error: "n debe ser ≥ 1" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("devuelve el resultado del handler", async () => {
    const res = await runAction({ name: "t", schema, handler: async (_c, i) => i.n * 2 }, { n: 2 });
    expect(res).toEqual({ success: true, data: 4 });
  });

  it("DomainError → mensaje al usuario; error inesperado → mensaje genérico + requestId (S6)", async () => {
    const domain = await runAction({ name: "t", schema, handler: async () => { throw notFound("No existe"); } }, { n: 1 });
    expect(domain).toEqual({ success: false, code: "NOT_FOUND", error: "No existe" });

    const internal = await runAction(
      { name: "t", schema, handler: async () => { throw new Error('relation "users" violates constraint'); } },
      { n: 1 }
    );
    expect(internal).toMatchObject({ success: false, code: "INTERNAL", requestId: "req-1" });
    expect(JSON.stringify(internal)).not.toContain("users");
  });

  it("exige sesión salvo en acciones públicas", async () => {
    vi.mocked(getRequestContext).mockResolvedValueOnce({ ...ctx, user: null } as never);
    const res = await runAction({ name: "t", schema, handler: async () => 1 }, { n: 1 });
    expect(res).toMatchObject({ success: false, code: "UNAUTHENTICATED" });
  });

  it("aplica rate limit por usuario", async () => {
    const opts = { name: "t", schema, rateLimit: { name: "t", rule: { window: 60, max: 2 } }, handler: async () => 1 };
    expect((await runAction(opts, { n: 1 })).success).toBe(true);
    expect((await runAction(opts, { n: 1 })).success).toBe(true);
    expect(await runAction(opts, { n: 1 })).toMatchObject({ success: false, code: "RATE_LIMITED" });
  });
});
