import type { NodeId, Page } from './scene-types'
import { containsPoint, intersects, type Point, type Rect } from './geometry'

export function hitTest(page: Page, point: Point): NodeId | null {
  const walk = (ids: NodeId[]): NodeId | null => {
    for (const id of [...ids].reverse()) {
      const node = page.nodes[id]
      if (!node || !node.visible || node.locked) continue
      const childHit = node.children.length ? walk(node.children) : null
      if (childHit) return childHit
      if (containsPoint(node, point)) return id
    }
    return null
  }
  return walk(page.rootNodeIds)
}

export function hitTestSelection(page: Page, rect: Rect): NodeId[] {
  return Object.values(page.nodes).filter((node) => node.visible && intersects(node, rect)).map((node) => node.id)
}
