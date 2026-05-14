import { defaultConstraints, defaultExportSettings, defaultLayout, defaultLayoutGuides, defaultLayoutSizing } from './constraints'
import type { Page, Project, SceneNode } from './scene-types'

export const CURRENT_PROJECT_VERSION = 2

function migrateNode(input: SceneNode | Record<string, unknown>, zIndex = 0): SceneNode {
  const node = input as Record<string, unknown>
  const type = String(node.type ?? 'rectangle')
  const migrated = {
    ...node,
    zIndex: typeof node.zIndex === 'number' ? node.zIndex : zIndex,
    blendMode: node.blendMode ?? 'normal',
    constraints: node.constraints ?? defaultConstraints,
    layoutSizing: node.layoutSizing ?? defaultLayoutSizing,
    layout: { ...defaultLayout, ...((node.layout as Record<string, unknown> | undefined) ?? {}) },
    exportSettings: node.exportSettings ?? defaultExportSettings,
    devStatus: node.devStatus ?? 'none',
    annotations: node.annotations ?? [],
    comments: node.comments ?? [],
    variableModeOverrides: node.variableModeOverrides ?? {},
    strokes: Array.isArray(node.strokes) ? node.strokes.map((stroke) => ({ cap: 'butt', join: 'miter', dash: [], ...(stroke as Record<string, unknown>), position: (stroke as { position?: string }).position === 'center' ? 'center' : ((stroke as { position?: string }).position ?? 'center') })) : [],
    effects: Array.isArray(node.effects) ? node.effects : [],
    metadata: node.metadata ?? {},
  } as Record<string, unknown>
  if (type === 'frame' || type === 'artboard') {
    migrated.clipContent = node.clipContent ?? true
    migrated.layoutGuides = node.layoutGuides ?? defaultLayoutGuides
    migrated.canvasGuides = node.canvasGuides ?? []
    migrated.overflowBehavior = node.overflowBehavior ?? 'clip'
  }
  if (type === 'section') {
    migrated.clipContent = node.clipContent ?? false
    migrated.layoutGuides = node.layoutGuides ?? defaultLayoutGuides
    migrated.canvasGuides = node.canvasGuides ?? []
    migrated.overflowBehavior = node.overflowBehavior ?? 'visible'
    migrated.sectionContentsHidden = node.sectionContentsHidden ?? false
  }
  if (type === 'text') {
    migrated.paragraphIndent = node.paragraphIndent ?? 0
    migrated.textWrap = node.textWrap ?? 'wrap'
    migrated.openTypeFeatures = node.openTypeFeatures ?? {}
    migrated.variableFontAxes = node.variableFontAxes ?? {}
  }
  if (type === 'component') {
    migrated.componentProperties = node.componentProperties ?? []
    migrated.variantProperties = node.variantProperties ?? {}
    migrated.slotIds = node.slotIds ?? []
  }
  if (type === 'instance') {
    migrated.variantSelection = node.variantSelection ?? {}
    migrated.slotChildren = node.slotChildren ?? {}
  }
  return migrated as SceneNode
}

function migratePage(page: Page | Record<string, unknown>): Page {
  const raw = page as Page
  const nodeEntries = Object.entries(raw.nodes ?? {}).map(([id, node], index) => [id, migrateNode(node as SceneNode, index)])
  return {
    ...raw,
    nodes: Object.fromEntries(nodeEntries),
    variableModeOverrides: raw.variableModeOverrides ?? {},
    prototypeInteractions: raw.prototypeInteractions ?? [],
  } as Page
}

function migrateProject(project: Project | Record<string, unknown>): Project {
  const raw = project as Project
  const components = Object.fromEntries(Object.entries(raw.components ?? {}).map(([id, component]) => [id, { properties: [], variants: [], ...(component as Record<string, unknown>) }]))
  const settings = Object.assign(
    { snapToGrid: true, gridSize: 8, theme: 'dark' as const, autosave: true, showLayoutGuides: false, showPixelGrid: true, multiplayer: false },
    raw.settings ?? {},
  )
  return {
    ...raw,
    version: CURRENT_PROJECT_VERSION,
    components,
    variableCollections: raw.variableCollections ?? {},
    libraries: raw.libraries ?? {},
    settings,
    enterprise: raw.enterprise ?? { permissions: {}, auditLog: [] },
  } as unknown as Project
}

export function migrateExportPayload(payload: unknown) {
  const raw = payload as { format?: string; version?: number; exportedAt?: string; project: Project; pages: Page[]; assets?: unknown[] }
  return {
    format: 'bran.project' as const,
    version: CURRENT_PROJECT_VERSION,
    exportedAt: raw.exportedAt ?? new Date().toISOString(),
    project: migrateProject(raw.project),
    pages: (raw.pages ?? []).map(migratePage),
    assets: raw.assets ?? [],
  }
}

export function migrateLoadedProject(project: Project, pages: Page[]) {
  return { project: migrateProject(project), pages: pages.map(migratePage) }
}
