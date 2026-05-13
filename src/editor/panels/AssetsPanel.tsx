'use client'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/editor/store/editor-store'

export function AssetsPanel({ componentsOnly = false }: { componentsOnly?: boolean }) {
  const { assets, project, insertInstance, createComponent, insertBuiltin } = useEditorStore()
  const builtins = ['Primary Button','Secondary Button','Input','Textarea','Checkbox','Toggle','Badge','Avatar','Divider','Card','Modal','Dropdown','Tabs','Navbar','Sidebar','Topbar','Grid','Container','Pricing card','Feature card','Stat card','Metric card','Table','Empty state','User profile row','Settings row','Notification item','Command palette','Dashboard chart','Mobile header','Bottom nav','List item','App card']
  return <div className="p-3 text-xs"><div className="mb-3 flex items-center justify-between"><strong>{componentsOnly?'Components':'Assets'}</strong>{componentsOnly && <Button size="sm" onClick={createComponent}>Create</Button>}</div>{componentsOnly ? <div className="space-y-4"><div className="grid grid-cols-2 gap-2">{builtins.map((name)=><button key={name} className="rounded-lg border border-neutral-200 bg-white px-2 py-2 text-left hover:bg-neutral-50" onClick={()=>insertBuiltin(name)}>{name}</button>)}</div>{project && Object.values(project.components).map((c)=><button key={c.id} className="w-full rounded-lg border border-border p-3 text-left" onClick={()=>insertInstance(c.id)}>{c.name}</button>)}</div> : <div className="grid grid-cols-2 gap-2">{assets.map((a)=><img key={a.id} src={a.dataUrl} alt={a.name} className="h-24 rounded border border-border object-cover"/>)}</div>}</div>
}
