import type { Rect } from './geometry'
import type { SceneNode } from './scene-types'

export type SpacingMatch = {
  orientation: 'horizontal' | 'vertical'
  spacing: number
  from: Rect
  to: Rect
  moving: Rect
}

const gapX = (left: Rect, right: Rect) => right.x - (left.x + left.width)
const gapY = (top: Rect, bottom: Rect) => bottom.y - (top.y + top.height)

function sortedHorizontal(rects: Rect[]) {
  return [...rects].sort((a, b) => a.x - b.x)
}

function sortedVertical(rects: Rect[]) {
  return [...rects].sort((a, b) => a.y - b.y)
}

export function detectEqualSpacing(nodes: Array<SceneNode | Rect>, moving: Rect, tolerance = 4): SpacingMatch[] {
  const rects = nodes
    .filter((node) => !('visible' in node) || (node.visible && !node.locked))
    .map((node) => ({ x: node.x, y: node.y, width: node.width, height: node.height }))
  const matches: SpacingMatch[] = []

  const horizontal = sortedHorizontal([...rects, moving])
  const movingIndexX = horizontal.indexOf(moving)
  if (movingIndexX > 0 && movingIndexX < horizontal.length - 1) {
    const before = horizontal[movingIndexX - 1]
    const after = horizontal[movingIndexX + 1]
    const leftGap = gapX(before, moving)
    const rightGap = gapX(moving, after)
    if (leftGap >= 0 && rightGap >= 0 && Math.abs(leftGap - rightGap) <= tolerance) {
      matches.push({ orientation: 'horizontal', spacing: Math.round((leftGap + rightGap) / 2), from: before, to: after, moving })
    }
  }
  if (movingIndexX >= 2) {
    const a = horizontal[movingIndexX - 2]
    const b = horizontal[movingIndexX - 1]
    const previousGap = gapX(a, b)
    const movingGap = gapX(b, moving)
    if (previousGap >= 0 && Math.abs(previousGap - movingGap) <= tolerance) matches.push({ orientation: 'horizontal', spacing: Math.round(previousGap), from: b, to: moving, moving })
  }

  const vertical = sortedVertical([...rects, moving])
  const movingIndexY = vertical.indexOf(moving)
  if (movingIndexY > 0 && movingIndexY < vertical.length - 1) {
    const before = vertical[movingIndexY - 1]
    const after = vertical[movingIndexY + 1]
    const topGap = gapY(before, moving)
    const bottomGap = gapY(moving, after)
    if (topGap >= 0 && bottomGap >= 0 && Math.abs(topGap - bottomGap) <= tolerance) {
      matches.push({ orientation: 'vertical', spacing: Math.round((topGap + bottomGap) / 2), from: before, to: after, moving })
    }
  }
  if (movingIndexY >= 2) {
    const a = vertical[movingIndexY - 2]
    const b = vertical[movingIndexY - 1]
    const previousGap = gapY(a, b)
    const movingGap = gapY(b, moving)
    if (previousGap >= 0 && Math.abs(previousGap - movingGap) <= tolerance) matches.push({ orientation: 'vertical', spacing: Math.round(previousGap), from: b, to: moving, moving })
  }

  return matches
}
