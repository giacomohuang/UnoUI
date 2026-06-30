import { reactive } from 'vue'

type ThemeValue = 'light' | 'dark'

const normalizeTheme = (value: string | null | undefined): ThemeValue => (value === 'dark' ? 'dark' : 'light')

const state = reactive({
  theme: normalizeTheme(localStorage.getItem('theme'))
})

export const setTheme = (value: string) => {
  state.theme = normalizeTheme(value)
  localStorage.setItem('theme', state.theme)
  document.body.setAttribute('data-theme', state.theme)
}

export const useThemeStore = () => ({
  get theme() {
    return state.theme
  },
  changeTheme: setTheme
})
