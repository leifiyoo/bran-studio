'use client'

import { useEffect } from 'react'
import { Icon, icons } from '@/components/ui/icon'
import { useEditorStore } from '@/editor/store/editor-store'
import { useUiStore } from '@/editor/store/ui-store'

function MenuItem({ label, onClick, icon = icons.forward, shortcut, disabled = false }: { label: string; onClick: () => void; icon?: typeof icons.forward; shortcut?: string; disabled?: boolean }) {
  return <button disabled={disabled} className="flex h-7 w-full items-center gap-2 rounded-[5px] px-2 text-left text-xs text-[#FFFFFFE6] hover:bg-[#FFFFFF12] disabled:cursor-not-allowed disabled:text-[#FFFFFF55]" onClick={onClick}><Icon icon={icon} size={14}/><span className="min-w-0 flex-1 truncate">{label}</span>{shortcut && <span className="text-[11px] text-[#FFFFFF73]">{shortcut}</span>}</button>
}

export function ContextMenu() {
  const menu = useUiStore((s)=>s.contextMenu)
  const close = useUiStore((s)=>s.closeContextMenu)
  const store = useEditorStore()
  useEffect(() => {
    if (!menu) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close()
    const onPointer = () => close()
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('pointerdown', onPointer) }
  }, [menu, close])
  if (!menu) return null
  const run = (fn: () => void) => { fn(); close() }
  const x = Math.min(menu.x, window.innerWidth - 232)
  const y = Math.min(menu.y, window.innerHeight - 420)
  const node = store.activePage && store.selectedIds.length === 1 ? store.activePage.nodes[store.selectedIds[0]] : null
  return <div className="fixed z-[80] w-60 rounded-[8px] border border-[#4A4A4A] bg-[#2F2F2F] p-1.5 shadow-[0_18px_70px_-26px_rgba(0,0,0,.75)] [font-synthesis:none]" style={{ left: x, top: y }} onPointerDown={(e)=>e.stopPropagation()}>
    {menu.scope === 'canvas' ? <>
      <MenuItem label="Paste here" icon={icons.copy} shortcut="Ctrl V" onClick={()=>run(store.paste)}/>
      <MenuItem label="Create frame" icon={icons.frame} shortcut="F" onClick={()=>run(()=>store.createNode('frame', menu.world?.x, menu.world?.y, 360, 240))}/>
      <MenuItem label="Add text" icon={icons.text} shortcut="T" onClick={()=>run(()=>store.createNode('text', menu.world?.x, menu.world?.y, 160, 40))}/>
      <div className="my-1 h-px bg-[#FFFFFF14]"/>
      <MenuItem label="Select all" icon={icons.cursor} shortcut="Ctrl A" onClick={()=>run(()=>store.activePage && store.select(Object.keys(store.activePage.nodes) as never))}/>
      <MenuItem label="Zoom to fit" icon={icons.reload} shortcut="Ctrl 0" onClick={()=>run(store.zoomToFit)}/>
    </> : <>
      <MenuItem label="Rename" icon={icons.text} onClick={()=>run(()=>{ if (node) store.updateSelected({ name: prompt('Layer name', node.name) ?? node.name } as never) })}/>
      <MenuItem label="Duplicate" icon={icons.copy} shortcut="Ctrl D" onClick={()=>run(store.duplicateSelection)}/>
      <MenuItem label="Copy" icon={icons.copy} shortcut="Ctrl C" onClick={()=>run(store.copy)}/>
      <MenuItem label="Cut" icon={icons.copy} shortcut="Ctrl X" onClick={()=>run(store.cut)}/>
      <MenuItem label="Paste" icon={icons.copy} shortcut="Ctrl V" onClick={()=>run(store.paste)}/>
      <MenuItem label="Delete" icon={icons.delete} shortcut="Del" onClick={()=>run(store.deleteSelection)}/>
      <div className="my-1 h-px bg-[#FFFFFF14]"/>
      <MenuItem label="Group" icon={icons.component} shortcut="Ctrl G" onClick={()=>run(store.groupSelection)}/>
      <MenuItem label="Ungroup" icon={icons.component} shortcut="Ctrl ⇧ G" onClick={()=>run(store.ungroupSelection)}/>
      <div className="my-1 h-px bg-[#FFFFFF14]"/>
      <MenuItem label="Bring forward" icon={icons.arrange} shortcut="]" onClick={()=>run(()=>store.arrangeSelection('forward'))}/>
      <MenuItem label="Send backward" icon={icons.arrange} shortcut="[" onClick={()=>run(()=>store.arrangeSelection('backward'))}/>
      <MenuItem label="Lock / unlock" icon={icons.lock} shortcut="Ctrl L" onClick={()=>run(store.toggleLockSelection)}/>
      <MenuItem label="Hide / show" icon={icons.eye} shortcut="Ctrl ⇧ H" onClick={()=>run(store.toggleVisibilitySelection)}/>
      <MenuItem label="Reset rotation" icon={icons.reload} onClick={()=>run(()=>store.updateSelected({ rotation: 0 } as never))}/>
      <MenuItem label="Copy as JSON" icon={icons.download} onClick={()=>run(()=>navigator.clipboard?.writeText(JSON.stringify(node, null, 2)))}/>
    </>}
  </div>
}
