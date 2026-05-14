export const defaultConstraints = {
  horizontal: 'left' as const,
  vertical: 'top' as const,
}

export const defaultLayout = {
  mode: 'none' as const,
  padding: { top: 16, right: 16, bottom: 16, left: 16 },
  gap: 12,
  alignItems: 'start' as const,
  justifyContent: 'start' as const,
  wrap: 'no-wrap' as const,
  childSizing: 'fixed' as const,
  absolute: false,
  strokesIncludedInLayout: false,
  grid: { columns: [{ type: 'fr' as const, value: 1 }], rows: [{ type: 'auto' as const }], columnGap: 12, rowGap: 12 },
}

export const defaultLayoutSizing = {
  horizontal: 'fixed' as const,
  vertical: 'fixed' as const,
}

export const defaultExportSettings = (['png', 'jpg', 'svg', 'webp', 'avif', 'pdf'] as const).map((format) => ({ format, scale: 1, suffix: format === 'png' ? '' : `.${format}`, enabled: format === 'png' }))

export const defaultLayoutGuides = [{ id: 'grid-8', type: 'uniform' as const, size: 8, color: '#ffffff', opacity: 0.08, visible: true }]
