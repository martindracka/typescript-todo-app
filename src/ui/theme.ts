import type { StorageLike, Theme } from '../types';

const THEME_KEY = 'ts-todo-app.theme';

/**
 * Option 11: reads the saved theme. If nothing is saved, it uses the operating system setting.
 * @param storage - where the theme is saved
 */
export const getInitialTheme = (storage: StorageLike | null): Theme => {
  const saved = storage?.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Applies the theme to the page by setting `data-theme` on <html>.
 * The CSS variables in style.css change based on this attribute.
 */
export const applyTheme = (theme: Theme, button: HTMLButtonElement): void => {
  document.documentElement.dataset.theme = theme;
  button.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  button.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
};

/**
 * Switches between light and dark, applies it and saves the choice.
 * @returns the new theme
 */
export const toggleTheme = (current: Theme, button: HTMLButtonElement, storage: StorageLike | null): Theme => {
  const next: Theme = current === 'dark' ? 'light' : 'dark';
  applyTheme(next, button);
  storage?.setItem(THEME_KEY, next);
  return next;
};
