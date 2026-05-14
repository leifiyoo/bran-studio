'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { boundsForNodes, normalizeRect, type Point, type Rect } from '@/editor/core/geometry'
import { hitTest, hitTestSelection } from '@/editor/core/hit-testing'
import { resizeRectFromHandle } from '@/editor/core/resize'
import { detectEqualSpacing, type SpacingMatch } from '@/editor/core/smart-spacing'
import { snapRect, type Guide } from '@/editor/core/snapping'
import { handleEditorShortcut } from '@/editor/core/shortcuts'
import { screenToWorld, viewportForWheel } from '@/editor/core/transforms'
import { useEditorStore } from '@/editor/store/editor-store'
import type { NodeId } from '@/editor/core/scene-types'
import { useUiStore } from '@/editor/store/ui-store'
import { GridOverlay } from './GridOverlay'
import { GuidesOverlay } from './GuidesOverlay'
import { LayoutGuidesOverlay } from './LayoutGuidesOverlay'
import { SceneNodeRenderer } from './SceneNodeRenderer'
import { SelectionOverlay, type ResizeHandle } from './SelectionOverlay'
import { SpacingOverlay } from './SpacingOverlay'

export function CanvasViewport() {
  const { activePage: page, selectedIds, tool, select, commitPage, setViewport, createNode, updateSelected, project } = useEditorStore()
  const openContextMenu = useUiStore((s)=>s.openContextMenu)
  const viewport = page?.viewportState ?? { x: 0, y: 0, zoom: 1 }
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<{ mode: 'pan' | 'move' | 'box' | 'resize' | 'create'; start: Point; ids?: NodeId[]; original?: Record<string, {x:number;y:number;width:number;height:number}>; box?: Rect; handle?: ResizeHandle; createType?: 'frame' | 'rectangle' | 'text' } | null>(null)
  const lastPointer = useRef<Point>({ x: 0, y: 0 })
  const [box, setBox] = useState<Rect | null>(null)
  const [guides, setGuides] = useState<Guide[]>([])
  const [spacing, setSpacing] = useState<SpacingMatch[]>([])
  const nodes = useMemo(() => page ? Object.values(page.nodes) : [], [page])
  const selectedNodes = page ? selectedIds.map((id)=>page.nodes[id]).filter(Boolean) : []
  const selectionBounds = boundsForNodes(selectedNodes)

  const applyWheel = (client: Point, wheel: { deltaX: number; deltaY: number; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }, rect: DOMRect) => {
    const store = useEditorStore.getState()
    const activePage = store.activePage
    if (!activePage) return
    const next = viewportForWheel(activePage.viewportState, { x: client.x - rect.left, y: client.y - rect.top }, wheel)
    store.setViewport(next.x, next.y, next.zoom)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const store = useEditorStore.getState()
      handleEditorShortcut(event, {
        setTool: store.setTool, undo: store.undo, redo: store.redo, copy: store.copy, paste: store.paste, cut: store.cut, duplicate: store.duplicateSelection,
        selectAll: () => store.activePage && store.select(Object.keys(store.activePage.nodes) as never), clearSelection: () => store.select([]), delete: store.deleteSelection,
        group: store.groupSelection, ungroup: store.ungroupSelection, toggleLock: store.toggleLockSelection, toggleVisibility: store.toggleVisibilitySelection,
        bringForward: () => store.arrangeSelection('forward'), sendBackward: () => store.arrangeSelection('backward'), bringToFront: () => store.arrangeSelection('front'), sendToBack: () => store.arrangeSelection('back'),
        nudge: store.nudgeSelection, zoomIn: () => store.zoomBy(1.15), zoomOut: () => store.zoomBy(1 / 1.15), zoomFit: store.zoomToFit, zoom100: () => store.zoomTo(1), save: () => void store.persist(),
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const onWheel = (event: WheelEvent) => {
      const rect = element.getBoundingClientRect()
      const client = event.clientX || event.clientY ? { x: event.clientX, y: event.clientY } : lastPointer.current
      if (client.x < rect.left || client.x > rect.right || client.y < rect.top || client.y > rect.bottom) return
      event.preventDefault()
      event.stopPropagation()
      applyWheel(client, event, rect)
    }
    element.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('wheel', onWheel, { passive: false, capture: true })
    document.addEventListener('wheel', onWheel, { passive: false, capture: true })
    return () => {
      element.removeEventListener('wheel', onWheel)
      window.removeEventListener('wheel', onWheel, { capture: true })
      document.removeEventListener('wheel', onWheel, { capture: true })
    }
  }, [])

  if (!page || !project) return <div className="grid flex-1 place-items-center text-muted-foreground">Loading editor...</div>
  const localPoint = (event: React.PointerEvent | React.WheelEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    return screenToWorld({ x: event.clientX - rect.left, y: event.clientY - rect.top }, viewport)
  }
  const pointerDown = (event: React.PointerEvent) => {
    lastPointer.current = { x: event.clientX, y: event.clientY }
    if (event.button !== 0 && event.button !== 1) return
    const start = localPoint(event)
    if (tool === 'hand' || event.button === 1 || event.nativeEvent.getModifierState('Space')) drag.current = { mode: 'pan', start: { x: event.clientX, y: event.clientY } }
    else if (tool === 'frame' || tool === 'rectangle' || tool === 'text') {
      const initialBox = { x: start.x, y: start.y, width: 0, height: 0 }
      drag.current = { mode: 'create', start, box: initialBox, createType: tool }
      setBox(initialBox)
    }
    else {
      const hit = hitTest(page, start)
      if (hit) {
        const dragIds = event.shiftKey ? [...new Set([...selectedIds, hit])] : selectedIds.includes(hit) ? selectedIds : [hit]
        if (!selectedIds.includes(hit)) select(dragIds)
        drag.current = { mode: 'move', start, ids: dragIds, original: Object.fromEntries(dragIds.map((id)=>[id, { x: page.nodes[id].x, y: page.nodes[id].y, width: page.nodes[id].width, height: page.nodes[id].height }])) }
      } else { const initialBox = { x: start.x, y: start.y, width: 0, height: 0 }; select([]); drag.current = { mode: 'box', start, box: initialBox }; setBox(initialBox) }
    }
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }
  const contextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    const point = localPoint(event as unknown as React.PointerEvent)
    const hit = hitTest(page, point)
    if (hit && !selectedIds.includes(hit)) select([hit])
    openContextMenu({ x: event.clientX, y: event.clientY, scope: hit ? 'node' : 'canvas', world: point })
  }
  const pointerMove = (event: React.PointerEvent) => {
    lastPointer.current = { x: event.clientX, y: event.clientY }
    if (!drag.current) return
    if (drag.current.mode === 'pan') { setViewport(viewport.x + event.movementX, viewport.y + event.movementY, viewport.zoom); return }
    const point = localPoint(event)
    if (drag.current.mode === 'box' || drag.current.mode === 'create') { const next = normalizeRect({ x: drag.current.start.x, y: drag.current.start.y, width: point.x - drag.current.start.x, height: point.y - drag.current.start.y }); setBox(next); return }
    if ((drag.current.mode === 'move' || drag.current.mode === 'resize') && drag.current.original) {
      let next = page
      const guideList: Guide[] = []
      const activeIds = drag.current.ids ?? selectedIds
      const dx = point.x - drag.current.start.x
      const dy = point.y - drag.current.start.y
      activeIds.forEach((id) => {
        const node = page.nodes[id]
        const original = drag.current?.original?.[id]
        if (!node || !original || node.locked) return
        if (drag.current?.mode === 'resize') {
          const original = drag.current.original?.[id]
          if (!original) return
          const patch = resizeRectFromHandle(original, drag.current.handle ?? 'se', dx, dy, { preserveAspectRatio: event.shiftKey, resizeFromCenter: event.altKey, minSize: 8 })
          next = { ...next, nodes: { ...next.nodes, [id]: { ...node, ...patch } } }
          return
        }
        const moving = { x: original.x + dx, y: original.y + dy, width: original.width, height: original.height }
        const snap = snapRect(page, moving, node.id, project.settings.gridSize, project.settings.snapToGrid)
        guideList.push(...snap.guides)
        next = { ...next, nodes: { ...next.nodes, [id]: { ...node, x: snap.x, y: snap.y } } }
        setSpacing(detectEqualSpacing(Object.values(page.nodes).filter((candidate) => candidate.id !== node.id), { ...moving, x: snap.x, y: snap.y }, 4))
      })
      useEditorStore.setState({ activePage: next, pages: useEditorStore.getState().pages.map((p)=>p.id === next.id ? next : p) })
      setGuides(guideList)
    }
  }
  const pointerUp = () => {
    if (drag.current?.mode === 'box' && box) select(hitTestSelection(page, box))
    if (drag.current?.mode === 'create' && box && box.width >= 8 && box.height >= 8) createNode(drag.current.createType ?? 'frame', box.x, box.y, Math.max(8, box.width), Math.max(drag.current.createType === 'text' ? 24 : 8, box.height))
    if (drag.current?.mode === 'move' || drag.current?.mode === 'resize') commitPage(drag.current.mode === 'move' ? 'Move' : 'Resize', useEditorStore.getState().activePage!)
    drag.current = null
    setBox(null); setGuides([]); setSpacing([])
  }
  const resizeStart = (event: React.PointerEvent, handle: ResizeHandle) => {
    event.stopPropagation()
    const start = localPoint(event)
    drag.current = { mode: 'resize', start, handle, ids: selectedIds, original: Object.fromEntries(selectedIds.map((id)=>[id, { x: page.nodes[id].x, y: page.nodes[id].y, width: page.nodes[id].width, height: page.nodes[id].height }])) }
    ;(event.currentTarget as SVGElement).setPointerCapture(event.pointerId)
  }
  return (
    <div ref={ref} className="relative flex-1 overflow-hidden bg-[#222222]" onWheelCapture={(event) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const client = event.clientX || event.clientY ? { x: event.clientX, y: event.clientY } : lastPointer.current
      if (client.x < rect.left || client.x > rect.right || client.y < rect.top || client.y > rect.bottom) return
      event.preventDefault()
      event.stopPropagation()
      applyWheel(client, event, rect)
    }}>
      <svg data-testid="canvas" className="h-full w-full touch-none" onContextMenu={contextMenu} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp}>
        <GridOverlay gridSize={project.settings.gridSize} zoom={viewport.zoom}/>
        <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.zoom})`}>
          {nodes.map((node)=><SceneNodeRenderer key={node.id} node={node} selected={selectedIds.includes(node.id)} onPointerDown={(e)=>{ e.stopPropagation(); pointerDown(e) }} onDoubleClick={(node)=> node.type === 'text' && updateSelected({ text: prompt('Edit text', node.text) ?? node.text } as never)}/>)}
          <rect x="-20000" y="-20000" width="40000" height="40000" fill="url(#grid-minor)" pointerEvents="none"/>
          <rect x="-20000" y="-20000" width="40000" height="40000" fill="url(#grid-major)" pointerEvents="none"/>
          {project.settings.showLayoutGuides && <LayoutGuidesOverlay nodes={nodes} />}
          <SelectionOverlay rect={selectionBounds} zoom={viewport.zoom} onResizeStart={resizeStart}/>
          <SelectionOverlay rect={box} zoom={viewport.zoom} variant={drag.current?.mode === 'create' ? 'create' : 'marquee'}/>
          <GuidesOverlay guides={guides}/>
          <SpacingOverlay matches={spacing} zoom={viewport.zoom}/>
        </g>
      </svg>
      <div className="absolute bottom-4 left-4 rounded-[5px] border border-[#373737] bg-[#2A2A2A] px-3 py-1 text-xs text-[#FFFFFFA6]">{Math.round(viewport.zoom * 100)}%</div>
    </div>
  )
}
