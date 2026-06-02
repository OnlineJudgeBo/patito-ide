import { initialUiSettings } from '@/store/ide-defaults';
import { updateUi } from '@/store/ide-store-helpers';
import type { StoreSet } from '@/store/slices/types';
import type { UISettings } from '@/types/ide';

export type UiSlice = {
  stdin: string;
  ui: UISettings;
  setStdin: (stdin: string) => void;
  setBottomPanelHeight: (height: number) => void;
  setColorTheme: (theme: UISettings['colorTheme']) => void;
  setSidebarWidth: (width: number) => void;
  toggleMinimap: () => void;
  toggleSidebar: () => void;
};

export function createUiSlice(set: StoreSet): UiSlice {
  return {
    stdin: '5\n',
    ui: initialUiSettings,
    setStdin: (stdin) => set({ stdin }),
    setBottomPanelHeight: (height) => set((state) => updateUi(state, { bottomPanelHeight: height })),
    setColorTheme: (theme) => set((state) => updateUi(state, { colorTheme: theme })),
    setSidebarWidth: (width) => set((state) => updateUi(state, { sidebarWidth: width })),
    toggleMinimap: () => set((state) => updateUi(state, { minimap: !state.ui.minimap })),
    toggleSidebar: () => set((state) => updateUi(state, { sidebarCollapsed: !state.ui.sidebarCollapsed })),
  };
}
