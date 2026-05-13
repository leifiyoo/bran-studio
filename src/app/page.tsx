import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icon, icons } from '@/components/ui/icon'
import type { IconSvgElement } from '@hugeicons/react'

const features: [string, IconSvgElement, string][] = [
  ['Infinite canvas', icons.grid, 'Pan, zoom, snap, and compose product screens on a fast SVG/DOM canvas.'],
  ['Frames and layouts', icons.frame, 'Create screens, stacks, sections, and reusable interface structures.'],
  ['Components and instances', icons.component, 'Insert editable UI components and turn selections into reusable parts.'],
  ['Local-first projects', icons.download, 'Projects persist in IndexedDB with JSON import and export.'],
  ['Design tokens', icons.arrange, 'Neutral tokens, text styles, spacing, radius, and gradient fills.'],
  ['Clean data model', icons.layers, 'Normalized layout data structured for future AI and code workflows.'],
]

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3 font-semibold"><span className="grid h-9 w-9 place-items-center rounded-lg bg-foreground text-background">B</span>Bran Studio</Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex"><a href="#features">Features</a><a href="#workflow">Workflow</a><Link href="/app/settings">Settings</Link></nav>
        <Link href="/app"><Button variant="primary">Open App <Icon icon={icons.forward} /></Button></Link>
      </header>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.03] tracking-tight text-neutral-950 md:text-7xl">A local-first design studio for interface builders.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-500">Design screens, components, tokens, and layouts in a fast, minimal editor built for future AI and code workflows.</p>
          <div className="mt-8 flex gap-3"><Link href="/app"><Button variant="primary">Open App</Button></Link><Link href="/onboarding"><Button>Create Project</Button></Link></div>
        </div>
        <div className="panel rounded-2xl p-3 shadow-2xl shadow-black/10">
          <div className="flex h-[520px] overflow-hidden rounded-xl border border-border bg-[#e9e7df]">
            <div className="w-48 border-r border-neutral-200 bg-white p-3 text-xs"><div className="mb-3 font-semibold">Layers</div>{['Desktop 1','Topbar','Cards','Chart','Table'].map((x)=><div key={x} className="mb-2 rounded bg-neutral-50 px-2 py-2">{x}</div>)}</div>
            <div className="relative flex-1 editor-grid p-10" style={{'--grid-size':'24px'} as React.CSSProperties}>
              <div className="h-[420px] rounded-xl bg-white p-8 shadow-xl"><div className="h-10 rounded bg-[#111827]" /><div className="mt-8 grid grid-cols-3 gap-4">{[1,2,3].map(i=><div key={i} className="h-24 rounded-lg bg-[#edf1ff]" />)}</div><div className="mt-6 h-44 rounded-lg border border-border" /></div>
            </div>
            <div className="w-56 border-l border-neutral-200 bg-white p-3 text-xs"><div className="mb-3 font-semibold">Properties</div>{['Position','Fill','Layout','Tokens'].map((x)=><div key={x} className="mb-2 rounded border border-neutral-100 bg-neutral-50 p-3">{x}</div>)}</div>
          </div>
        </div>
      </section>
      <section id="features" className="mx-auto grid max-w-7xl gap-4 px-6 py-12 md:grid-cols-3">{features.map(([title, icon, copy]) => <article key={String(title)} className="rounded-xl border border-neutral-200 bg-white p-6"><Icon icon={icon} size={22}/><h2 className="mt-5 text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-neutral-500">{copy}</p></article>)}</section>
      <section id="workflow" className="mx-auto max-w-7xl px-6 py-20"><h2 className="text-3xl font-semibold">A practical design workflow</h2><div className="mt-8 grid gap-3 md:grid-cols-4">{['Create a project','Design screens','Organize components/tokens','Export project data'].map((x,i)=><div key={x} className="rounded-xl bg-foreground p-5 text-background"><span className="text-sm opacity-60">0{i+1}</span><p className="mt-8 font-medium">{x}</p></div>)}</div></section>
      <footer className="mx-auto flex max-w-7xl justify-between border-t border-border px-6 py-8 text-sm text-muted-foreground"><span>Bran Studio 0.1</span><Link href="/app">Open App</Link></footer>
    </main>
  )
}
