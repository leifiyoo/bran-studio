import { describe, expect, it } from 'vitest'
import { boundsForNodes, containsPoint, normalizeRect, snapValue } from '@/editor/core/geometry'
import { hitTest } from '@/editor/core/hit-testing'
import { snapRect } from '@/editor/core/snapping'
import { viewportForWheel, screenToWorld, worldToScreen, zoomAtPoint } from '@/editor/core/transforms'
import { handleEditorShortcut } from '@/editor/core/shortcuts'
import { History } from '@/editor/core/history'
import { applyAutoLayout } from '@/editor/core/layout-engine'
import { makeFrame, makeProjectFromTemplate, makeRect } from '@/editor/core/templates'
import type { FrameNode } from '@/editor/core/scene-types'
import { exportProject } from '@/editor/core/export'
import { importProjectJson } from '@/editor/core/import'
import { addNode } from '@/editor/core/commands'
import { describeNodeForDevMode } from '@/editor/core/dev-inspect'
import { layoutGuideSegments } from '@/editor/core/layout-guides'
import { migrateExportPayload } from '@/editor/core/migrations'
import { resolveVariableValue } from '@/editor/core/variables'
import { resizeRectFromHandle } from '@/editor/core/resize'
import { detectEqualSpacing } from '@/editor/core/smart-spacing'

describe('geometry', () => {
  it('normalizes and tests bounds', () => {
    expect(normalizeRect({ x: 10, y: 10, width: -5, height: -8 })).toEqual({ x: 5, y: 2, width: 5, height: 8 })
    expect(containsPoint({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 5 })).toBe(true)
    expect(snapValue(13, 8)).toBe(16)
  })
})

describe('hit testing and snapping', () => {
  it('hits topmost visible node and snaps to grid/sibling', () => {
    const { pages } = makeProjectFromTemplate('blank')
    const rect = makeRect('Card', 100, 100, 100, 100)
    const page = addNode(pages[0], rect)
    expect(hitTest(page, { x: 110, y: 110 })).toBe(rect.id)
    expect(snapRect(page, { x: 103, y: 103, width: 100, height: 100 }, rect.id, 8, true).x).toBe(104)
  })
})

describe('transforms and history', () => {
  it('zooms around cursor and restores command history', () => {
    const next = zoomAtPoint({ x: 0, y: 0, zoom: 1 }, { x: 100, y: 100 }, 2)
    expect(next.x).toBe(-100)
    expect(screenToWorld({ x: 110, y: 120 }, { x: 10, y: 20, zoom: 2 })).toEqual({ x: 50, y: 50 })
    expect(worldToScreen({ x: 50, y: 50 }, { x: 10, y: 20, zoom: 2 })).toEqual({ x: 110, y: 120 })
    const h = new History<number>()
    h.push({ label: 'n', before: 1, after: 2 })
    expect(h.undo(2)).toBe(1)
    expect(h.redo(1)).toBe(2)
  })

  it('zooms canvas viewport from wheel input without changing the anchor point', () => {
    const next = viewportForWheel({ x: 0, y: 0, zoom: 1 }, { x: 100, y: 100 }, { deltaX: 0, deltaY: -120, ctrlKey: true, metaKey: false, shiftKey: false })
    expect(next.zoom).toBeGreaterThan(1)
    expect(screenToWorld({ x: 100, y: 100 }, next)).toEqual({ x: 100, y: 100 })
  })
})

describe('layout and import export', () => {
  it('positions children deterministically and validates exported JSON', () => {
    const { project, pages } = makeProjectFromTemplate('blank')
    const frame = makeFrame('Frame', 0, 0, 240, 100)
    const withFrame = addNode(pages[0], frame)
    const a = makeRect('A', 0, 0, 50, 50)
    const b = makeRect('B', 0, 0, 50, 50)
    let page = addNode(withFrame, a, frame.id)
    page = addNode(page, b, frame.id)
    page.nodes[frame.id] = { ...page.nodes[frame.id], layout: { ...frame.layout, mode: 'horizontal', gap: 10, padding: { top: 5, right: 5, bottom: 5, left: 5 } } }
    const laidOut = applyAutoLayout(page, frame.id)
    expect(laidOut.nodes[a.id].x).toBeGreaterThan(0)
    expect(laidOut.nodes[b.id].x).toBe(laidOut.nodes[a.id].x + a.width + 10)
    const exported = exportProject(project, [pages[0]], [])
    expect(importProjectJson(exported).project.id).toBe(project.id)
  })

  it('validates gradients and routes shortcuts centrally', () => {
    const { project, pages } = makeProjectFromTemplate('blank')
    const rect = makeRect('Gradient', 0, 0, 100, 100)
    rect.fills = [{ type: 'linear-gradient', angle: 135, alpha: 1, stops: [{ color: '#fff', position: 0, alpha: 1 }, { color: '#000', position: 100, alpha: 1 }] }]
    const json = exportProject(project, [addNode(pages[0], rect)], [])
    expect(importProjectJson(json).pages[0].nodes[rect.id].fills[0].type).toBe('linear-gradient')
    let undo = 0
    handleEditorShortcut(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true }), {
      setTool: () => undefined, undo: () => { undo += 1 }, redo: () => undefined, copy: () => undefined, paste: () => undefined, cut: () => undefined, duplicate: () => undefined,
      selectAll: () => undefined, clearSelection: () => undefined, delete: () => undefined, group: () => undefined, ungroup: () => undefined, toggleLock: () => undefined, toggleVisibility: () => undefined,
      bringForward: () => undefined, sendBackward: () => undefined, bringToFront: () => undefined, sendToBack: () => undefined, nudge: () => undefined, zoomIn: () => undefined, zoomOut: () => undefined, zoomFit: () => undefined, zoom100: () => undefined, save: () => undefined,
    })
    expect(undo).toBe(1)
  })

  it('computes bounds and creates unique copy ids through templates', () => {
    const one = makeRect('One', 0, 0, 10, 10)
    const two = makeFrame('Two', 10, 10, 20, 20)
    expect(boundsForNodes([one, two])?.width).toBe(30)
    expect(one.id).not.toBe(two.id)
  })
})

describe('figma paper foundation', () => {
  it('creates extended professional node metadata on new nodes', () => {
    const frame = makeFrame('Desktop', 0, 0, 1440, 900) as FrameNode
    expect(frame.blendMode).toBe('normal')
    expect(frame.layoutSizing.horizontal).toBe('fixed')
    expect(frame.exportSettings[0].format).toBe('png')
    expect(frame.devStatus).toBe('none')
    expect(frame.layoutGuides[0]).toMatchObject({ type: 'uniform', size: 8, visible: true })
  })

  it('migrates legacy exports to the latest schema without losing content', () => {
    const { project, pages } = makeProjectFromTemplate('blank')
    const legacy = {
      format: 'bran.project',
      version: 1,
      exportedAt: '2026-01-01T00:00:00.000Z',
      project: { ...project, version: 1 },
      pages,
      assets: [],
    }
    const migrated = migrateExportPayload(legacy)
    expect(migrated.version).toBe(2)
    expect(migrated.project.version).toBe(2)
    expect(migrated.pages[0].variableModeOverrides).toEqual({})
    const exported = JSON.stringify(migrated)
    expect(importProjectJson(exported).project.version).toBe(2)
  })

  it('computes layout guide segments for uniform, columns, and rows', () => {
    const frame = makeFrame('Guided frame', 10, 20, 120, 80) as FrameNode
    frame.layoutGuides = [
      { id: 'grid', type: 'uniform', size: 20, color: '#ffffff', opacity: 0.2, visible: true },
      { id: 'cols', type: 'columns', count: 3, gutter: 10, margin: 5, color: '#ff00aa', opacity: 0.35, visible: true },
      { id: 'rows', type: 'rows', count: 2, gutter: 8, margin: 4, color: '#00ffaa', opacity: 0.35, visible: true },
    ]
    const segments = layoutGuideSegments(frame)
    expect(segments.some((segment) => segment.kind === 'uniform')).toBe(true)
    expect(segments.filter((segment) => segment.kind === 'column').length).toBe(6)
    expect(segments.filter((segment) => segment.kind === 'row').length).toBe(4)
  })

  it('resolves variable aliases and mode overrides', () => {
    const { project } = makeProjectFromTemplate('blank')
    project.variableCollections = {
      colors: {
        id: 'colors',
        name: 'Colors',
        defaultModeId: 'light',
        modes: { light: { id: 'light', name: 'Light' }, dark: { id: 'dark', name: 'Dark' } },
        variables: {
          base: { id: 'base', name: 'Base', type: 'color', valuesByMode: { light: '#ffffff', dark: '#111111' } },
          surface: { id: 'surface', name: 'Surface', type: 'color', valuesByMode: { light: { type: 'alias', variableId: 'base' }, dark: { type: 'alias', variableId: 'base' } } },
        },
      },
    }
    expect(resolveVariableValue(project, 'surface', { colors: 'dark' })).toBe('#111111')
  })

  it('describes selected nodes for dev mode and code export', () => {
    const node = makeRect('CTA', 12, 24, 160, 48, '#2357ff', 12)
    node.strokes = [{ color: '#111111', alpha: 1, width: 2, position: 'inside', align: 'inside', cap: 'butt', join: 'miter', dash: [] }]
    const inspected = describeNodeForDevMode(node)
    expect(inspected.css).toContain('position: absolute;')
    expect(inspected.css).toContain('border-radius: 12px;')
    expect(inspected.tailwind).toContain('absolute')
    expect(inspected.measurements.width).toBe(160)
  })
})

describe('editor feel sprint', () => {
  it('creates white rectangles without default strokes', () => {
    const rect = makeRect('Rectangle', 0, 0, 120, 80)
    expect(rect.fills[0]).toMatchObject({ type: 'solid', color: '#ffffff', alpha: 1 })
    expect(rect.strokes).toEqual([])
  })

  it('creates frames with square corners by default', () => {
    const frame = makeFrame('Frame', 0, 0, 320, 240)
    expect(frame.cornerRadius).toBe(0)
  })

  it('preserves aspect ratio and supports center resizing', () => {
    const original = { x: 10, y: 20, width: 200, height: 100 }
    const proportional = resizeRectFromHandle(original, 'se', 40, 10, { preserveAspectRatio: true, resizeFromCenter: false, minSize: 8 })
    expect(proportional.width / proportional.height).toBeCloseTo(2)
    const centered = resizeRectFromHandle(original, 'e', 20, 0, { preserveAspectRatio: false, resizeFromCenter: true, minSize: 8 })
    expect(centered.x).toBe(-10)
    expect(centered.width).toBe(240)
  })

  it('detects equal spacing candidates while moving', () => {
    const left = makeRect('Left', 0, 0, 100, 100)
    const middle = makeRect('Middle', 150, 0, 100, 100)
    const moving = { x: 300, y: 0, width: 100, height: 100 }
    const matches = detectEqualSpacing([left, middle], moving, 4)
    expect(matches).toContainEqual(expect.objectContaining({ orientation: 'horizontal', spacing: 50 }))
  })

  it('ships common export presets for production handoff', () => {
    const rect = makeRect('Exportable', 0, 0, 100, 100)
    expect(rect.exportSettings.map((setting) => setting.format)).toEqual(['png', 'jpg', 'svg', 'webp', 'avif', 'pdf'])
  })
})
