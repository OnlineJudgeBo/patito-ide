export type ColorTheme = 'dark' | 'light' | 'hacker';
export type BottomPanel = 'output' | 'input' | 'testcases';
export type ContextLoadState = 'idle' | 'loading' | 'ready' | 'demo' | 'error';

export type UISettings = {
  readonly bottomPanelHeight: number;
  readonly colorTheme: ColorTheme;
  readonly minimap: boolean;
  readonly sidebarWidth: number;
  readonly sidebarCollapsed: boolean;
};
