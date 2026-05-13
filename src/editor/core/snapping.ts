import type { NodeId, Page, SceneNode } from './scene-types'
import { centerOf, snapValue, type Rect } from './geometry'

export type Guide = { orientation: 'horizontal' | 'vertical'; position: number; from: number; to: number }
export type SnapResult = { x: number; y: number; guides: Guide[] }

export function snapRect(page: Page, moving: Rect, nodeId: NodeId | null, gridSize: number, enabled: boolean): SnapResult {
  if (!enabled) return { x: moving.x, y: moving.y, guides: [] }
  let x = snapValue(moving.x, gridSize)
  let y = snapValue(moving.y, gridSize)
  const guides: Guide[] = []
  const candidates = Object.values(page.nodes).filter((node) => node.id !== nodeId && node.visible)
  const movingCenter = centerOf(moving)
  for (const node of candidates) {
    const targetCenter = centerOf(node)
    const verticals = [node.x, node.x + node.width, targetCenter.x]
    const horizontals = [node.y, node.y + node.height, targetCenter.y]
    const ownVerticals = [moving.x, moving.x + moving.width, movingCenter.x]
    const ownHorizontals = [moving.y, moving.y + moving.height, movingCenter.y]
    verticals.forEach((target) => {
      ownVerticals.forEach((own) => {
        if (Math.abs(target - own) <= 6) {
          x += target - own
          guides.push({ orientation: 'vertical', position: target, from: Math.min(node.y, moving.y), to: Math.max(node.y + node.height, moving.y + moving.height) })
        }
      })
    })
    horizontals.forEach((target) => {
      ownHorizontals.forEach((own) => {
        if (Math.abs(target - own) <= 6) {
          y += target - own
          guides.push({ orientation: 'horizontal', position: target, from: Math.min(node.x, moving.x), to: Math.max(node.x + node.width, moving.x + moving.width) })
        }
      })
    })
  }
  return { x, y, guides }
}

export function snapNode(page: Page, node: SceneNode, dx: number, dy: number, gridSize: number, enabled: boolean): SnapResult {
  return snapRect(page, { x: node.x + dx, y: node.y + dy, width: node.width, height: node.height }, node.id, gridSize, enabled)
}
