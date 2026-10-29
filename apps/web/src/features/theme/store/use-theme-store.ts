import { create } from 'zustand';
import { THEME_STORAGE_KEY, resolveInitialTheme, toggleTheme, type Theme } from '../model/theme';

interface ThemeState {
  readonly theme: Theme;
  readonly toggle: () => void;
}

const readStoredTheme = (): unknown => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
};

const applyTheme = (theme: Theme): void => {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for this session.
  }
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = resolveInitialTheme(
    readStoredTheme(),
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  applyTheme(initial);
  return {
    theme: initial,
    toggle: () => {
      const next = toggleTheme(get().theme);
      applyTheme(next);
      set({ theme: next });
    },
  };
});
