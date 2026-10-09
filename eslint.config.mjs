import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The graph, import, and Prisma JSON surfaces are intentionally dynamic today.
      // Keep the release lint gate focused on actionable correctness issues while
      // typed domain contracts are tightened incrementally.
      "@typescript-eslint/no-explicit-any": "off",
      // Existing client-only mount/theme effects are used to avoid hydration drift.
      // Revisit these when upgrading the React lint profile, but do not block release.
      "react-hooks/set-state-in-effect": "off",
      // Current image previews use data URLs and cropped client-side uploads.
      "@next/next/no-img-element": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
