'use client'
import { Button } from '@/components/ui/button'
import { Icon, icons } from '@/components/ui/icon'
import { useUiStore } from '@/editor/store/ui-store'
import { AssetsPanel } from './AssetsPanel'
import { LayersPanel } from './LayersPanel'
import { PagesPanel } from './PagesPanel'

export function LeftSidebar() {
  const tab = useUiStore((s)=>s.sidebarTab); const set = useUiStore((s)=>s.setSidebarTab)
  return <aside className="flex w-[260px] flex-col border-r border-[#373737] bg-[#2A2A2A] text-[#FFFFFFE6]"><div className="flex gap-1 border-b border-[#373737] p-2">{[['pages',icons.grid],['layers',icons.layers],['assets',icons.image],['components',icons.component]].map(([id,icon])=><Button key={id as string} size="icon" variant={tab===id?'secondary':'ghost'} onClick={()=>set(id as never)}><Icon icon={icon as never} size={16}/></Button>)}</div>{tab==='pages' && <PagesPanel/>}{tab==='layers' && <LayersPanel/>}{(tab==='assets'||tab==='components') && <AssetsPanel componentsOnly={tab==='components'}/>}</aside>
}
