'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useProjectStore } from '@/editor/store/project-store'

const shortcuts = ['V Select', 'H Hand', 'F Frame', 'R Rectangle', 'T Text', 'I Image', 'Ctrl/Cmd Z Undo', 'Ctrl/Cmd Shift Z Redo', 'Ctrl/Cmd D Duplicate', 'Delete Remove', 'Space Drag Pan', 'Ctrl/Cmd +/- Zoom']

export default function OnboardingPage() {
  const router = useRouter()
  const createProject = useProjectStore((s) => s.createProject)
  const [theme, setTheme] = useState('system')
  const [template, setTemplate] = useState<'blank' | 'saas' | 'mobile' | 'landing'>('blank')
  const finish = async () => {
    localStorage.setItem('bran-onboarded', 'true')
    document.documentElement.classList.toggle('dark', theme === 'dark')
    const project = await createProject(template)
    router.push(`/app/projects/${project.id}`)
  }
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="panel w-full max-w-4xl rounded-2xl p-8">
        <h1 className="text-4xl font-semibold">Welcome to Bran Studio</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">Your projects live locally in this browser using IndexedDB. No account is required, and every project can be exported as a portable .bran.json file.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <label className="block text-sm font-medium">Theme<Select className="mt-2" value={theme} onChange={(e) => setTheme(e.target.value)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></Select></label>
          <label className="block text-sm font-medium">Starting template<Select className="mt-2" value={template} onChange={(e) => setTemplate(e.target.value as typeof template)}><option value="blank">Blank project</option><option value="saas">SaaS dashboard starter</option><option value="mobile">Mobile app starter</option><option value="landing">Landing page starter</option></Select></label>
        </div>
        <div className="mt-8"><h2 className="font-semibold">Core shortcuts</h2><div className="mt-3 grid gap-2 md:grid-cols-3">{shortcuts.map((item)=><div key={item} className="rounded-lg bg-muted px-3 py-2 text-sm">{item}</div>)}</div></div>
        <div className="mt-8 flex justify-end"><Button variant="primary" onClick={finish}>Finish and create project</Button></div>
      </section>
    </main>
  )
}
