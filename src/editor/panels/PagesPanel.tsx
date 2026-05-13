'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEditorStore } from '@/editor/store/editor-store'

export function PagesPanel() {
  const { pages, activePage, addPage, setActivePage, renamePage, duplicatePage, deletePage } = useEditorStore()
  return <div className="p-3 text-sm"><div className="mb-3 flex items-center justify-between"><strong>Pages</strong><Button size="sm" onClick={addPage}>New</Button></div>{pages.map((page)=><div key={page.id} className={`mb-2 rounded-lg border p-2 ${activePage?.id===page.id?'border-accent bg-muted':'border-border'}`}><Input value={page.name} onChange={(e)=>renamePage(page.id,e.target.value)} onFocus={()=>setActivePage(page.id)}/><div className="mt-2 flex gap-2"><Button size="sm" onClick={()=>duplicatePage(page.id)}>Duplicate</Button><Button size="sm" variant="danger" onClick={()=>deletePage(page.id)}>Delete</Button></div></div>)}</div>
}
