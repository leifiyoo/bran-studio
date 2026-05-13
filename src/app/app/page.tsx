'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useProjectStore } from '@/editor/store/project-store'
import { exportProject, downloadText } from '@/editor/core/export'
import { importProjectJson } from '@/editor/core/import'
import { loadProject, saveProject } from '@/lib/storage'
import type { Page, Project } from '@/editor/core/scene-types'

function GridIcon({ active = false }: { active?: boolean }) {
  return <svg viewBox="0 0 15 15" width="15" height="15" fill={active ? '#FFFFFFE6' : '#FFFFFF66'}><path d="M6 2.5C6 2.224 5.776 2 5.5 2H2.5C2.224 2 2 2.224 2 2.5V5.5C2 5.776 2.224 6 2.5 6H5.5C5.776 6 6 5.776 6 5.5V2.5ZM7 5.5C7 6.328 6.328 7 5.5 7H2.5C1.672 7 1 6.328 1 5.5V2.5C1 1.672 1.672 1 2.5 1H5.5C6.328 1 7 1.672 7 2.5V5.5ZM6 9.5C6 9.224 5.776 9 5.5 9H2.5C2.224 9 2 9.224 2 9.5V12.5C2 12.776 2.224 13 2.5 13H5.5C5.776 13 6 12.776 6 12.5V9.5ZM7 12.5C7 13.328 6.328 14 5.5 14H2.5C1.672 14 1 13.328 1 12.5V9.5C1 8.672 1.672 8 2.5 8H5.5C6.328 8 7 8.672 7 9.5V12.5ZM13 2.5C13 2.224 12.776 2 12.5 2H9.5C9.224 2 9 2.224 9 2.5V5.5C9 5.776 9.224 6 9.5 6H12.5C12.776 6 13 5.776 13 5.5V2.5ZM14 5.5C14 6.328 13.328 7 12.5 7H9.5C8.672 7 8 6.328 8 5.5V2.5C8 1.672 8.672 1 9.5 1H12.5C13.328 1 14 1.672 14 2.5V5.5ZM13 9.5C13 9.224 12.776 9 12.5 9H9.5C9.224 9 9 9.224 9 9.5V12.5C9 12.776 9.224 13 9.5 13H12.5C12.776 13 13 12.776 13 12.5V9.5ZM14 12.5C14 13.328 13.328 14 12.5 14H9.5C8.672 14 8 13.328 8 12.5V9.5C8 8.672 8.672 8 9.5 8H12.5C13.328 8 14 8.672 14 9.5V12.5Z" /></svg>
}

function ListIcon() {
  return <svg viewBox="0 0 15 15" width="15" height="15" fill="#FFFFFF66"><path d="M1.5 5.25C1.914 5.25 2.25 4.914 2.25 4.5C2.25 4.086 1.914 3.75 1.5 3.75C1.086 3.75.75 4.086.75 4.5C.75 4.914 1.086 5.25 1.5 5.25ZM4 4.5C4 4.224 4.224 4 4.5 4H13.5C13.776 4 14 4.224 14 4.5C14 4.776 13.776 5 13.5 5H4.5C4.224 5 4 4.776 4 4.5ZM4.5 7C4.224 7 4 7.224 4 7.5C4 7.776 4.224 8 4.5 8H13.5C13.776 8 14 7.776 14 7.5C14 7.224 13.776 7 13.5 7H4.5ZM4.5 10C4.224 10 4 10.224 4 10.5C4 10.776 4.224 11 4.5 11H13.5C13.776 11 14 10.776 14 10.5C14 10.224 13.776 10 13.5 10H4.5ZM2.25 7.5C2.25 7.914 1.914 8.25 1.5 8.25C1.086 8.25.75 7.914.75 7.5C.75 7.086 1.086 6.75 1.5 6.75C1.914 6.75 2.25 7.086 2.25 7.5ZM1.5 11.25C1.914 11.25 2.25 10.914 2.25 10.5C2.25 10.086 1.914 9.75 1.5 9.75C1.086 9.75.75 10.086.75 10.5C.75 10.914 1.086 11.25 1.5 11.25Z" /></svg>
}

export default function DashboardPage() {
  const { projects, refresh, createProject, renameProject, duplicateProject, deleteProject } = useProjectStore()
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<'all' | 'recents' | 'archived'>('all')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { document.documentElement.classList.add('dark'); void refresh() }, [refresh])

  const filtered = useMemo(() => [...projects]
    .filter((project) => project.name.toLowerCase().includes(query.toLowerCase()))
    .filter((project) => filter !== 'recents' || Date.now() - new Date(project.updatedAt).getTime() < 1000 * 60 * 60 * 24 * 30)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [projects, query, filter])

  const create = async () => {
    const project = await createProject('blank', 'Untitled Project')
    location.href = `/app/projects/${project.id}`
  }
  const importFile = async (file: File) => {
    try {
      const payload = importProjectJson(await file.text())
      await saveProject(payload.project as Project, payload.pages as Page[])
      await refresh()
    } catch {
      alert('Import failed: the selected file is not a valid Bran project.')
    }
  }

  return <main className="min-h-screen overflow-hidden bg-[#222222] text-[#FFFFFFE6]">
    <aside className="fixed inset-y-0 left-0 flex w-60 flex-col border-r border-[#373737] bg-[#2A2A2A] p-3">
      <div className="mb-6 flex w-fit items-center gap-2.5 rounded-sm px-1 py-1 pr-2">
        <div className="size-6 rounded-full bg-[#FFFFFF1A] [outline:1px_solid_#FFFFFF0D]" />
        <div className="text-[13px]/4 font-medium">Kira</div>
        <span className="text-[#FFFFFF80]">⌄</span>
      </div>
      <nav className="space-y-0.5">
        <div className="flex h-8 items-center gap-2 rounded-[7.5px] bg-[#FFFFFF0F] px-2 text-[13px]/4"><GridIcon active />Files</div>
        <div className="flex h-8 items-center gap-2 rounded-[7.5px] px-2 text-[13px]/4 text-[#FFFFFFA6]">◇ Learn</div>
        <div className="flex h-8 items-center gap-2 rounded-[7.5px] px-2 text-[13px]/4 text-[#FFFFFFA6]">○ Kira&apos;s Team</div>
      </nav>
      <div className="mt-4 rounded-md border border-[#373737] p-3">
        <div className="mb-1 text-xs/4 font-medium">Upgrade to Bran Pro</div>
        <div className="text-xs/4 text-[#FFFFFFA6]">You are on the free tier.<br />Upgrade to get more features.</div>
      </div>
      <div className="mt-auto rounded-[12.5px] border border-[#373737] bg-[#00000033] p-4">
        <div className="mb-1 text-[13px]/4 font-medium text-[#81ADEC]">New release</div>
        <div className="text-lg/7 font-medium tracking-[0.18px]">Bran desktop app</div>
        <p className="mt-1 text-xs/4.5 text-[#FFFFFFA6]">Available for Windows, featuring a powerful MCP server for agentic workflows.</p>
        <div className="mt-4 flex gap-2">
          <button className="h-8 flex-1 rounded-[7.5px] bg-white text-[13px]/4 font-medium text-[#373737]">Download</button>
          <button className="h-8 flex-1 rounded-[7.5px] bg-[#FFFFFF0C] text-[13px]/4 font-medium">Docs ›</button>
        </div>
      </div>
      <div className="flex gap-2 px-1 py-2 text-xs/4 text-[#FFFFFFA6]"><span>Bran Alpha</span><span>•</span><span>Feedback</span></div>
    </aside>

    <section className="ml-60 min-w-[800px]">
      <div className="px-8 pt-8">
        <div className="sticky top-0 z-10 -my-3 bg-[#222222] px-0 py-3">
          <div className="mx-auto flex w-full max-w-[1144px] items-center justify-between gap-12">
            <h1 className="-ml-0.5 text-2xl/8 font-medium tracking-[0.12px]">Files</h1>
            <div className="flex h-7 items-center gap-3">
              <div className="flex h-full gap-px">
                {(['all', 'recents', 'archived'] as const).map((item) => <button key={item} onClick={() => setFilter(item)} className={`h-full rounded-[7.5px] px-2.5 text-xs/4 ${filter === item ? 'bg-[#FFFFFF0F] font-medium text-[#FFFFFFE6]' : 'text-[#FFFFFF93]'}`}>{item === 'all' ? 'All' : item === 'recents' ? 'Recents' : 'Archived'}</button>)}
              </div>
              <div className="flex h-7 rounded-[8.5px] bg-[#FFFFFF0D] p-px">
                <button onClick={() => setView('grid')} className={`grid aspect-square h-full place-items-center rounded-[7.5px] ${view === 'grid' ? 'bg-[#FFFFFF0D] [box-shadow:#FFFFFF08_0px_1px_0px_inset,#FFFFFF22_0px_0px_1px_0.5px_inset,#00000022_0px_1px_0.5px,#000000BB_0px_0px_3px_-1px]' : ''}`}><GridIcon active={view === 'grid'} /></button>
                <button onClick={() => setView('list')} className={`grid aspect-square h-full place-items-center rounded-[7.5px] ${view === 'list' ? 'bg-[#FFFFFF0D]' : ''}`}><ListIcon /></button>
              </div>
              <label className="relative flex h-full w-50 items-center rounded-[7.5px] bg-[#FFFFFF0F]">
                <span className="absolute left-2.5 text-[#FFFFFF93]">⌕</span>
                <input className="h-full w-full rounded-[7.5px] bg-transparent pl-7 pr-10 text-xs/4 text-[#FFFFFFE6] outline-none placeholder:text-[#FFFFFF80]" placeholder="Search files" value={query} onChange={(event) => setQuery(event.target.value)} />
                <span className="absolute right-2.5 text-xs/4 text-[#FFFFFF80]">⌘F</span>
              </label>
              <button onClick={create} className="flex h-full items-center gap-1.5 rounded-[7.5px] bg-[#F2F2F2] px-3 text-xs font-medium leading-none text-[#373737]">+ New file</button>
              <button onClick={() => fileRef.current?.click()} className="h-full rounded-[7.5px] bg-[#FFFFFF0F] px-3 text-xs/4 text-[#FFFFFFE6]">Import</button>
            </div>
          </div>
        </div>
        <input ref={fileRef} type="file" accept=".json,.bran.json" hidden onChange={(event) => event.target.files?.[0] && void importFile(event.target.files[0])} />
        <div className="mx-auto max-w-[1144px] pb-8">
          <div className={view === 'grid' ? 'mt-8 grid grid-cols-[repeat(auto-fill,minmax(256px,1fr))] gap-10' : 'mt-8 space-y-3'}>
            {filtered.map((project) => <article key={project.id} className={view === 'grid' ? 'group flex flex-col gap-1.5' : 'group flex items-center gap-4 rounded-[5px] bg-[#282828] p-2 [outline:1px_solid_#FFFFFF0D]'}>
              <Link href={`/app/projects/${project.id}`} className={view === 'grid' ? 'contents' : 'flex min-w-0 flex-1 items-center gap-4'}>
                <div className={view === 'grid' ? 'aspect-[256/168] overflow-hidden rounded-[5px] bg-[#282828] [outline:1px_solid_#FFFFFF0D] -outline-offset-1' : 'h-16 w-24 shrink-0 overflow-hidden rounded-[5px] bg-[#282828] [outline:1px_solid_#FFFFFF0D]'}><img alt="" src={project.thumbnail} className="size-full object-cover" /></div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="truncate text-xs/4 text-[#FFFFFFE6]">{project.name}</div>
                  <div className="text-xs/4 text-[#FFFFFF93]">Edited {new Date(project.updatedAt).toLocaleString()}</div>
                </div>
              </Link>
              <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="text-xs/4 text-[#FFFFFF93]" onClick={() => { const name = prompt('Rename project', project.name); if (name) void renameProject(project.id, name) }}>Rename</button>
                <button className="text-xs/4 text-[#FFFFFF93]" onClick={() => void duplicateProject(project.id)}>Duplicate</button>
                <button className="text-xs/4 text-[#FFFFFF93]" onClick={async () => { const loaded = await loadProject(project.id); if (loaded) downloadText(`${project.name}.bran.json`, exportProject(loaded.project, loaded.pages, [])) }}>Export</button>
                <button className="text-xs/4 text-[#ff8f8f]" onClick={() => confirm('Delete this project?') && void deleteProject(project.id)}>Delete</button>
              </div>
            </article>)}
          </div>
        </div>
      </div>
    </section>
  </main>
}
