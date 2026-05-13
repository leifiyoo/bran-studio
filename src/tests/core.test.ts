import { describe, expect, it } from 'vitest'
import { boundsForNodes, containsPoint, normalizeRect, snapValue } from '@/editor/core/geometry'
import { hitTest } from '@/editor/core/hit-testing'
import { snapRect } from '@/editor/core/snapping'
import { screenToWorld, worldToScreen, zoomAtPoint } from '@/editor/core/transforms'
import { handleEditorShortcut } from '@/editor/core/shortcuts'
import { History } from '@/editor/core/history'
import { applyAutoLayout } from '@/editor/core/layout-engine'
import { makeFrame, makeProjectFromTemplate, makeRect } from '@/editor/core/templates'
import { exportProject } from '@/editor/core/export'
import { importProjectJson } from '@/editor/core/import'
import { addNode } from '@/editor/core/commands'

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
})

describe('layout and import export', () => {
  it('positions children deterministically and validates exported JSON', () => {
    const { project, pages } = makeProjectFromTemplate('blank')
    const frame = pages[0].nodes[pages[0].rootNodeIds[0]]
    const a = makeRect('A', 0, 0, 50, 50)
    const b = makeRect('B', 0, 0, 50, 50)
    let page = addNode(pages[0], a, frame.id)
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
