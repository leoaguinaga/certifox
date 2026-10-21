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
  ]),
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
