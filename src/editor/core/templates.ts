import type { NodeId, Page, Project, ProjectId, SceneNode, Token } from './scene-types'
import { defaultConstraints, defaultLayout } from './constraints'
import { ids } from '@/lib/ids'

const now = () => new Date().toISOString()

export function baseNode(type: SceneNode['type'], name: string, x: number, y: number, width: number, height: number, fill = '#ffffff'): Omit<SceneNode, 'type'> & { type: SceneNode['type'] } {
  const date = now()
  return {
    id: ids.node(),
    type,
    name,
    parentId: null,
    children: [],
    x,
    y,
    width,
    height,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    constraints: defaultConstraints,
    layout: defaultLayout,
    fills: fill === 'transparent' ? [] : [{ type: 'solid', color: fill, alpha: 1 }],
    strokes: [],
    effects: [],
    cornerRadius: 0,
    createdAt: date,
    updatedAt: date,
    metadata: {},
  } as Omit<SceneNode, 'type'> & { type: SceneNode['type'] }
}

export function makeFrame(name: string, x: number, y: number, width: number, height: number, preset?: string) {
  return { ...baseNode('frame', name, x, y, width, height, '#ffffff'), clipContent: true, devicePreset: preset } as SceneNode
}
export function makeRect(name: string, x: number, y: number, width: number, height: number, fill = '#2357ff', radius = 12) {
  const node = { ...baseNode('rectangle', name, x, y, width, height, fill), cornerRadius: radius, strokes: [{ color: '#e5e5e5', alpha: 1, width: 1, position: 'center' as const }] } as SceneNode
  return node
}
export function makeText(name: string, x: number, y: number, text: string, fontSize = 16, color = '#262626') {
  return { ...baseNode('text', name, x, y, Math.max(96, text.length * fontSize * 0.5), fontSize * 1.35, 'transparent'), text, fontFamily: 'Inter Variable', fontSize, fontWeight: 500, fontStyle: 'normal', lineHeight: Number((fontSize * 1.35).toFixed(2)), letterSpacing: -0.31, paragraphSpacing: 0, textAlignHorizontal: 'left', textAlignVertical: 'top', textDecoration: 'none', textTransform: 'none', color, autoResize: 'both' } as SceneNode
}

function projectShell(name: string, description: string, projectId = ids.project()) {
  const date = now()
  const primary = ids.token()
  const bg = ids.token()
  const tokens: Record<string, Token> = {
    [primary]: { id: primary, type: 'color', name: 'Brand Blue', value: '#2357ff', alpha: 1 },
    [bg]: { id: bg, type: 'color', name: 'Canvas White', value: '#ffffff', alpha: 1 },
  }
  ;[
    ['Neutral / 50', '#fafafa'], ['Neutral / 100', '#f5f5f5'], ['Neutral / 200', '#e5e5e5'], ['Neutral / 500', '#737373'],
    ['Neutral / 800', '#262626'], ['Neutral / 900', '#171717'], ['Surface / White', '#ffffff'], ['Surface / Subtle', '#fcfcfc'],
    ['Accent / Blue', '#2563eb'], ['Success', '#16a34a'], ['Warning', '#d97706'], ['Danger', '#dc2626'],
  ].forEach(([name, value]) => { const id = ids.token(); tokens[id] = { id, type: 'color', name, value, alpha: 1 } })
  return { id: projectId, name, description, createdAt: date, updatedAt: date, version: 1, pages: [], activePageId: '' as never, components: {}, styles: {}, tokens, settings: { snapToGrid: true, gridSize: 8, theme: 'system' as const, autosave: true } }
}

export function makeProjectFromTemplate(template: 'blank' | 'saas' | 'mobile' | 'landing', name = templateName(template)): { project: Project; pages: Page[] } {
  const project = projectShell(name, `${name} created in Bran Studio`)
  const pageId = ids.page()
  const frame = template === 'mobile' ? makeFrame('Mobile 1', 120, 80, 390, 844, 'Mobile 390x844') : makeFrame('Desktop 1', 80, 80, template === 'saas' ? 1440 : 1280, template === 'saas' ? 1024 : 832, 'Desktop')
  const nodes: Record<NodeId, SceneNode> = { [frame.id]: frame }
  const add = (node: SceneNode, parent = frame.id) => {
    node.parentId = parent
    nodes[node.id] = node
    nodes[parent].children.push(node.id)
  }
  if (template === 'blank') add(makeText('Label', 48, 48, 'Start designing', 32))
  if (template === 'saas') {
    add(makeRect('Sidebar', 0, 0, 244, 1024, '#111827', 0))
    add(makeText('Product title', 32, 32, 'Bran Metrics', 26, '#ffffff'))
    add(makeRect('Topbar', 244, 0, 1196, 76, '#ffffff', 0))
    ;[0, 1, 2].forEach((i) => { add(makeRect(`Metric card ${i + 1}`, 284 + i * 312, 116, 276, 150, ['#edf7ff', '#effcf2', '#fff5df'][i], 18)); add(makeText(`Metric label ${i + 1}`, 308 + i * 312, 146, ['Revenue', 'Activation', 'Retention'][i], 18)) })
    add(makeRect('Chart panel', 284, 314, 680, 330, '#ffffff', 18))
    ;[0, 1, 2, 3, 4].forEach((i) => add(makeRect(`Chart bar ${i + 1}`, 330 + i * 100, 552 - i * 34, 48, 54 + i * 34, '#2357ff', 8)))
    add(makeRect('Table', 284, 692, 1030, 252, '#ffffff', 18))
  }
  if (template === 'mobile') {
    add(makeText('Header', 28, 36, 'Today', 32))
    add(makeRect('Hero card', 24, 100, 342, 180, '#dff1ff', 28))
    add(makeText('Hero copy', 48, 136, 'Plan your next launch', 24))
    ;[0, 1, 2].forEach((i) => add(makeRect(`List card ${i + 1}`, 24, 316 + i * 104, 342, 78, '#ffffff', 18)))
    add(makeRect('Bottom nav', 24, 760, 342, 58, '#191917', 24))
  }
  if (template === 'landing') {
    add(makeText('Hero heading', 72, 92, 'Design interfaces faster', 54))
    add(makeText('Hero body', 76, 236, 'A local-first studio for product screens, components, tokens, and clean design data.', 22, '#58544d'))
    add(makeRect('Primary CTA', 76, 318, 180, 56, '#2357ff', 16))
    add(makeRect('Preview panel', 700, 84, 450, 340, '#ffffff', 28))
    ;[0, 1, 2].forEach((i) => add(makeRect(`Feature card ${i + 1}`, 76 + i * 364, 520, 320, 170, '#f4f1e8', 20)))
  }
  const page: Page = { id: pageId, projectId: project.id as ProjectId, name: 'Page 1', nodes, rootNodeIds: [frame.id], createdAt: now(), updatedAt: now(), backgroundColor: '#f7f6f2', viewportState: { x: 220, y: 80, zoom: 0.65 } }
  const completeProject = { ...project, pages: [pageId], activePageId: pageId } as Project
  return { project: completeProject, pages: [page] }
}

export const templateName = (template: 'blank' | 'saas' | 'mobile' | 'landing') => ({ blank: 'Blank Project', saas: 'SaaS Dashboard', mobile: 'Mobile App', landing: 'Landing Page' })[template]
