import type { NodeId, Page } from './scene-types'

export function selectAll(page: Page): NodeId[] {
  return Object.keys(page.nodes) as NodeId[]
}

export function toggleSelection(selection: NodeId[], id: NodeId): NodeId[] {
  return selection.includes(id) ? selection.filter((item) => item !== id) : [...selection, id]
}
