export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'arquitecto-theme';

export const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark';

export const resolveInitialTheme = (stored: unknown, prefersDark: boolean): Theme =>
  isTheme(stored) ? stored : prefersDark ? 'dark' : 'light';

export const toggleTheme = (theme: Theme): Theme => (theme === 'light' ? 'dark' : 'light');
