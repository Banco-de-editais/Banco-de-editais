import { computed, ref } from 'vue'

const STORAGE_KEY = 'editais-theme'
const theme = ref('light')
let initialized = false

function applyTheme(value) {
  document.documentElement.classList.toggle('dark', value === 'dark')
  document.documentElement.style.colorScheme = value
}

export function initializeTheme() {
  if (initialized || typeof window === 'undefined') return

  const saved = window.localStorage.getItem(STORAGE_KEY)
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  theme.value = saved === 'light' || saved === 'dark' ? saved : prefersDark ? 'dark' : 'light'
  applyTheme(theme.value)
  initialized = true
}

export function useTheme() {
  initializeTheme()
  const isDark = computed(() => theme.value === 'dark')

  const toggleTheme = () => {
    theme.value = isDark.value ? 'light' : 'dark'
    window.localStorage.setItem(STORAGE_KEY, theme.value)
    applyTheme(theme.value)
  }

  return { theme, isDark, toggleTheme }
}
