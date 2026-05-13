'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icon, icons } from '@/components/ui/icon'
import { downloadText, pageToSvg } from '@/editor/core/export'
import { useEditorStore } from '@/editor/store/editor-store'
import { useUiStore } from '@/editor/store/ui-store'

export function Topbar() {
  const { project, activePage, saveStatus, undo, redo, exportJson } = useEditorStore()
  const setPreviewOpen = useUiStore((s)=>s.setPreviewOpen)
  if (!project) return null
  return <header className="flex h-11 items-center justify-between border-b border-neutral-200 bg-white px-3">
    <div className="flex items-center gap-2 text-sm"><Link href="/app" className="text-muted-foreground">Dashboard</Link><span>/</span><strong>{project.name}</strong><span>/</span><span>{activePage?.name}</span></div>
    <div className="flex items-center gap-1.5"><Button size="icon" variant="ghost" onClick={undo} title="Undo"><Icon icon={icons.undo}/></Button><Button size="icon" variant="ghost" onClick={redo} title="Redo"><Icon icon={icons.redo}/></Button><span className="px-2 text-xs text-neutral-500">{saveStatus}</span><Button size="sm" onClick={()=>setPreviewOpen(true)}><Icon icon={icons.eye}/>Preview</Button><Button size="sm" onClick={()=>{ const json = exportJson(); if (json) downloadText(`${project.name}.bran.json`, json) }}><Icon icon={icons.download}/>Project</Button>{activePage && <Button size="sm" onClick={()=>downloadText(`${activePage.name}.svg`, pageToSvg(activePage), 'image/svg+xml')}>SVG</Button>}<Button size="icon" variant="ghost"><Link href="/app/settings"><Icon icon={icons.settings}/></Link></Button></div>
  </header>
}
