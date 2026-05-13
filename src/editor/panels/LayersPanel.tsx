'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icon, icons } from '@/components/ui/icon'
import { useEditorStore } from '@/editor/store/editor-store'
import { useUiStore } from '@/editor/store/ui-store'
import type { NodeId } from '@/editor/core/scene-types'

export function LayersPanel() {
  const { activePage, selectedIds, select, updateSelected } = useEditorStore()
  const openContextMenu = useUiStore((s)=>s.openContextMenu)
  if (!activePage) return null
  const row = (id: NodeId, depth = 0) => { const node = activePage.nodes[id]; if (!node) return null; return <div key={id}><div className={`flex items-center gap-1 rounded px-1 py-1 ${selectedIds.includes(id)?'bg-accent text-accent-foreground':''}`} style={{paddingLeft: 8 + depth * 14}} onContextMenu={(event)=>{event.preventDefault(); select([id]); openContextMenu({x:event.clientX,y:event.clientY,scope:'layers'})}}><button className="flex-1 text-left text-xs" onClick={()=>select([id])}>{node.name}</button><Button size="icon" variant="ghost" onClick={()=>{select([id]); updateSelected({ visible: !node.visible } as never)}}><Icon icon={node.visible ? icons.eye : icons.unavailable} size={13}/></Button><Button size="icon" variant="ghost" onClick={()=>{select([id]); updateSelected({ locked: !node.locked } as never)}}><Icon icon={icons.lock} size={13}/></Button></div>{node.children.map((child)=>row(child, depth+1))}</div> }
  return <div className="p-3"><strong className="text-sm">Layers</strong><div className="mt-3 space-y-1">{activePage.rootNodeIds.map((id)=>row(id))}</div>{selectedIds.length===1 && <Input className="mt-4" value={activePage.nodes[selectedIds[0]]?.name ?? ''} onChange={(e)=>updateSelected({ name: e.target.value } as never)}/>}</div>
}
