<template>
  <section id="showcase-palette" class="scroll-mt-6 rounded-lg border border-medium bg-primary">
    <div class="border-b border-medium px-4 py-3">
      <h2 class="text-base font-bold text-primary">配色方案</h2>
      <p class="mt-1 text-xs text-tertiary">展示 UnoCSS 色系的 50-950 色阶，以及管理端语义色 token。</p>
    </div>
    <div class="overflow-x-auto p-4">
      <div class="min-w-[1080px] overflow-hidden rounded-md border border-medium">
        <div class="grid grid-cols-[104px_repeat(11,minmax(78px,1fr))] bg-secondary text-xs font-bold uppercase text-tertiary">
          <div class="border-r border-medium px-3 py-2">color / shade</div>
          <div v-for="shade in paletteShades" :key="`shade-head-${shade}`" class="border-r border-medium px-2 py-2 last:border-r-0">{{ shade }}</div>
        </div>
        <div v-for="palette in colorPalettes" :key="`palette-${palette.name}`" class="grid grid-cols-[104px_repeat(11,minmax(78px,1fr))] border-t border-medium">
          <div class="flex items-center border-r border-medium bg-secondary/60 px-3 py-3 text-sm font-bold text-secondary">{{ palette.name }}</div>
          <div v-for="swatch in palette.swatches" :key="`${palette.name}-${swatch.shade}`" class="border-r border-medium p-2 last:border-r-0">
            <div class="flex h-16 flex-col justify-between rounded border border-black/5 p-2 text-[11px] leading-none dark:border-white/10" :class="[swatch.className, getSwatchTextClass(palette.name, swatch.shade)]">
              <span class="font-bold">{{ swatch.shade }}</span>
              <span class="font-mono opacity-80">{{ swatch.className.replace('bg-', '') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="grid gap-4 border-t border-medium p-4 lg:grid-cols-3">
      <div v-for="group in semanticColorPalettes" :key="`semantic-${group.name}`" class="rounded-md border border-medium">
        <div class="border-b border-medium bg-secondary px-3 py-2 text-sm font-bold text-secondary">{{ group.name }}</div>
        <div class="grid gap-2 p-3">
          <div v-for="token in group.tokens" :key="`${group.name}-${token.name}`" class="flex items-center justify-between gap-3 rounded border border-medium bg-primary px-3 py-2 text-xs">
            <span class="font-mono text-tertiary">{{ token.className }}</span>
            <span v-if="group.name === 'background'" class="h-6 w-24 rounded border border-medium" :class="token.className"></span>
            <span v-else-if="group.name === 'text'" class="font-bold" :class="token.className">Aa</span>
            <span v-else class="h-6 w-24 rounded border-2 bg-secondary" :class="token.className"></span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type PaletteShade = (typeof paletteShades)[number]

interface ColorSwatch {
  shade: PaletteShade
  className: string
}

interface ColorPalette {
  name: string
  swatches: ColorSwatch[]
}

interface SemanticColorGroup {
  name: string
  tokens: {
    name: string
    className: string
  }[]
}

const paletteShades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const

// 色阶类名保留为完整字面量，确保 UnoCSS 构建时能扫描到每个 swatch。
const colorPaletteSources = [
  { name: 'brand', classes: ['bg-brand-50', 'bg-brand-100', 'bg-brand-200', 'bg-brand-300', 'bg-brand-400', 'bg-brand-500', 'bg-brand-600', 'bg-brand-700', 'bg-brand-800', 'bg-brand-900', 'bg-brand-950'] },
  { name: 'slate', classes: ['bg-slate-50', 'bg-slate-100', 'bg-slate-200', 'bg-slate-300', 'bg-slate-400', 'bg-slate-500', 'bg-slate-600', 'bg-slate-700', 'bg-slate-800', 'bg-slate-900', 'bg-slate-950'] },
  { name: 'gray', classes: ['bg-gray-50', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-400', 'bg-gray-500', 'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900', 'bg-gray-950'] },
  { name: 'zinc', classes: ['bg-zinc-50', 'bg-zinc-100', 'bg-zinc-200', 'bg-zinc-300', 'bg-zinc-400', 'bg-zinc-500', 'bg-zinc-600', 'bg-zinc-700', 'bg-zinc-800', 'bg-zinc-900', 'bg-zinc-950'] },
  { name: 'neutral', classes: ['bg-neutral-50', 'bg-neutral-100', 'bg-neutral-200', 'bg-neutral-300', 'bg-neutral-400', 'bg-neutral-500', 'bg-neutral-600', 'bg-neutral-700', 'bg-neutral-800', 'bg-neutral-900', 'bg-neutral-950'] },
  { name: 'stone', classes: ['bg-stone-50', 'bg-stone-100', 'bg-stone-200', 'bg-stone-300', 'bg-stone-400', 'bg-stone-500', 'bg-stone-600', 'bg-stone-700', 'bg-stone-800', 'bg-stone-900', 'bg-stone-950'] },
  { name: 'red', classes: ['bg-red-50', 'bg-red-100', 'bg-red-200', 'bg-red-300', 'bg-red-400', 'bg-red-500', 'bg-red-600', 'bg-red-700', 'bg-red-800', 'bg-red-900', 'bg-red-950'] },
  { name: 'orange', classes: ['bg-orange-50', 'bg-orange-100', 'bg-orange-200', 'bg-orange-300', 'bg-orange-400', 'bg-orange-500', 'bg-orange-600', 'bg-orange-700', 'bg-orange-800', 'bg-orange-900', 'bg-orange-950'] },
  { name: 'amber', classes: ['bg-amber-50', 'bg-amber-100', 'bg-amber-200', 'bg-amber-300', 'bg-amber-400', 'bg-amber-500', 'bg-amber-600', 'bg-amber-700', 'bg-amber-800', 'bg-amber-900', 'bg-amber-950'] },
  { name: 'yellow', classes: ['bg-yellow-50', 'bg-yellow-100', 'bg-yellow-200', 'bg-yellow-300', 'bg-yellow-400', 'bg-yellow-500', 'bg-yellow-600', 'bg-yellow-700', 'bg-yellow-800', 'bg-yellow-900', 'bg-yellow-950'] },
  { name: 'lime', classes: ['bg-lime-50', 'bg-lime-100', 'bg-lime-200', 'bg-lime-300', 'bg-lime-400', 'bg-lime-500', 'bg-lime-600', 'bg-lime-700', 'bg-lime-800', 'bg-lime-900', 'bg-lime-950'] },
  { name: 'green', classes: ['bg-green-50', 'bg-green-100', 'bg-green-200', 'bg-green-300', 'bg-green-400', 'bg-green-500', 'bg-green-600', 'bg-green-700', 'bg-green-800', 'bg-green-900', 'bg-green-950'] },
  { name: 'emerald', classes: ['bg-emerald-50', 'bg-emerald-100', 'bg-emerald-200', 'bg-emerald-300', 'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-600', 'bg-emerald-700', 'bg-emerald-800', 'bg-emerald-900', 'bg-emerald-950'] },
  { name: 'teal', classes: ['bg-teal-50', 'bg-teal-100', 'bg-teal-200', 'bg-teal-300', 'bg-teal-400', 'bg-teal-500', 'bg-teal-600', 'bg-teal-700', 'bg-teal-800', 'bg-teal-900', 'bg-teal-950'] },
  { name: 'cyan', classes: ['bg-cyan-50', 'bg-cyan-100', 'bg-cyan-200', 'bg-cyan-300', 'bg-cyan-400', 'bg-cyan-500', 'bg-cyan-600', 'bg-cyan-700', 'bg-cyan-800', 'bg-cyan-900', 'bg-cyan-950'] },
  { name: 'sky', classes: ['bg-sky-50', 'bg-sky-100', 'bg-sky-200', 'bg-sky-300', 'bg-sky-400', 'bg-sky-500', 'bg-sky-600', 'bg-sky-700', 'bg-sky-800', 'bg-sky-900', 'bg-sky-950'] },
  { name: 'blue', classes: ['bg-blue-50', 'bg-blue-100', 'bg-blue-200', 'bg-blue-300', 'bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-800', 'bg-blue-900', 'bg-blue-950'] },
  { name: 'indigo', classes: ['bg-indigo-50', 'bg-indigo-100', 'bg-indigo-200', 'bg-indigo-300', 'bg-indigo-400', 'bg-indigo-500', 'bg-indigo-600', 'bg-indigo-700', 'bg-indigo-800', 'bg-indigo-900', 'bg-indigo-950'] },
  { name: 'violet', classes: ['bg-violet-50', 'bg-violet-100', 'bg-violet-200', 'bg-violet-300', 'bg-violet-400', 'bg-violet-500', 'bg-violet-600', 'bg-violet-700', 'bg-violet-800', 'bg-violet-900', 'bg-violet-950'] },
  { name: 'purple', classes: ['bg-purple-50', 'bg-purple-100', 'bg-purple-200', 'bg-purple-300', 'bg-purple-400', 'bg-purple-500', 'bg-purple-600', 'bg-purple-700', 'bg-purple-800', 'bg-purple-900', 'bg-purple-950'] },
  { name: 'fuchsia', classes: ['bg-fuchsia-50', 'bg-fuchsia-100', 'bg-fuchsia-200', 'bg-fuchsia-300', 'bg-fuchsia-400', 'bg-fuchsia-500', 'bg-fuchsia-600', 'bg-fuchsia-700', 'bg-fuchsia-800', 'bg-fuchsia-900', 'bg-fuchsia-950'] },
  { name: 'pink', classes: ['bg-pink-50', 'bg-pink-100', 'bg-pink-200', 'bg-pink-300', 'bg-pink-400', 'bg-pink-500', 'bg-pink-600', 'bg-pink-700', 'bg-pink-800', 'bg-pink-900', 'bg-pink-950'] },
  { name: 'rose', classes: ['bg-rose-50', 'bg-rose-100', 'bg-rose-200', 'bg-rose-300', 'bg-rose-400', 'bg-rose-500', 'bg-rose-600', 'bg-rose-700', 'bg-rose-800', 'bg-rose-900', 'bg-rose-950'] }
] as const

const colorPalettes: ColorPalette[] = colorPaletteSources.map((palette) => ({
  name: palette.name,
  swatches: paletteShades.map((shade, index) => ({
    shade,
    className: palette.classes[index]
  }))
}))

const semanticColorPalettes: SemanticColorGroup[] = [
  {
    name: 'background',
    tokens: [
      { name: 'primary', className: 'bg-primary' },
      { name: 'secondary', className: 'bg-secondary' },
      { name: 'tertiary', className: 'bg-tertiary' },
      { name: 'quaternary', className: 'bg-quaternary' },
      { name: 'quinary', className: 'bg-quinary' }
    ]
  },
  {
    name: 'text',
    tokens: [
      { name: 'primary', className: 'text-primary' },
      { name: 'secondary', className: 'text-secondary' },
      { name: 'tertiary', className: 'text-tertiary' },
      { name: 'quaternary', className: 'text-quaternary' },
      { name: 'quinary', className: 'text-quinary' }
    ]
  },
  {
    name: 'border',
    tokens: [
      { name: 'faint', className: 'border-faint' },
      { name: 'light', className: 'border-light' },
      { name: 'medium', className: 'border-medium' },
      { name: 'strong', className: 'border-strong' },
      { name: 'dark', className: 'border-dark' },
      { name: 'heavy', className: 'border-heavy' }
    ]
  }
]

const getSwatchTextClass = (paletteName: string, shade: PaletteShade) => {
  const shadeValue = Number(shade)
  if (['amber', 'yellow', 'lime'].includes(paletteName) && shadeValue <= 600) return 'text-slate-950'
  return shadeValue <= 300 ? 'text-slate-950' : 'text-white'
}
</script>
