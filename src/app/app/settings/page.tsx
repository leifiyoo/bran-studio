'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { clearAllData } from '@/lib/storage'

export default function SettingsPage() {
  const [theme, setTheme] = useState('system')
  const [grid, setGrid] = useState(8)
  const [snap, setSnap] = useState(true)
  useEffect(() => {
    setTheme(localStorage.getItem('bran-theme') ?? 'system')
    setGrid(Number(localStorage.getItem('bran-grid') ?? 8))
    setSnap(localStorage.getItem('bran-snap') !== 'false')
  }, [])
  const save = () => { localStorage.setItem('bran-theme', theme); localStorage.setItem('bran-grid', String(grid)); localStorage.setItem('bran-snap', String(snap)); document.documentElement.classList.toggle('dark', theme === 'dark') }
  return <main className="min-h-screen p-6"><section className="panel mx-auto max-w-3xl rounded-2xl p-8"><Link href="/app" className="text-sm text-muted-foreground">Back to dashboard</Link><h1 className="mt-4 text-4xl font-semibold">Settings</h1><div className="mt-8 space-y-6"><label className="block">Theme<Select className="mt-2" value={theme} onChange={(e)=>setTheme(e.target.value)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></Select></label><label className="flex items-center gap-3"><input type="checkbox" checked={snap} onChange={(e)=>setSnap(e.target.checked)}/> Snap to grid by default</label><label className="block">Grid size<Input className="mt-2" type="number" value={grid} onChange={(e)=>setGrid(Number(e.target.value))}/></label><label className="flex items-center gap-3"><input type="checkbox" defaultChecked/> Autosave on</label><div className="flex gap-2"><Button variant="primary" onClick={save}>Save settings</Button><Button onClick={()=>localStorage.removeItem('bran-onboarded')}>Reset onboarding</Button><Button variant="danger" onClick={()=>confirm('Clear all local Bran Studio data?') && void clearAllData()}>Clear all local data</Button></div><section className="rounded-xl bg-muted p-4"><h2 className="font-semibold">About</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Bran Studio 0.1 stores projects locally in IndexedDB. Export .bran.json files for backups and migration. Shortcuts: V, H, F, R, T, I, Ctrl/Cmd Z, Ctrl/Cmd D, arrows, Delete, Escape.</p></section></div></section></main>
}
