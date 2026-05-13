import { create } from 'zustand'

type UiState = {
  sidebarTab: 'pages' | 'layers' | 'assets' | 'components'
  previewOpen: boolean
  toast: string | null
  contextMenu: { x: number; y: number; scope: 'canvas' | 'node' | 'layers'; world?: { x: number; y: number } } | null
  setSidebarTab: (tab: UiState['sidebarTab']) => void
  setPreviewOpen: (open: boolean) => void
  showToast: (toast: string | null) => void
  openContextMenu: (menu: UiState['contextMenu']) => void
  closeContextMenu: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarTab: 'layers',
  previewOpen: false,
  toast: null,
  contextMenu: null,
  setSidebarTab: (sidebarTab) => set({ sidebarTab }),
  setPreviewOpen: (previewOpen) => set({ previewOpen }),
  showToast: (toast) => set({ toast }),
  openContextMenu: (contextMenu) => set({ contextMenu }),
  closeContextMenu: () => set({ contextMenu: null }),
}))
