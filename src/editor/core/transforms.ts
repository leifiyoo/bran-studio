import type { ViewportState } from './scene-types'
import { clamp, type Point } from './geometry'

export function screenToWorld(point: Point, viewport: ViewportState): Point {
  return { x: (point.x - viewport.x) / viewport.zoom, y: (point.y - viewport.y) / viewport.zoom }
}
export function worldToScreen(point: Point, viewport: ViewportState): Point {
  return { x: point.x * viewport.zoom + viewport.x, y: point.y * viewport.zoom + viewport.y }
}
export function clampZoom(zoom: number) {
  return clamp(zoom, 0.05, 8)
}
export function zoomAtPoint(viewport: ViewportState, screen: Point, nextZoom: number): ViewportState {
  const zoom = clampZoom(nextZoom)
  const before = screenToWorld(screen, viewport)
  return { zoom, x: screen.x - before.x * zoom, y: screen.y - before.y * zoom }
}
export const screenToCanvas = screenToWorld
export const zoomToPoint = zoomAtPoint
