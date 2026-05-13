import type { NodeId, Page, SceneNode } from './scene-types'

export const updateNode = (page: Page, id: NodeId, patch: Partial<SceneNode>): Page => {
  const node = page.nodes[id]
  if (!node) return page
  return { ...page, nodes: { ...page.nodes, [id]: { ...node, ...patch, updatedAt: new Date().toISOString() } as SceneNode }, updatedAt: new Date().toISOString() }
}

export const addNode = (page: Page, node: SceneNode, parentId: NodeId | null = null): Page => {
  const nodes: Record<NodeId, SceneNode> = { ...page.nodes, [node.id]: { ...node, parentId } }
  const rootNodeIds = parentId ? page.rootNodeIds : [...page.rootNodeIds, node.id]
  if (parentId && nodes[parentId]) nodes[parentId] = { ...nodes[parentId], children: [...nodes[parentId].children, node.id] } as SceneNode
  return { ...page, nodes, rootNodeIds, updatedAt: new Date().toISOString() }
}

export const deleteNodes = (page: Page, ids: NodeId[]): Page => {
  const remove = new Set<NodeId>()
  const collect = (id: NodeId) => {
    remove.add(id)
    page.nodes[id]?.children.forEach(collect)
  }
  ids.forEach(collect)
  const nodes = { ...page.nodes }
  remove.forEach((id) => delete nodes[id])
  Object.values(nodes).forEach((node) => {
    node.children = node.children.filter((id) => !remove.has(id))
  })
  return { ...page, nodes, rootNodeIds: page.rootNodeIds.filter((id) => !remove.has(id)), updatedAt: new Date().toISOString() }
}
