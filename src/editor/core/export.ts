import { exportSchema } from '@/lib/schemas'
import type { Page, Project } from './scene-types'
import type { AssetRecord } from '@/lib/db'
import { CURRENT_PROJECT_VERSION } from './migrations'

export function exportProject(project: Project, pages: Page[], assets: AssetRecord[] = []) {
  const payload = { format: 'bran.project' as const, version: CURRENT_PROJECT_VERSION, exportedAt: new Date().toISOString(), project: { ...project, version: CURRENT_PROJECT_VERSION }, pages, assets }
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

export async function downloadPageRaster(page: Page, filename: string, format: 'png' | 'jpg' | 'webp' | 'avif', scale = 1) {
  const svg = pageToSvg(page)
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const image = new Image()
  image.decoding = 'async'
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Could not render SVG export'))
    image.src = url
  })
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(1600 * scale))
  canvas.height = Math.max(1, Math.round(1200 * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas export is not available')
  context.fillStyle = page.backgroundColor
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  URL.revokeObjectURL(url)
  const mime = format === 'jpg' ? 'image/jpeg' : `image/${format}`
  const output = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, format === 'jpg' ? 0.92 : undefined))
  if (!output) throw new Error(`${format.toUpperCase()} export is not supported by this browser`)
  const outputUrl = URL.createObjectURL(output)
  const anchor = document.createElement('a')
  anchor.href = outputUrl
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(outputUrl)
}

export function downloadPagePdf(page: Page, filename: string) {
  const svg = pageToSvg(page)
  const win = window.open('', '_blank', 'noopener,noreferrer')
  if (!win) return
  win.document.write(`<html><head><title>${escapeXml(filename)}</title><style>html,body{margin:0;background:${page.backgroundColor}}svg{width:100vw;height:100vh}@media print{@page{margin:0}body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body>${svg}<script>document.title=${JSON.stringify(filename)};setTimeout(()=>print(),250)</script></body></html>`)
  win.document.close()
}

export function pageToSvg(page: Page) {
  const defs = Object.values(page.nodes).map((node) => {
    const fill = node.fills[0]
    if (!fill || fill.type === 'solid') return ''
    if (fill.type === 'linear-gradient') return `<linearGradient id="fill-${node.id}" gradientTransform="rotate(${fill.angle})">${fill.stops.map((s)=>`<stop offset="${s.position}%" stop-color="${s.color}" stop-opacity="${s.alpha * fill.alpha}"/>`).join('')}</linearGradient>`
    if (fill.type === 'radial-gradient') return `<radialGradient id="fill-${node.id}" cx="${fill.center.x}%" cy="${fill.center.y}%" r="${fill.radius}%">${fill.stops.map((s)=>`<stop offset="${s.position}%" stop-color="${s.color}" stop-opacity="${s.alpha * fill.alpha}"/>`).join('')}</radialGradient>`
    return ''
  }).join('')
  const nodes = Object.values(page.nodes).map((node) => {
    if (node.type === 'text') return `<text x="${node.x}" y="${node.y + node.fontSize}" font-family="${node.fontFamily}" font-size="${node.fontSize}" fill="${node.color}">${escapeXml(node.text)}</text>`
    if (node.type === 'image') return `<image href="${node.src}" x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" preserveAspectRatio="xMidYMid slice" />`
    const fill = !node.fills[0] ? 'transparent' : node.fills[0].type === 'solid' ? node.fills[0].color : ['linear-gradient', 'radial-gradient'].includes(node.fills[0].type) ? `url(#fill-${node.id})` : 'transparent'
    return `<rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="${typeof node.cornerRadius === 'number' ? node.cornerRadius : 0}" fill="${fill}" />`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="-200 -200 1800 1400"><defs>${defs}</defs>${nodes}</svg>`
}

const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char] ?? char)
