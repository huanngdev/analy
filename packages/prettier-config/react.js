import tailwindPlugin from 'prettier-plugin-tailwindcss'
import { config as base } from './index.js'

/** @type {import('prettier').Config} */
export const config = {
  ...base,
  plugins: [tailwindPlugin],
}

export default config
