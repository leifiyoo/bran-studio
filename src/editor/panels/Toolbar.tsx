'use client'
import { Icon, icons } from '@/components/ui/icon'
import { useEditorStore } from '@/editor/store/editor-store'

const tools = [
  ['select', icons.cursor, 'Select (V)'], ['hand', icons.hand, 'Hand (H)'], ['frame', icons.frame, 'Frame (F)'], ['rectangle', icons.rectangle, 'Rectangle (R)'], ['text', icons.text, 'Text (T)'], ['image', icons.image, 'Image (I)'],
] as const
export function Toolbar() {
  const tool = useEditorStore((s)=>s.tool); const setTool = useEditorStore((s)=>s.setTool); const addImage = useEditorStore((s)=>s.addImage)
  return <div className="absolute left-1/2 top-3 z-20 flex -translate-x-1/2 gap-0.5 rounded-[8px] border border-[#373737] bg-[#2A2A2A] p-1 shadow-[0_14px_40px_-24px_rgba(0,0,0,.9)]">{tools.map(([id, icon, label])=> id === 'image' ? <label key={id} title={label} className="grid h-8 w-8 place-items-center rounded-[6px] text-[#FFFFFFA6] hover:bg-white/10 hover:text-[#FFFFFFE6]"><Icon icon={icon} size={18}/><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(e)=>e.target.files?.[0] && void addImage(e.target.files[0])}/></label> : <button key={id} title={label} className={`grid h-8 w-8 place-items-center rounded-[6px] ${tool === id ? 'bg-[#FFFFFF14] text-[#FFFFFFE6]' : 'text-[#FFFFFFA6] hover:bg-white/10 hover:text-[#FFFFFFE6]'}`} onPointerDown={(event)=>{event.stopPropagation(); setTool(id)}} onClick={()=>setTool(id)}><Icon icon={icon} size={18}/></button>)}</div>
}
