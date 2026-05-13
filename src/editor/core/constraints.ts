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
}
