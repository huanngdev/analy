import js from "@eslint/js";
import json from "@eslint/json";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

export const bun = defineConfig([
  globalIgnores(["**/migrations/meta/**"]),
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.jsonc"],
    plugins: { json },
    language: "json/jsonc",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.json5"],
    plugins: { json },
    language: "json/json5",
    extends: ["json/recommended"],
  },
  prettierRecommended,
]);
