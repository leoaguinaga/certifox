import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    alias: {
      "server-only": path.resolve(import.meta.dirname, "./tests/mocks/server-only.ts"),
      "@": path.resolve(import.meta.dirname, "./"),
    },
  },
});
