import type { Page, SceneNode } from './scene-types'

export function applyAutoLayout(page: Page, containerId: string): Page {
  const container = page.nodes[containerId as keyof typeof page.nodes] as SceneNode | undefined
  if (!container || container.layout.mode === 'none' || container.children.length === 0) return page
  const nodes = { ...page.nodes }
  const { padding, gap, mode, alignItems, justifyContent } = container.layout
  const children = container.children.map((id) => nodes[id]).filter(Boolean)
  const mainSize = mode === 'horizontal' ? container.width - padding.left - padding.right : container.height - padding.top - padding.bottom
  const used = children.reduce((sum, child) => sum + (mode === 'horizontal' ? child.width : child.height), 0)
  const totalGap = justifyContent === 'space-between' && children.length > 1 ? Math.max(gap, (mainSize - used) / (children.length - 1)) : gap
  const occupied = used + totalGap * Math.max(0, children.length - 1)
  let cursor = mode === 'horizontal' ? padding.left : padding.top
  if (justifyContent === 'center') cursor += (mainSize - occupied) / 2
  if (justifyContent === 'end') cursor += mainSize - occupied
  for (const child of children) {
    const crossAvailable = mode === 'horizontal' ? container.height - padding.top - padding.bottom : container.width - padding.left - padding.right
    const crossSize = mode === 'horizontal' ? child.height : child.width
    let cross = mode === 'horizontal' ? padding.top : padding.left
    if (alignItems === 'center') cross += (crossAvailable - crossSize) / 2
    if (alignItems === 'end') cross += crossAvailable - crossSize
    const patch = mode === 'horizontal' ? { x: cursor, y: cross } : { x: cross, y: cursor }
    nodes[child.id] = { ...child, ...patch, ...(alignItems === 'stretch' ? (mode === 'horizontal' ? { height: crossAvailable } : { width: crossAvailable }) : {}) }
    cursor += (mode === 'horizontal' ? child.width : child.height) + totalGap
  }
  return { ...page, nodes }
}
