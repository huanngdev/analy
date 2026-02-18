/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
import { config as base } from "./index.js";

/** @type {import('prettier').Config} */
export const config = {
  ...base,
  plugins: [import("prettier-plugin-tailwindcss")],
};

export default config;
