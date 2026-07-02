import { defineConfig, transformerDirectives, transformerVariantGroup } from "unocss";

import { presetUnoUI } from "./src/uno";

export default defineConfig({
  presets: [presetUnoUI()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  content: {
    pipeline: {
      include: [/\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|css|php|phtml|marko|html)($|\?)/, "src/**/*.{js,ts}"],
      exclude: ["uno.config.ts"],
    },
  },
});
