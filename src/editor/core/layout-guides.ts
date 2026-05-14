import type { LayoutGuide, SceneNode } from './scene-types'

export type LayoutGuideSegment = {
  kind: 'uniform' | 'column' | 'row'
  orientation: 'horizontal' | 'vertical'
  position: number
  from: number
  to: number
  color: string
  opacity: number
}

function isGuidedNode(node: SceneNode): node is SceneNode & { layoutGuides: LayoutGuide[] } {
  return 'layoutGuides' in node && Array.isArray(node.layoutGuides)
}

export function layoutGuideSegments(node: SceneNode): LayoutGuideSegment[] {
  if (!isGuidedNode(node)) return []
  const segments: LayoutGuideSegment[] = []
  for (const guide of node.layoutGuides) {
    if (!guide.visible) continue
    if (guide.type === 'uniform') {
      for (let x = node.x; x <= node.x + node.width; x += guide.size) {
        segments.push({ kind: 'uniform', orientation: 'vertical', position: x, from: node.y, to: node.y + node.height, color: guide.color, opacity: guide.opacity })
      }
      for (let y = node.y; y <= node.y + node.height; y += guide.size) {
        segments.push({ kind: 'uniform', orientation: 'horizontal', position: y, from: node.x, to: node.x + node.width, color: guide.color, opacity: guide.opacity })
      }
      continue
    }
    const available = guide.type === 'columns' ? node.width - guide.margin * 2 - guide.gutter * Math.max(0, guide.count - 1) : node.height - guide.margin * 2 - guide.gutter * Math.max(0, guide.count - 1)
    const track = available / guide.count
    for (let index = 0; index < guide.count; index += 1) {
      const start = (guide.type === 'columns' ? node.x : node.y) + guide.margin + index * (track + guide.gutter)
      const end = start + track
      if (guide.type === 'columns') {
        segments.push({ kind: 'column', orientation: 'vertical', position: start, from: node.y, to: node.y + node.height, color: guide.color, opacity: guide.opacity })
        segments.push({ kind: 'column', orientation: 'vertical', position: end, from: node.y, to: node.y + node.height, color: guide.color, opacity: guide.opacity })
      } else {
        segments.push({ kind: 'row', orientation: 'horizontal', position: start, from: node.x, to: node.x + node.width, color: guide.color, opacity: guide.opacity })
        segments.push({ kind: 'row', orientation: 'horizontal', position: end, from: node.x, to: node.x + node.width, color: guide.color, opacity: guide.opacity })
      }
    }
  }
  return segments
}
