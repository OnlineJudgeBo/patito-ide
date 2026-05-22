import type { BottomPanel, ColorTheme } from '@/types/ide';

export const TOAST_TIMEOUT_MS = 2600;

export const COLOR_THEMES = [
  { id: 'dark', label: 'Oscuro' },
  { id: 'light', label: 'Claro' },
  { id: 'hacker', label: 'Hacker' },
] as const satisfies readonly { readonly id: ColorTheme; readonly label: string }[];

export const COLOR_THEME_CLASS: Readonly<Record<ColorTheme, string>> = {
  dark: 'theme-dark',
  light: 'theme-light',
  hacker: 'theme-hacker',
};

export const BOTTOM_PANELS = ['output', 'input', 'testcases'] as const satisfies readonly BottomPanel[];

export const PANEL_HEIGHT_BOUNDS = { min: 220, max: 520 } as const;
export const SIDEBAR_WIDTH_BOUNDS = { min: 260, max: 560, viewportRatio: 0.45 } as const;

export function isColorTheme(value: string): value is ColorTheme {
  return COLOR_THEMES.some((theme) => theme.id === value);
}
