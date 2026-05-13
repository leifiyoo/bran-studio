'use client'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CanvasViewport } from '@/editor/render/CanvasViewport'
import { useEditorStore } from '@/editor/store/editor-store'
import { LeftSidebar } from '@/editor/panels/LeftSidebar'
import { PropertiesPanel } from '@/editor/panels/PropertiesPanel'
import { Toolbar } from '@/editor/panels/Toolbar'
import { useUiStore } from '@/editor/store/ui-store'
import { ContextMenu } from '@/editor/panels/ContextMenu'

export function EditorShell() {
  const params = useParams<{ projectId: string }>()
  const load = useEditorStore((s)=>s.load)
  const { activePage, selectedIds } = useEditorStore()
  const previewOpen = useUiStore((s)=>s.previewOpen); const setPreviewOpen = useUiStore((s)=>s.setPreviewOpen)
  useEffect(()=>{ if (params.projectId) void load(params.projectId as never) }, [load, params.projectId])
  const frame = activePage && activePage.nodes[selectedIds[0]]
  return <main className="flex h-screen flex-col overflow-hidden bg-[#222222]"><div className="relative flex min-h-0 flex-1"><LeftSidebar/><CanvasViewport/><Toolbar/><PropertiesPanel/></div><ContextMenu/>{previewOpen && frame && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-8" onClick={()=>setPreviewOpen(false)}><div style={{width: `min(${frame.width}px, calc(100vw - 96px))`, aspectRatio: `${frame.width}/${frame.height}`}} className="overflow-hidden rounded-xl bg-white shadow-2xl"><svg viewBox={`${frame.x} ${frame.y} ${frame.width} ${frame.height}`} className="h-full w-full">{activePage && Object.values(activePage.nodes).map((node)=><rect key={node.id} x={node.x} y={node.y} width={node.width} height={node.height} fill={node.fills[0]?.type === 'solid' ? node.fills[0].color : '#f5f5f5'} />)}</svg></div></div>}</main>
}
