import type { Page } from '@/editor/core/scene-types'

export function thumbnailForPage(page: Page) {
  const count = Object.keys(page.nodes).length
  const frame = Object.values(page.nodes).find((node) => node.type === 'frame')
  const label = encodeURIComponent(`${page.name} - ${count} layers`)
  const firstFill = frame?.fills[0]
  const fill = encodeURIComponent(firstFill?.type === 'solid' ? firstFill.color : '#ffffff')
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='400'%3E%3Crect width='640' height='400' fill='%23f7f6f2'/%3E%3Crect x='82' y='54' width='476' height='292' rx='18' fill='${fill}' stroke='%23d9d5ca'/%3E%3Ctext x='104' y='318' font-family='Inter,Arial' font-size='18' fill='%23191917'%3E${label}%3C/text%3E%3C/svg%3E`
}
