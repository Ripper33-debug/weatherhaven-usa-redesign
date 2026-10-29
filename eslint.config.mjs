import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The deployment globe is a self-contained page with its own (minified) libraries.
    "public/deployment-globe/**",
    // Reference copies from the globe package, not part of the build.
    "docs/**",
  ]),
]);

export default eslintConfig;
