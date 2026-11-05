import { defineConfig } from "vitest/config";
import path from "path";

const alias = {
  "server-only": path.resolve(import.meta.dirname, "./tests/mocks/server-only.ts"),
  "@": path.resolve(import.meta.dirname, "./"),
};

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          include: ["tests/unit/**/*.test.ts"],
          alias,
          setupFiles: ["tests/setup/next-mocks.ts"],
        },
      },
      {
        // Contra PostgreSQL real: TEST_DATABASE_URL (en CI lo provee un servicio postgres).
        test: {
          name: "integration",
          environment: "node",
          include: ["tests/integration/**/*.test.ts"],
          alias,
          setupFiles: ["tests/setup/next-mocks.ts", "tests/setup/integration-env.ts"],
          globalSetup: ["tests/setup/integration-global.ts"],
          fileParallelism: false,
          testTimeout: 30_000,
          hookTimeout: 60_000,
        },
      },
    ],
  },
});
