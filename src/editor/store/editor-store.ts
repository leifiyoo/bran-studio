'use client'

import { create } from 'zustand'
import type { ComponentId, NodeId, Page, Project, ProjectId, SceneNode, ToolId } from '@/editor/core/scene-types'
import { addNode, deleteNodes, updateNode } from '@/editor/core/commands'
import { History } from '@/editor/core/history'
import { makeFrame, makeRect, makeText } from '@/editor/core/templates'
import { ids } from '@/lib/ids'
import { loadProject, saveAsset, saveProject, listAssets } from '@/lib/storage'
import { exportProject } from '@/editor/core/export'
import type { AssetRecord } from '@/lib/db'

type EditorState = {
  project: Project | null
  pages: Page[]
  activePage: Page | null
  selectedIds: NodeId[]
  tool: ToolId
  clipboard: SceneNode[]
  saveStatus: 'saved' | 'saving' | 'unsaved'
  assets: AssetRecord[]
  history: History<{ project: Project; pages: Page[] }>
  load: (projectId: ProjectId) => Promise<void>
  setTool: (tool: ToolId) => void
  select: (ids: NodeId[]) => void
  commitPage: (label: string, page: Page) => void
  updateSelected: (patch: Partial<SceneNode>) => void
  createNode: (type: 'frame' | 'rectangle' | 'text', x?: number, y?: number, width?: number, height?: number) => void
  addImage: (file: File) => Promise<void>
  deleteSelection: () => void
  cut: () => void
  duplicateSelection: () => void
  copy: () => void
  paste: () => void
  undo: () => void
  redo: () => void
  setViewport: (x: number, y: number, zoom: number) => void
  addPage: () => void
  setActivePage: (id: string) => void
  renamePage: (id: string, name: string) => void
  duplicatePage: (id: string) => void
  deletePage: (id: string) => void
  createComponent: () => void
  insertInstance: (componentId: ComponentId) => void
  insertBuiltin: (kind: string) => void
  detachInstance: () => void
  groupSelection: () => void
  ungroupSelection: () => void
  toggleLockSelection: () => void
  toggleVisibilitySelection: () => void
  arrangeSelection: (mode: 'forward' | 'backward' | 'front' | 'back') => void
  nudgeSelection: (dx: number, dy: number) => void
  zoomBy: (factor: number) => void
  zoomTo: (zoom: number) => void
  zoomToFit: () => void
  exportJson: () => string | null
  persist: () => Promise<void>
}

const snapshot = (project: Project, pages: Page[]) => ({ project: structuredClone(project), pages: structuredClone(pages) })
const active = (project: Project | null, pages: Page[]) => pages.find((page) => page.id === project?.activePageId) ?? null

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  pages: [],
  activePage: null,
  selectedIds: [],
  tool: 'select',
  clipboard: [],
  saveStatus: 'saved',
  assets: [],
  history: new History(),
  load: async (projectId) => {
    const loaded = await loadProject(projectId)
    if (!loaded) return
    set({ project: loaded.project, pages: loaded.pages, activePage: active(loaded.project, loaded.pages), selectedIds: [], assets: await listAssets(projectId), history: new History() })
  },
  setTool: (tool) => set({ tool }),
  select: (selectedIds) => set({ selectedIds }),
  commitPage: (label, page) => {
    const { project, pages, history } = get()
    if (!project) return
    const before = snapshot(project, pages)
    const nextPages = pages.map((item) => item.id === page.id ? page : item)
    const nextProject = { ...project, updatedAt: new Date().toISOString() }
    history.push({ label, before, after: snapshot(nextProject, nextPages) })
    set({ project: nextProject, pages: nextPages, activePage: page, saveStatus: 'unsaved' })
    void get().persist()
  },
  updateSelected: (patch) => {
    const { activePage, selectedIds } = get()
    if (!activePage || selectedIds.length !== 1) return
    get().commitPage('Change property', updateNode(activePage, selectedIds[0], patch))
  },
  createNode: (type, x = 120, y = 120, width = 220, height = 140) => {
    const page = get().activePage
    if (!page) return
    const node = type === 'frame' ? makeFrame('Frame', x, y, width, height) : type === 'text' ? makeText('Text', x, y, 'Text') : makeRect('Rectangle', x, y, width, height)
    get().commitPage(`Create ${type}`, addNode(page, node))
    set({ selectedIds: [node.id], tool: 'select' })
  },
  addImage: async (file) => {
    const { project, activePage } = get()
    if (!project || !activePage) return
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
    const asset: AssetRecord = { id: ids.node(), projectId: project.id, name: file.name, type: file.type, dataUrl, createdAt: new Date().toISOString() }
    await saveAsset(asset)
    const node = { ...makeRect('Image', 160, 160, 320, 220, '#ddd', 12), type: 'image' as const, src: dataUrl, assetId: asset.id, alt: file.name, objectFit: 'cover' as const }
    get().commitPage('Add image', addNode(activePage, node))
    set({ selectedIds: [node.id], assets: [...get().assets, asset] })
  },
  deleteSelection: () => {
    const page = get().activePage
    if (!page) return
    get().commitPage('Delete', deleteNodes(page, get().selectedIds))
    set({ selectedIds: [] })
  },
  cut: () => { get().copy(); get().deleteSelection() },
  duplicateSelection: () => { get().copy(); get().paste() },
  copy: () => {
    const page = get().activePage
    if (!page) return
    set({ clipboard: get().selectedIds.map((id) => page.nodes[id]).filter(Boolean) })
  },
  paste: () => {
    const page = get().activePage
    if (!page || get().clipboard.length === 0) return
    let next = page
    const idsNew: NodeId[] = []
    get().clipboard.forEach((node) => {
      const copy = { ...structuredClone(node), id: ids.node(), x: node.x + 24, y: node.y + 24, parentId: null, children: [] }
      next = addNode(next, copy)
      idsNew.push(copy.id)
    })
    get().commitPage('Paste', next)
    set({ selectedIds: idsNew })
  },
  undo: () => {
    const { project, pages, history } = get()
    if (!project) return
    const restored = history.undo(snapshot(project, pages))
    set({ ...restored, activePage: active(restored.project, restored.pages), saveStatus: 'unsaved' })
    void get().persist()
  },
  redo: () => {
    const { project, pages, history } = get()
    if (!project) return
    const restored = history.redo(snapshot(project, pages))
    set({ ...restored, activePage: active(restored.project, restored.pages), saveStatus: 'unsaved' })
    void get().persist()
  },
  setViewport: (x, y, zoom) => {
    const page = get().activePage
    if (!page) return
    const next = { ...page, viewportState: { x, y, zoom } }
    set({ pages: get().pages.map((item) => item.id === next.id ? next : item), activePage: next })
  },
  addPage: () => {
    const project = get().project
    if (!project) return
    const page = { id: ids.page(), projectId: project.id, name: `Page ${get().pages.length + 1}`, nodes: {}, rootNodeIds: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), backgroundColor: '#f7f6f2', viewportState: { x: 240, y: 100, zoom: 1 } } as Page
    const frame = makeFrame('Desktop 1', 80, 80, 1280, 832)
    page.nodes[frame.id] = frame
    page.rootNodeIds.push(frame.id)
    set({ project: { ...project, pages: [...project.pages, page.id], activePageId: page.id }, pages: [...get().pages, page], activePage: page, selectedIds: [] })
    void get().persist()
  },
  setActivePage: (id) => {
    const project = get().project
    if (!project) return
    const nextProject = { ...project, activePageId: id as never }
    set({ project: nextProject, activePage: active(nextProject, get().pages), selectedIds: [] })
  },
  renamePage: (id, name) => {
    const pages = get().pages.map((page) => page.id === id ? { ...page, name } : page)
    set({ pages, activePage: active(get().project, pages) })
    void get().persist()
  },
  duplicatePage: (id) => {
    const page = get().pages.find((item) => item.id === id)
    const project = get().project
    if (!page || !project) return
    const copy = { ...structuredClone(page), id: ids.page(), name: `${page.name} Copy`, projectId: project.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    const nextProject = { ...project, pages: [...project.pages, copy.id], activePageId: copy.id }
    set({ project: nextProject, pages: [...get().pages, copy], activePage: copy })
    void get().persist()
  },
  deletePage: (id) => {
    const project = get().project
    if (!project || project.pages.length <= 1) return
    const pages = get().pages.filter((page) => page.id !== id)
    const nextProject = { ...project, pages: pages.map((page) => page.id), activePageId: pages[0].id }
    set({ project: nextProject, pages, activePage: pages[0], selectedIds: [] })
    void get().persist()
  },
  createComponent: () => {
    const { activePage, selectedIds, project } = get()
    if (!activePage || !project || selectedIds.length === 0) return
    const id = ids.component()
    const node = { ...makeFrame('Component', 120, 120, 240, 160), type: 'component' as const, componentId: id, description: '' }
    const component = { id, name: 'Component', rootNodeId: node.id, nodeIds: [node.id, ...selectedIds], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    get().commitPage('Create component', addNode(activePage, node))
    set({ project: { ...project, components: { ...project.components, [id]: component } }, selectedIds: [node.id] })
    void get().persist()
  },
  insertInstance: (componentId) => {
    const page = get().activePage
    if (!page) return
    const node = { ...makeFrame('Instance', 180, 180, 240, 160), type: 'instance' as const, componentId, overrides: {} }
    get().commitPage('Insert instance', addNode(page, node))
    set({ selectedIds: [node.id] })
  },
  insertBuiltin: (kind) => {
    const page = get().activePage; if (!page) return
    const baseX = 220; const baseY = 180
    let next = page
    const created: NodeId[] = []
    const add = (node: SceneNode, parent?: NodeId) => { next = addNode(next, node, parent ?? null); created.push(node.id); return node }
    if (kind.includes('Button')) { const r = add(makeRect(kind, baseX, baseY, 132, 40, kind.includes('Primary') ? '#171717' : '#ffffff', 10)); add(makeText('Label', baseX + 34, baseY + 11, kind.includes('Primary') ? 'Button' : kind, 14, kind.includes('Primary') ? '#ffffff' : '#262626'), r.id) }
    else if (kind.includes('Input')) { add(makeRect(kind, baseX, baseY, 240, 42, '#ffffff', 10)); add(makeText('Placeholder', baseX + 14, baseY + 12, 'Enter value', 14, '#737373')) }
    else if (kind.includes('Card') || kind.includes('Stat') || kind.includes('Metric') || kind.includes('Pricing')) { const card = add(makeRect(kind, baseX, baseY, 280, 180, '#ffffff', 16)); add(makeText('Title', baseX + 20, baseY + 20, kind, 18), card.id); add(makeText('Body', baseX + 20, baseY + 58, 'Editable component built from real nodes.', 14, '#737373'), card.id) }
    else if (kind.includes('Table')) { const table = add(makeRect('Table', baseX, baseY, 420, 220, '#ffffff', 14)); Array.from({length:4}).forEach((_,i)=>add(makeRect(`Row ${i+1}`, baseX+12, baseY+16+i*46, 396, 34, i===0?'#f5f5f5':'#ffffff', 6), table.id)) }
    else if (kind.includes('Chart')) { const frame = add(makeRect('Dashboard chart', baseX, baseY, 320, 220, '#ffffff', 16)); [60,100,76,140,112].forEach((h,i)=>add(makeRect(`Bar ${i+1}`, baseX+40+i*48, baseY+180-h, 24, h, '#2563eb', 6), frame.id)) }
    else { const frame = add(makeFrame(kind, baseX, baseY, 280, 120)); add(makeText(`${kind} label`, baseX + 18, baseY + 18, kind, 16), frame.id) }
    get().commitPage(`Insert ${kind}`, next); set({ selectedIds: created.slice(0,1) })
  },
  detachInstance: () => get().updateSelected({ type: 'group', name: 'Detached Instance' } as Partial<SceneNode>),
  groupSelection: () => {
    const { activePage, selectedIds } = get()
    if (!activePage || selectedIds.length < 2) return
    const selected = selectedIds.map((id) => activePage.nodes[id]).filter(Boolean)
    const minX = Math.min(...selected.map((n) => n.x)); const minY = Math.min(...selected.map((n) => n.y))
    const maxX = Math.max(...selected.map((n) => n.x + n.width)); const maxY = Math.max(...selected.map((n) => n.y + n.height))
    const group = { ...makeFrame('Group', minX, minY, maxX - minX, maxY - minY), type: 'group' as const, fills: [] }
    const page = addNode(activePage, group)
    selectedIds.forEach((id) => { page.nodes[id] = { ...page.nodes[id], parentId: group.id, x: page.nodes[id].x - minX, y: page.nodes[id].y - minY }; page.rootNodeIds = page.rootNodeIds.filter((root) => root !== id); page.nodes[group.id].children.push(id) })
    get().commitPage('Group', page); set({ selectedIds: [group.id] })
  },
  ungroupSelection: () => {
    const page = get().activePage
    if (!page) return
    const next = structuredClone(page)
    get().selectedIds.forEach((id) => {
      const group = next.nodes[id]
      if (!group || group.children.length === 0) return
      group.children.forEach((childId) => { const child = next.nodes[childId]; next.nodes[childId] = { ...child, parentId: null, x: child.x + group.x, y: child.y + group.y }; next.rootNodeIds.push(childId) })
      delete next.nodes[id]; next.rootNodeIds = next.rootNodeIds.filter((root) => root !== id)
    })
    get().commitPage('Ungroup', next)
  },
  toggleLockSelection: () => {
    const page = get().activePage; if (!page) return
    const shouldLock = get().selectedIds.some((id) => !page.nodes[id]?.locked)
    let next = page; get().selectedIds.forEach((id) => { next = updateNode(next, id, { locked: shouldLock } as never) })
    get().commitPage('Toggle lock', next)
  },
  toggleVisibilitySelection: () => {
    const page = get().activePage; if (!page) return
    const shouldShow = get().selectedIds.some((id) => !page.nodes[id]?.visible)
    let next = page; get().selectedIds.forEach((id) => { next = updateNode(next, id, { visible: shouldShow } as never) })
    get().commitPage('Toggle visibility', next)
  },
  arrangeSelection: (mode) => {
    const page = get().activePage; if (!page) return
    const roots = [...page.rootNodeIds]
    get().selectedIds.forEach((id) => {
      const index = roots.indexOf(id); if (index < 0) return
      roots.splice(index, 1)
      const nextIndex = mode === 'front' ? roots.length : mode === 'back' ? 0 : mode === 'forward' ? Math.min(roots.length, index + 1) : Math.max(0, index - 1)
      roots.splice(nextIndex, 0, id)
    })
    get().commitPage('Arrange', { ...page, rootNodeIds: roots })
  },
  nudgeSelection: (dx, dy) => {
    const page = get().activePage; if (!page) return
    let next = page
    get().selectedIds.forEach((id) => { const node = next.nodes[id]; if (node && !node.locked) next = updateNode(next, id, { x: node.x + dx, y: node.y + dy } as never) })
    get().commitPage('Nudge', next)
  },
  zoomBy: (factor) => { const page = get().activePage; if (page) get().setViewport(page.viewportState.x, page.viewportState.y, Math.max(0.05, Math.min(8, page.viewportState.zoom * factor))) },
  zoomTo: (zoom) => { const page = get().activePage; if (page) get().setViewport(page.viewportState.x, page.viewportState.y, Math.max(0.05, Math.min(8, zoom))) },
  zoomToFit: () => { const page = get().activePage; if (page) get().setViewport(220, 80, 0.65) },
  exportJson: () => {
    const { project, pages, assets } = get()
    return project ? exportProject(project, pages, assets) : null
  },
  persist: async () => {
    const { project, pages } = get()
    if (!project) return
    set({ saveStatus: 'saving' })
    await saveProject(project, pages)
    set({ saveStatus: 'saved' })
  },
}))
