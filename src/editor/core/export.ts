import { exportSchema } from '@/lib/schemas'
import type { Page, Project } from './scene-types'
import type { AssetRecord } from '@/lib/db'

export function exportProject(project: Project, pages: Page[], assets: AssetRecord[] = []) {
  const payload = { format: 'bran.project' as const, version: project.version, exportedAt: new Date().toISOString(), project, pages, assets }
  return JSON.stringify(exportSchema.parse(payload), null, 2)
}

export function downloadText(filename: string, text: string, mime = 'application/json') {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function pageToSvg(page: Page) {
  const defs = Object.values(page.nodes).map((node) => {
    const fill = node.fills[0]
    if (!fill || fill.type === 'solid') return ''
    if (fill.type === 'linear-gradient') return `<linearGradient id="fill-${node.id}" gradientTransform="rotate(${fill.angle})">${fill.stops.map((s)=>`<stop offset="${s.position}%" stop-color="${s.color}" stop-opacity="${s.alpha * fill.alpha}"/>`).join('')}</linearGradient>`
    return `<radialGradient id="fill-${node.id}" cx="${fill.center.x}%" cy="${fill.center.y}%" r="${fill.radius}%">${fill.stops.map((s)=>`<stop offset="${s.position}%" stop-color="${s.color}" stop-opacity="${s.alpha * fill.alpha}"/>`).join('')}</radialGradient>`
  }).join('')
  const nodes = Object.values(page.nodes).map((node) => {
    if (node.type === 'text') return `<text x="${node.x}" y="${node.y + node.fontSize}" font-family="${node.fontFamily}" font-size="${node.fontSize}" fill="${node.color}">${escapeXml(node.text)}</text>`
    if (node.type === 'image') return `<image href="${node.src}" x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" preserveAspectRatio="xMidYMid slice" />`
    const fill = !node.fills[0] ? 'transparent' : node.fills[0].type === 'solid' ? node.fills[0].color : `url(#fill-${node.id})`
    return `<rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="${typeof node.cornerRadius === 'number' ? node.cornerRadius : 0}" fill="${fill}" />`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="-200 -200 1800 1400"><defs>${defs}</defs>${nodes}</svg>`
}

const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char] ?? char)
