const THEME_KEY = 'mrs_theme'

export type Theme = 'light' | 'dark'

export function getTheme(): Theme {
  const raw = localStorage.getItem(THEME_KEY)
  if (raw === 'dark' || raw === 'light') return raw
  return 'light'
}

export function setTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme)
  applyTheme(theme)
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}
