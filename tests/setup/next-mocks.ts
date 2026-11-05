import { vi } from "vitest";

// Fuera de Next no existe la caché incremental ni el ciclo de request:
// unstable_cache ejecuta la función, revalidate* y after() son no-ops controlados.
vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
}));

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return { ...actual, after: vi.fn() };
});
