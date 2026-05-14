'use client'

import { useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import type { NodeId, PageId } from '@/editor/core/scene-types'
import { useEditorStore } from '@/editor/store/editor-store'
import { useUiStore } from '@/editor/store/ui-store'

type SectionKey = 'file' | 'pages' | 'layers' | 'assets' | 'components' | 'libraries'

function Chevron({ open }: { open: boolean }) {
  return <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#FFFFFFA6" className={`shrink-0 transition-transform ${open ? '' : '-rotate-90'}`}><path d="M0.703 2.728L4.008 6.026L7.289 2.727" /></svg>
}

function FrameIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFFFFFE6" className="size-4 shrink-0 opacity-60"><rect x="2" y="2.5" width="12" height="4.5" rx="1" fill="#FFFFFF17" /><rect x="2.5" y="3" width="11" height="3.5" rx="0.5" fill="none" stroke="#FFFFFFE6" /><rect x="2" y="8.5" width="12" height="4.5" rx="1" fill="#FFFFFF17" /><rect x="2.5" y="9" width="11" height="3.5" rx="0.5" fill="none" stroke="#FFFFFFE6" /></svg>
}

function TextIcon() {
  return <div className="grid size-4 shrink-0 place-items-center text-xs/4 font-medium text-[#FFFFFFE6] opacity-70">Aa</div>
}

function ImageIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFFFFFE6" className="size-4 shrink-0 opacity-60"><path d="M3 3h10v10H3z" fill="#FFFFFF17" stroke="#FFFFFFE6" /><circle cx="10.5" cy="5.5" r="1.25" /><path d="M4 12l3.2-3.4 2 2L11 9l2 3" fill="none" stroke="#FFFFFFCF" /></svg>
}

function TypeIcon({ type }: { type: string }) {
  if (type === 'text') return <TextIcon />
  if (type === 'image' || type === 'video') return <ImageIcon />
  return <FrameIcon />
}

function ExplorerRow({ depth = 0, selected = false, children, icon, disclosure, onClick, onContextMenu }: { depth?: number; selected?: boolean; children: ReactNode; icon?: ReactNode; disclosure?: ReactNode; onClick?: () => void; onContextMenu?: (event: MouseEvent) => void }) {
  return <div className={`group flex h-7 min-w-full items-center break-keep pr-1 ${selected ? 'bg-[#FFFFFF12]' : 'hover:bg-[#FFFFFF0A]'}`} style={{ paddingLeft: depth * 16 }} onContextMenu={onContextMenu}>
    <button type="button" className="grid h-full w-5 shrink-0 place-items-center" onClick={onClick}>{disclosure}</button>
    <button type="button" className="flex h-full min-w-0 flex-1 items-center text-left" onClick={onClick}>
      <span className="-mx-1 flex px-1 py-2">{icon}</span>
      <span className="ml-2 min-w-0 grow truncate pt-px text-xs/4 text-[#FFFFFFE6]">{children}</span>
    </button>
  </div>
}

function RenameInput({ value, onCommit }: { value: string; onCommit: (name: string) => void }) {
  const [draft, setDraft] = useState(value)
  return <input autoFocus className="h-5 w-full rounded-[4px] bg-[#373737] px-1 text-xs text-[#FFFFFFE6] outline outline-1 outline-[#427FD8]" value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={() => onCommit(draft.trim() || value)} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); if (event.key === 'Escape') onCommit(value) }} />
}

export function ExplorerPanel() {
  const { project, pages, activePage, selectedIds, select, setActivePage, renamePage, updateSelected, assets } = useEditorStore()
  const openContextMenu = useUiStore((s) => s.openContextMenu)
  const [open, setOpen] = useState<Record<SectionKey | string, boolean>>({ file: true, pages: true, layers: true, assets: true, components: true, libraries: true })
  const [renaming, setRenaming] = useState<string | null>(null)
  if (!project || !activePage) return <aside className="w-[260px] shrink-0 border-r border-[#373737] bg-[#2A2A2A]" />
  const toggle = (key: SectionKey | string) => setOpen((current) => ({ ...current, [key]: !current[key] }))
  const nodeRow = (id: NodeId, depth = 1): React.ReactNode => {
    const node = activePage.nodes[id]
    if (!node) return null
    const hasChildren = node.children.length > 0
    const isOpen = open[id] ?? true
    return <div key={id}>
      <ExplorerRow depth={depth} selected={selectedIds.includes(id)} icon={<TypeIcon type={node.type} />} disclosure={hasChildren ? <Chevron open={isOpen} /> : null} onClick={() => hasChildren ? toggle(id) : select([id])} onContextMenu={(event) => { event.preventDefault(); select([id]); openContextMenu({ x: event.clientX, y: event.clientY, scope: 'layers' }) }}>
        <span onDoubleClick={(event) => { event.stopPropagation(); select([id]); setRenaming(id) }}>{renaming === id ? <RenameInput value={node.name} onCommit={(name) => { select([id]); updateSelected({ name } as never); setRenaming(null) }} /> : node.name}</span>
      </ExplorerRow>
      {hasChildren && isOpen && node.children.map((childId) => nodeRow(childId, depth + 1))}
    </div>
  }
  return <aside className="flex w-[260px] shrink-0 flex-col overflow-hidden border-r border-[#373737] bg-[#2A2A2A] py-1.5 text-[#FFFFFFE6] antialiased [font-synthesis:none]">
    <div className="border-b border-[#373737] px-2 pb-2">
      <input className="h-7 w-full rounded-[5px] bg-[#373737] px-2 text-xs text-[#FFFFFFE6] outline-none placeholder:text-[#FFFFFF66] focus:outline focus:outline-1 focus:outline-[#427FD8]" placeholder="Search explorer" />
    </div>
    <div className="min-h-0 flex-1 overflow-auto">
      <ExplorerRow icon={<FrameIcon />} disclosure={<Chevron open={open.file} />} onClick={() => toggle('file')}>{project.name}</ExplorerRow>
      {open.file && <>
        <ExplorerRow depth={1} icon={<FrameIcon />} disclosure={<Chevron open={open.pages} />} onClick={() => toggle('pages')}>Pages</ExplorerRow>
        {open.pages && pages.map((page) => <ExplorerRow key={page.id} depth={2} selected={page.id === activePage.id} icon={<FrameIcon />} onClick={() => setActivePage(page.id)}>
          <span onDoubleClick={(event) => { event.stopPropagation(); setRenaming(page.id) }}>{renaming === page.id ? <RenameInput value={page.name} onCommit={(name) => { renamePage(page.id as PageId, name); setRenaming(null) }} /> : page.name}</span>
        </ExplorerRow>)}
        <ExplorerRow depth={1} icon={<FrameIcon />} disclosure={<Chevron open={open.layers} />} onClick={() => toggle('layers')}>Current Page Layers</ExplorerRow>
        {open.layers && activePage.rootNodeIds.map((id) => nodeRow(id, 2))}
        <ExplorerRow depth={1} icon={<ImageIcon />} disclosure={<Chevron open={open.assets} />} onClick={() => toggle('assets')}>Assets</ExplorerRow>
        {open.assets && (assets.length ? assets.map((asset) => <ExplorerRow key={asset.id} depth={2} icon={<ImageIcon />}>{asset.name}</ExplorerRow>) : <ExplorerRow depth={2} icon={<ImageIcon />}>No assets</ExplorerRow>)}
        <ExplorerRow depth={1} icon={<FrameIcon />} disclosure={<Chevron open={open.components} />} onClick={() => toggle('components')}>Components</ExplorerRow>
        {open.components && (Object.values(project.components).length ? Object.values(project.components).map((component) => <ExplorerRow key={component.id} depth={2} icon={<FrameIcon />}>{component.name}</ExplorerRow>) : <ExplorerRow depth={2} icon={<FrameIcon />}>No components</ExplorerRow>)}
        <ExplorerRow depth={1} icon={<FrameIcon />} disclosure={<Chevron open={open.libraries} />} onClick={() => toggle('libraries')}>Libraries</ExplorerRow>
        {open.libraries && (Object.values(project.libraries).length ? Object.values(project.libraries).map((library) => <ExplorerRow key={library.id} depth={2} icon={<FrameIcon />}>{library.name}</ExplorerRow>) : <ExplorerRow depth={2} icon={<FrameIcon />}>Local library</ExplorerRow>)}
      </>}
    </div>
  </aside>
}
