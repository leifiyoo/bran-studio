'use client'

import { useEffect } from 'react'
import { Icon, icons } from '@/components/ui/icon'
import { useEditorStore } from '@/editor/store/editor-store'
import { useUiStore } from '@/editor/store/ui-store'

function MenuItem({ label, onClick, icon = icons.forward }: { label: string; onClick: () => void; icon?: typeof icons.forward }) {
  return <button className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-xs text-neutral-800 hover:bg-neutral-100" onClick={onClick}><Icon icon={icon} size={15}/>{label}</button>
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
  return <div className="fixed z-[80] w-56 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-[0_16px_50px_-28px_rgba(0,0,0,.35)]" style={{ left: x, top: y }} onPointerDown={(e)=>e.stopPropagation()}>
    {menu.scope === 'canvas' ? <>
      <MenuItem label="Paste here" icon={icons.copy} onClick={()=>run(store.paste)}/>
      <MenuItem label="Create frame" icon={icons.frame} onClick={()=>run(()=>store.createNode('frame', menu.world?.x, menu.world?.y, 360, 240))}/>
      <MenuItem label="Add rectangle" icon={icons.rectangle} onClick={()=>run(()=>store.createNode('rectangle', menu.world?.x, menu.world?.y, 180, 120))}/>
      <MenuItem label="Add text" icon={icons.text} onClick={()=>run(()=>store.createNode('text', menu.world?.x, menu.world?.y, 160, 40))}/>
      <MenuItem label="Select all" icon={icons.cursor} onClick={()=>run(()=>store.activePage && store.select(Object.keys(store.activePage.nodes) as never))}/>
      <MenuItem label="Zoom to fit" icon={icons.reload} onClick={()=>run(store.zoomToFit)}/>
    </> : <>
      <MenuItem label="Rename" icon={icons.text} onClick={()=>run(()=>{ if (node) store.updateSelected({ name: prompt('Layer name', node.name) ?? node.name } as never) })}/>
      <MenuItem label="Duplicate" icon={icons.copy} onClick={()=>run(store.duplicateSelection)}/>
      <MenuItem label="Copy" icon={icons.copy} onClick={()=>run(store.copy)}/>
      <MenuItem label="Cut" icon={icons.copy} onClick={()=>run(store.cut)}/>
      <MenuItem label="Paste" icon={icons.copy} onClick={()=>run(store.paste)}/>
      <MenuItem label="Delete" icon={icons.delete} onClick={()=>run(store.deleteSelection)}/>
      <div className="my-1 h-px bg-neutral-100"/>
      <MenuItem label="Group" icon={icons.component} onClick={()=>run(store.groupSelection)}/>
      <MenuItem label="Ungroup" icon={icons.component} onClick={()=>run(store.ungroupSelection)}/>
      <MenuItem label="Create component" icon={icons.component} onClick={()=>run(store.createComponent)}/>
      {node?.type === 'instance' && <MenuItem label="Detach instance" icon={icons.component} onClick={()=>run(store.detachInstance)}/>}
      <div className="my-1 h-px bg-neutral-100"/>
      <MenuItem label="Bring forward" icon={icons.arrange} onClick={()=>run(()=>store.arrangeSelection('forward'))}/>
      <MenuItem label="Send backward" icon={icons.arrange} onClick={()=>run(()=>store.arrangeSelection('backward'))}/>
      <MenuItem label="Lock / unlock" icon={icons.lock} onClick={()=>run(store.toggleLockSelection)}/>
      <MenuItem label="Hide / show" icon={icons.eye} onClick={()=>run(store.toggleVisibilitySelection)}/>
      <MenuItem label="Reset rotation" icon={icons.reload} onClick={()=>run(()=>store.updateSelected({ rotation: 0 } as never))}/>
      <MenuItem label="Copy as JSON" icon={icons.download} onClick={()=>run(()=>navigator.clipboard?.writeText(JSON.stringify(node, null, 2)))}/>
    </>}
  </div>
}
