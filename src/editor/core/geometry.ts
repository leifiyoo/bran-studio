import type { SceneNode } from './scene-types'

export type Point = { x: number; y: number }
export type Rect = { x: number; y: number; width: number; height: number }

export const rectFromNode = (node: SceneNode): Rect => ({ x: node.x, y: node.y, width: node.width, height: node.height })
export const centerOf = (rect: Rect): Point => ({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 })
export const normalizeRect = (rect: Rect): Rect => {
  const x = Math.min(rect.x, rect.x + rect.width)
  const y = Math.min(rect.y, rect.y + rect.height)
  return { x, y, width: Math.abs(rect.width), height: Math.abs(rect.height) }
}
export const intersects = (a: Rect, b: Rect) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
export const containsPoint = (rect: Rect, point: Point) => point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
export const boundsForNodes = (nodes: SceneNode[]): Rect | null => {
  if (nodes.length === 0) return null
  const minX = Math.min(...nodes.map((node) => node.x))
  const minY = Math.min(...nodes.map((node) => node.y))
  const maxX = Math.max(...nodes.map((node) => node.x + node.width))
  const maxY = Math.max(...nodes.map((node) => node.y + node.height))
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}
export const snapValue = (value: number, gridSize: number) => Math.round(value / gridSize) * gridSize
