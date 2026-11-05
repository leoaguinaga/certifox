import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "mockups/**",
  ]),
  // ---------------------------------------------------------------------------
  // Fronteras del monolito modular (docs/backend-architecture.md §3.1)
  // ---------------------------------------------------------------------------
  {
    // Transporte (páginas, route handlers, actions): solo casos de uso de server/modules
    // e infraestructura de request; nunca acceso directo a datos ni a almacenamiento.
    files: ["app/**/*.{ts,tsx}", "features/**/actions.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "@prisma/client", message: "Usa los servicios de server/modules; la capa de transporte no accede a datos." },
            { name: "@/server/core/db", message: "Usa los servicios de server/modules; la capa de transporte no accede a datos." },
            { name: "@/server/core/outbox", message: "Encola eventos desde los casos de uso (server/modules)." },
          ],
        },
      ],
    },
  },
  {
    // La infraestructura no conoce el dominio.
    files: ["server/core/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["@/server/modules/*", "@/features/*", "@/app/*"], message: "server/core no depende de módulos de dominio ni de la UI." }] },
      ],
    },
  },
  {
    // El dominio no depende de la capa de transporte ni de componentes.
    files: ["server/modules/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/features/*/actions", "@/features/*/components/*", "@/components/*"],
              message: "server/modules solo puede importar tipos de features/*/types.",
            },
          ],
        },
      ],
    },
  },
  {
    // Regla AC-03 / A2: Prohibir importar server/ desde componentes y contextos cliente
    files: [
      "components/**/*.{ts,tsx}",
      "features/**/components/**/*.{ts,tsx}",
      "features/**/context/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server", "@/server/*", "**/server/**"],
              message:
                "Regla A2 / AC-03: Los componentes cliente no pueden importar código de server/. Toda mutación debe pasar por Server Actions.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
