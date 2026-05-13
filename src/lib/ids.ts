import type { ComponentId, NodeId, PageId, ProjectId, StyleId, TokenId } from '@/editor/core/scene-types'

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'

export function makeId(prefix: string) {
  const time = Date.now().toString(36)
  const random = Array.from(crypto.getRandomValues(new Uint8Array(8)), (value) => alphabet[value % alphabet.length]).join('')
  return `${prefix}_${time}_${random}`
}

export const ids = {
  project: () => makeId('project') as ProjectId,
  page: () => makeId('page') as PageId,
  node: () => makeId('node') as NodeId,
  component: () => makeId('component') as ComponentId,
  style: () => makeId('style') as StyleId,
  token: () => makeId('token') as TokenId,
}
