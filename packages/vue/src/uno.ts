import presetIcons from '@unocss/preset-icons'
import { definePreset, presetWind4 } from 'unocss'
import type { PresetWind4Theme, Rule } from 'unocss'

type UnoUITheme = PresetWind4Theme

const bgColors = {
  primary: ['white', 'zinc-950'],
  secondary: ['slate-50', 'zinc-900'],
  tertiary: ['slate-200', 'zinc-800'],
  quaternary: ['slate-300', 'zinc-400'],
  quinary: ['slate-400', 'zinc-300']
}

const textColors = {
  primary: ['slate-950', 'zinc-200'],
  secondary: ['slate-700', 'zinc-300'],
  tertiary: ['slate-500', 'zinc-500'],
  quaternary: ['slate-300', 'zinc-700'],
  quinary: ['slate-200', 'zinc-900']
}

const borderColors = {
  faint: ['slate-50', 'zinc-900'],
  light: ['slate-100', 'zinc-800'],
  medium: ['slate-200', 'zinc-700'],
  strong: ['slate-400', 'zinc-500'],
  dark: ['slate-600', 'zinc-400'],
  heavy: ['slate-700', 'zinc-300']
}

const semanticColorGroups = {
  bg: {
    property: 'background-color',
    colors: bgColors
  },
  text: {
    property: 'color',
    colors: textColors
  },
  border: {
    property: 'border-color',
    colors: borderColors
  }
} as const

const resolveThemeColor = (theme: Readonly<UnoUITheme>, token: string) => {
  const [colorName, shade] = token.split('-')
  const color = theme.colors?.[colorName]
  if (typeof color === 'string') return color
  if (color === undefined) return token
  if (shade !== undefined && typeof color[shade] === 'string') return color[shade]
  if (typeof color.DEFAULT === 'string') return color.DEFAULT
  return token
}

const semanticColorVariable = (group: keyof typeof semanticColorGroups, level: string) => `--color-${group}-${level}`

const semanticColorValue = (group: keyof typeof semanticColorGroups, level: string, opacity?: string) => {
  const color = `var(${semanticColorVariable(group, level)})`
  return opacity !== undefined ? `color-mix(in oklab, ${color} ${opacity}%, transparent)` : color
}

const semanticColorPreflight = (theme: Readonly<UnoUITheme>) => {
  const buildVariables = (mode: 0 | 1) =>
    Object.entries(semanticColorGroups)
      .flatMap(([group, config]) =>
        Object.entries(config.colors).map(([level, colors]) => {
          return `  ${semanticColorVariable(group as keyof typeof semanticColorGroups, level)}: ${resolveThemeColor(theme, colors[mode])};`
        })
      )
      .join('\n')

  return `:root,\n[data-theme="light"] {\n${buildVariables(0)}\n}\n\n[data-theme="dark"] {\n${buildVariables(1)}\n}`
}

export const unoUISemanticColorRules: Rule<UnoUITheme>[] = (Object.entries(semanticColorGroups) as Array<[keyof typeof semanticColorGroups, (typeof semanticColorGroups)[keyof typeof semanticColorGroups]]>).map(([group, config]): Rule<UnoUITheme> => {
  const levels = Object.keys(config.colors).join('|')
  return [
    new RegExp(`^${group}-(${levels})(?:/(\\d+))?$`),
    ([, level, opacity]) => ({
      [config.property]: semanticColorValue(group, level, opacity)
    })
  ]
})

export const unoUITheme = {
  colors: {
    brand: {
      DEFAULT: 'oklch(68.98% 0.1679 252.18)',
      50: 'oklch(96.63% 0.0165 250.84)',
      100: 'oklch(93.48% 0.0328 248.18)',
      200: 'oklch(90.16% 0.0498 249.31)',
      300: 'oklch(83.84% 0.0838 249.39)',
      400: 'oklch(77.49% 0.1190 250.28)',
      500: 'oklch(68.98% 0.1679 252.18)',
      600: 'oklch(58.50% 0.1407 252.23)',
      700: 'oklch(53.80% 0.1324 252.21)',
      800: 'oklch(45.87% 0.1122 252.86)',
      900: 'oklch(37.56% 0.0891 253.93)',
      950: 'oklch(29.01% 0.0633 254.34)'
    },
    transparent: {
      DEFAULT: 'transparent'
    }
  }
} satisfies UnoUITheme

export const unoUIPreflights = [
  {
    getCSS: ({ theme }: { theme: UnoUITheme }) => semanticColorPreflight(theme)
  }
]

export const unoUIRules: Rule<UnoUITheme>[] = [
  ...unoUISemanticColorRules,
  [
    /^shadow-\[(.+)\]$/,
    ([, value], { theme }) => {
      const parts = value.split('_')
      const colorPart = parts[parts.length - 1]

      parts[parts.length - 1] = resolveThemeColor(theme, colorPart)
      return {
        'box-shadow': parts.join(' ')
      }
    }
  ]
]

export const presetUnoUI = definePreset(() => ({
  name: '@unoui/vue',
  presets: [
    presetWind4({
      dark: {
        light: '[data-theme="light"]',
        dark: '[data-theme="dark"]'
      }
    }),
    presetIcons({
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle'
      }
    })
  ],
  theme: unoUITheme,
  preflights: unoUIPreflights,
  rules: unoUIRules
}))
