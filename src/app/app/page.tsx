'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Icon, icons } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useProjectStore } from '@/editor/store/project-store'
import { exportProject, downloadText } from '@/editor/core/export'
import { importProjectJson } from '@/editor/core/import'
import { loadProject, saveProject } from '@/lib/storage'
import type { Page, Project } from '@/editor/core/scene-types'

export default function DashboardPage() {
  const { projects, refresh, createProject, renameProject, duplicateProject, deleteProject } = useProjectStore()
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sort, setSort] = useState('updated')
  const fileRef = useRef<HTMLInputElement>(null)
  useEffect(() => { void refresh() }, [refresh])
  const filtered = useMemo(() => [...projects].filter((p) => p.name.toLowerCase().includes(query.toLowerCase())).sort((a,b)=> sort === 'name' ? a.name.localeCompare(b.name) : sort === 'created' ? b.createdAt.localeCompare(a.createdAt) : b.updatedAt.localeCompare(a.updatedAt)), [projects, query, sort])
  const create = async () => { const p = await createProject('blank', 'Untitled Project'); location.href = `/app/projects/${p.id}` }
  const importFile = async (file: File) => {
    try {
      const payload = importProjectJson(await file.text())
      await saveProject(payload.project as Project, payload.pages as Page[])
      await refresh()
    } catch { alert('Import failed: the selected file is not a valid Bran project.') }
  }
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 text-xl font-semibold"><span className="grid h-9 w-9 place-items-center rounded-lg bg-foreground text-background">B</span>Bran Studio</Link>
          <div className="flex gap-2"><Button onClick={() => fileRef.current?.click()}><Icon icon={icons.download}/>Import</Button><Button variant="primary" onClick={create}><Icon icon={icons.add}/>New project</Button><Button><Link href="/app/settings"><Icon icon={icons.settings}/></Link></Button></div>
        </header>
        <section className="mt-8 rounded-2xl border border-border bg-panel p-4">
          <div className="flex flex-wrap gap-3"><div className="relative min-w-72 flex-1"><Icon icon={icons.search} className="absolute left-3 top-2.5"/><Input className="pl-9" placeholder="Search projects" value={query} onChange={(e)=>setQuery(e.target.value)}/></div><Select className="w-44" value={sort} onChange={(e)=>setSort(e.target.value)}><option value="updated">Recently edited</option><option value="created">Created date</option><option value="name">Name</option></Select><Button size="icon" onClick={()=>setView(view === 'grid' ? 'list' : 'grid')}><Icon icon={icons.grid}/></Button></div>
        </section>
        <input ref={fileRef} type="file" accept=".json,.bran.json" hidden onChange={(e)=> e.target.files?.[0] && void importFile(e.target.files[0])}/>
        {filtered.length === 0 ? <section className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center"><h2 className="text-2xl font-semibold">No projects yet</h2><p className="mt-2 text-muted-foreground">Create a blank project or import a .bran.json file.</p><Button className="mt-6" variant="primary" onClick={create}>Create first project</Button></section> :
          <section className={view === 'grid' ? 'mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3' : 'mt-8 space-y-3'}>
            {filtered.map((project) => <article key={project.id} className="group rounded-xl border border-border bg-panel p-3">
              <Link href={`/app/projects/${project.id}`}><img alt="" src={project.thumbnail} className="h-44 w-full rounded-lg object-cover bg-muted"/><h2 className="mt-4 font-semibold">{project.name}</h2><p className="text-sm text-muted-foreground">Updated {new Date(project.updatedAt).toLocaleString()}</p></Link>
              <div className="mt-4 flex gap-2"><Button size="sm" onClick={()=>{ const name = prompt('Rename project', project.name); if (name) void renameProject(project.id, name)}}>Rename</Button><Button size="sm" onClick={()=>void duplicateProject(project.id)}>Duplicate</Button><Button size="sm" onClick={async()=>{ const loaded = await loadProject(project.id); if (loaded) downloadText(`${project.name}.bran.json`, exportProject(loaded.project, loaded.pages, [])) }}><Icon icon={icons.download} size={14}/>Export</Button><Button size="sm" variant="danger" onClick={()=>confirm('Delete this project?') && void deleteProject(project.id)}>Delete</Button></div>
            </article>)}
          </section>}
      </div>
    </main>
  )
}
