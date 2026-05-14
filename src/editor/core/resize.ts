import type { Rect } from './geometry'

export type ResizeOptions = {
  preserveAspectRatio: boolean
  resizeFromCenter: boolean
  minSize: number
}

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se'

export function resizeRectFromHandle(original: Rect, handle: ResizeHandle, dx: number, dy: number, options: ResizeOptions): Rect {
  const minSize = options.minSize
  const next = { ...original }
  const xFactor = options.resizeFromCenter ? 2 : 1
  const yFactor = options.resizeFromCenter ? 2 : 1

  if (handle.includes('e')) next.width = Math.max(minSize, original.width + dx * xFactor)
  if (handle.includes('s')) next.height = Math.max(minSize, original.height + dy * yFactor)
  if (handle.includes('w')) {
    next.width = Math.max(minSize, original.width - dx * xFactor)
    next.x = options.resizeFromCenter ? original.x + (original.width - next.width) / 2 : original.x + original.width - next.width
  }
  if (handle.includes('n')) {
    next.height = Math.max(minSize, original.height - dy * yFactor)
    next.y = options.resizeFromCenter ? original.y + (original.height - next.height) / 2 : original.y + original.height - next.height
  }
  if ((handle.includes('e') || handle.includes('w')) && options.resizeFromCenter) next.x = original.x + (original.width - next.width) / 2
  if ((handle.includes('s') || handle.includes('n')) && options.resizeFromCenter) next.y = original.y + (original.height - next.height) / 2

  if (options.preserveAspectRatio && original.width > 0 && original.height > 0) {
    const ratio = original.width / original.height
    const widthDriven = Math.abs(next.width - original.width) >= Math.abs(next.height - original.height)
    const width = widthDriven ? next.width : Math.max(minSize, next.height * ratio)
    const height = widthDriven ? Math.max(minSize, next.width / ratio) : next.height
    const old = { ...next }
    next.width = width
    next.height = height
    if (handle.includes('w')) next.x += old.width - width
    if (handle.includes('n')) next.y += old.height - height
    if (options.resizeFromCenter) {
      next.x = original.x + (original.width - width) / 2
      next.y = original.y + (original.height - height) / 2
    }
  }

  return {
    x: Math.round(next.x * 100) / 100,
    y: Math.round(next.y * 100) / 100,
    width: Math.round(next.width * 100) / 100,
    height: Math.round(next.height * 100) / 100,
  }
}
