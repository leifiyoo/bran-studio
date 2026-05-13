'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { boundsForNodes, normalizeRect, type Point, type Rect } from '@/editor/core/geometry'
import { hitTest, hitTestSelection } from '@/editor/core/hit-testing'
import { snapRect, type Guide } from '@/editor/core/snapping'
import { handleEditorShortcut } from '@/editor/core/shortcuts'
import { screenToWorld, zoomAtPoint } from '@/editor/core/transforms'
import { useEditorStore } from '@/editor/store/editor-store'
import type { NodeId } from '@/editor/core/scene-types'
import { useUiStore } from '@/editor/store/ui-store'
import { GridOverlay } from './GridOverlay'
import { GuidesOverlay } from './GuidesOverlay'
import { SceneNodeRenderer } from './SceneNodeRenderer'
import { SelectionOverlay, type ResizeHandle } from './SelectionOverlay'

export function CanvasViewport() {
  const { activePage: page, selectedIds, tool, select, commitPage, setViewport, createNode, updateSelected, project } = useEditorStore()
  const openContextMenu = useUiStore((s)=>s.openContextMenu)
  const viewport = page?.viewportState ?? { x: 0, y: 0, zoom: 1 }
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<{ mode: 'pan' | 'move' | 'box' | 'resize'; start: Point; ids?: NodeId[]; original?: Record<string, {x:number;y:number;width:number;height:number}>; box?: Rect; handle?: ResizeHandle } | null>(null)
  const [box, setBox] = useState<Rect | null>(null)
  const [guides, setGuides] = useState<Guide[]>([])
  const nodes = useMemo(() => page ? Object.values(page.nodes) : [], [page])
  const selectedNodes = page ? selectedIds.map((id)=>page.nodes[id]).filter(Boolean) : []
  const selectionBounds = boundsForNodes(selectedNodes)

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

  if (!page || !project) return <div className="grid flex-1 place-items-center text-muted-foreground">Loading editor...</div>
  const localPoint = (event: React.PointerEvent | React.WheelEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    return screenToWorld({ x: event.clientX - rect.left, y: event.clientY - rect.top }, viewport)
  }
  const pointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0 && event.button !== 1) return
    const start = localPoint(event)
    if (tool === 'hand' || event.button === 1 || event.nativeEvent.getModifierState('Space')) drag.current = { mode: 'pan', start: { x: event.clientX, y: event.clientY } }
    else if (tool === 'rectangle' || tool === 'frame' || tool === 'text') {
      createNode(
        tool === 'rectangle' ? 'rectangle' : tool === 'frame' ? 'frame' : 'text',
        start.x,
        start.y,
        tool === 'frame' ? 360 : tool === 'rectangle' ? 160 : 180,
        tool === 'frame' ? 240 : tool === 'rectangle' ? 100 : 48,
      )
      return
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
    if (!drag.current) return
    if (drag.current.mode === 'pan') { setViewport(viewport.x + event.movementX, viewport.y + event.movementY, viewport.zoom); return }
    const point = localPoint(event)
    if (drag.current.mode === 'box') { const next = normalizeRect({ x: drag.current.start.x, y: drag.current.start.y, width: point.x - drag.current.start.x, height: point.y - drag.current.start.y }); setBox(next); return }
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
          const patch = { x: original.x, y: original.y, width: original.width, height: original.height }
          if (drag.current.handle?.includes('e')) patch.width = Math.max(8, original.width + dx)
          if (drag.current.handle?.includes('s')) patch.height = Math.max(8, original.height + dy)
          if (drag.current.handle?.includes('w')) { patch.x = original.x + dx; patch.width = Math.max(8, original.width - dx) }
          if (drag.current.handle?.includes('n')) { patch.y = original.y + dy; patch.height = Math.max(8, original.height - dy) }
          next = { ...next, nodes: { ...next.nodes, [id]: { ...node, ...patch } } }
          return
        }
        const moving = { x: original.x + dx, y: original.y + dy, width: original.width, height: original.height }
        const snap = snapRect(page, moving, node.id, project.settings.gridSize, project.settings.snapToGrid)
        guideList.push(...snap.guides)
        next = { ...next, nodes: { ...next.nodes, [id]: { ...node, x: snap.x, y: snap.y } } }
      })
      useEditorStore.setState({ activePage: next, pages: useEditorStore.getState().pages.map((p)=>p.id === next.id ? next : p) })
      setGuides(guideList)
    }
  }
  const pointerUp = () => {
    if (drag.current?.mode === 'box' && box) select(hitTestSelection(page, box))
    if (drag.current?.mode === 'move' || drag.current?.mode === 'resize') commitPage(drag.current.mode === 'move' ? 'Move' : 'Resize', useEditorStore.getState().activePage!)
    drag.current = null
    setBox(null); setGuides([])
  }
  const wheel = (event: React.WheelEvent) => {
    event.preventDefault()
    if (event.ctrlKey || event.metaKey) {
      const rect = ref.current!.getBoundingClientRect()
      const next = zoomAtPoint(viewport, { x: event.clientX - rect.left, y: event.clientY - rect.top }, viewport.zoom * (event.deltaY > 0 ? 0.9 : 1.1))
      setViewport(next.x, next.y, next.zoom)
    } else setViewport(viewport.x - (event.shiftKey ? event.deltaY : event.deltaX), viewport.y - (event.shiftKey ? 0 : event.deltaY), viewport.zoom)
  }
  const resizeStart = (event: React.PointerEvent, handle: ResizeHandle) => {
    event.stopPropagation()
    const start = localPoint(event)
    drag.current = { mode: 'resize', start, handle, ids: selectedIds, original: Object.fromEntries(selectedIds.map((id)=>[id, { x: page.nodes[id].x, y: page.nodes[id].y, width: page.nodes[id].width, height: page.nodes[id].height }])) }
    ;(event.currentTarget as SVGElement).setPointerCapture(event.pointerId)
  }
  return (
    <div ref={ref} className="relative flex-1 overflow-hidden bg-[#222222]" onWheel={wheel}>
      <svg data-testid="canvas" className="h-full w-full touch-none" onContextMenu={contextMenu} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp}>
        <GridOverlay gridSize={project.settings.gridSize} zoom={viewport.zoom}/>
        <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.zoom})`}>
          <rect x="-20000" y="-20000" width="40000" height="40000" fill="url(#grid-minor)"/>
          <rect x="-20000" y="-20000" width="40000" height="40000" fill="url(#grid-major)"/>
          {nodes.map((node)=><SceneNodeRenderer key={node.id} node={node} selected={selectedIds.includes(node.id)} onPointerDown={(e)=>{ e.stopPropagation(); pointerDown(e) }} onDoubleClick={(node)=> node.type === 'text' && updateSelected({ text: prompt('Edit text', node.text) ?? node.text } as never)}/>)}
          <SelectionOverlay rect={selectionBounds} zoom={viewport.zoom} onResizeStart={resizeStart}/>
          <SelectionOverlay rect={box} zoom={viewport.zoom}/>
          <GuidesOverlay guides={guides}/>
        </g>
      </svg>
      <div className="absolute bottom-4 left-4 rounded-[5px] border border-[#373737] bg-[#2A2A2A] px-3 py-1 text-xs text-[#FFFFFFA6]">{Math.round(viewport.zoom * 100)}%</div>
    </div>
  )
}
