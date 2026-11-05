import { describe, expect, it } from "vitest";
import { resolveDirectDatabaseUrl, toDirectDatabaseUrl } from "@/lib/database-url";

describe("toDirectDatabaseUrl", () => {
  it("quita el sufijo -pooler de un endpoint de Neon", () => {
    expect(
      toDirectDatabaseUrl(
        "postgresql://u:p@ep-cool-darkness-123456-pooler.us-east-2.aws.neon.tech/certifox?sslmode=require"
      )
    ).toBe("postgresql://u:p@ep-cool-darkness-123456.us-east-2.aws.neon.tech/certifox?sslmode=require");
  });

  it("elimina pgbouncer=true y conserva el resto de parámetros", () => {
    expect(
      toDirectDatabaseUrl(
        "postgresql://u:p@ep-x-pooler.eu-central-1.aws.neon.tech/db?sslmode=require&pgbouncer=true&channel_binding=require"
      )
    ).toBe("postgresql://u:p@ep-x.eu-central-1.aws.neon.tech/db?sslmode=require&channel_binding=require");
  });

  it("no toca URLs que ya son directas o no son de Neon", () => {
    const local = "postgresql://postgres:postgres@localhost:5432/certifox";
    expect(toDirectDatabaseUrl(local)).toBe(local);
    const direct = "postgresql://u:p@ep-x.us-east-1.aws.neon.tech/db?sslmode=require";
    expect(toDirectDatabaseUrl(direct)).toBe(direct);
  });

  it("devuelve la entrada intacta si no es una URL válida", () => {
    expect(toDirectDatabaseUrl("not a url")).toBe("not a url");
  });
});

describe("resolveDirectDatabaseUrl", () => {
  it("prioriza DIRECT_URL como override opcional", () => {
    expect(
      resolveDirectDatabaseUrl({ DATABASE_URL: "postgresql://a@ep-x-pooler.r.aws.neon.tech/db", DIRECT_URL: "postgresql://b@h/db" })
    ).toBe("postgresql://b@h/db");
  });

  it("deriva desde DATABASE_URL cuando no hay DIRECT_URL", () => {
    expect(resolveDirectDatabaseUrl({ DATABASE_URL: "postgresql://a@ep-x-pooler.r.aws.neon.tech/db" })).toBe(
      "postgresql://a@ep-x.r.aws.neon.tech/db"
    );
  });

  it("devuelve undefined sin DATABASE_URL", () => {
    expect(resolveDirectDatabaseUrl({})).toBeUndefined();
  });
});
