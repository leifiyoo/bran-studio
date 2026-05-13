'use client'
import { Button } from '@/components/ui/button'
import { Icon, icons } from '@/components/ui/icon'
import { useEditorStore } from '@/editor/store/editor-store'

const tools = [
  ['select', icons.cursor, 'Select (V)'], ['hand', icons.hand, 'Hand (H)'], ['frame', icons.frame, 'Frame (F)'], ['rectangle', icons.rectangle, 'Rectangle (R)'], ['text', icons.text, 'Text (T)'], ['image', icons.image, 'Image (I)'],
] as const
export function Toolbar() {
  const tool = useEditorStore((s)=>s.tool); const setTool = useEditorStore((s)=>s.setTool); const addImage = useEditorStore((s)=>s.addImage)
  return <div className="absolute left-1/2 top-2 z-20 flex -translate-x-1/2 gap-0.5 rounded-xl border border-neutral-200 bg-white p-1 shadow-[0_12px_35px_-28px_rgba(0,0,0,.45)]">{tools.map(([id, icon, label])=> id === 'image' ? <label key={id} title={label} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-neutral-100"><Icon icon={icon} size={18}/><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(e)=>e.target.files?.[0] && void addImage(e.target.files[0])}/></label> : <Button key={id} title={label} size="icon" variant={tool === id ? 'primary' : 'ghost'} onPointerDown={(event)=>{event.stopPropagation(); setTool(id)}} onClick={()=>setTool(id)}><Icon icon={icon} size={18}/></Button>)}</div>
}
