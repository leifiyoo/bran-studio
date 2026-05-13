'use client'

import type { ChangeEvent, ReactNode } from 'react'
import { downloadText, pageToSvg } from '@/editor/core/export'
import type { Fill, SceneNode } from '@/editor/core/scene-types'
import { useEditorStore } from '@/editor/store/editor-store'

const fieldShadow = '#FFFFFF08 0px 1px 0px inset, #FFFFFF11 0px 0px 1px 0.5px inset, #00000022 0px 1px 0.5px, #000000BB 0px 0px 3px -1px'
const inactive = 'text-[#FFFFFF80]'

const linearPreset: Fill = { type: 'linear-gradient', angle: 135, alpha: 1, stops: [{ color: '#ffffff', position: 0, alpha: 1 }, { color: '#737373', position: 100, alpha: 1 }] }
const radialPreset: Fill = { type: 'radial-gradient', center: { x: 50, y: 50 }, radius: 75, alpha: 1, stops: [{ color: '#ffffff', position: 0, alpha: 1 }, { color: '#282828', position: 100, alpha: 1 }] }

function Section({ title, muted, actions, children }: { title: string; muted?: boolean; actions?: ReactNode; children?: ReactNode }) {
  return <section className="border-b border-[#373737]">
    <div className="flex h-8 items-center justify-between px-3">
      <div className={`font-medium ${muted ? inactive : 'text-[#FFFFFFE6]'}`}>{title}</div>
      <div className="flex items-center gap-2">{actions ?? <IconButton muted={muted}>+</IconButton>}</div>
    </div>
    {children && <div className="-mt-2 py-2">{children}</div>}
  </section>
}

function Row({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`flex items-center gap-2 px-3 py-1 ${className}`}>{children}</div>
}

function IconButton({ children, muted, onClick, title }: { children: ReactNode; muted?: boolean; onClick?: () => void; title?: string }) {
  return <button type="button" title={title} onClick={onClick} className={`grid size-6 place-items-center rounded-[5px] text-xs hover:bg-white/5 ${muted ? inactive : 'text-[#FFFFFFE6]'}`}>{children}</button>
}

function DragHandle({ label, onDelta, children }: { label?: string; onDelta?: (delta: number) => void; children?: ReactNode }) {
  const down = (event: React.PointerEvent) => {
    if (!onDelta) return
    event.preventDefault()
    const start = event.clientX
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    const move = (moveEvent: PointerEvent) => onDelta(Math.round((moveEvent.clientX - start) / 4))
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up, { once: true })
  }
  return <div onPointerDown={down} className="absolute left-0 z-10 grid size-6 select-none place-items-center text-center text-xs/4 font-medium text-[#FFFFFF66] [touch-action:none] cursor-ew-resize">{children ?? label}</div>
}

function NumberField({ label, value, onChange, suffix }: { label?: string; value: number; onChange: (value: number) => void; suffix?: string }) {
  return <label className="relative flex min-w-0 flex-1 basis-0 items-center">
    <DragHandle label={label} onDelta={(delta) => onChange(value + delta)} />
    <input aria-label={label} type="text" inputMode="decimal" className="h-6 w-full rounded-[5px] bg-[#373737] pl-6 pr-1.5 text-xs/4 tabular-nums text-[#FFFFFFE6] outline-none [box-shadow:var(--field-shadow)] focus:[outline:2px_solid_#427FD8] focus:[outline-offset:-1px]" style={{ '--field-shadow': fieldShadow } as React.CSSProperties} value={`${value}${suffix ?? ''}`} onChange={(event) => {
      const next = Number(event.target.value.replace(/[^\d.-]/g, ''))
      if (Number.isFinite(next)) onChange(next)
    }} />
  </label>
}

function TextField({ icon, value, onChange, ariaLabel }: { icon?: ReactNode; value: string; onChange: (value: string) => void; ariaLabel?: string }) {
  return <label className="relative flex min-w-0 flex-1 basis-0 items-center">
    <div className="absolute left-0 z-10 grid size-6 place-items-center text-[#FFFFFF66]">{icon}</div>
    <input aria-label={ariaLabel} className="h-6 w-full rounded-[5px] bg-[#373737] pl-6 pr-1.5 text-xs/4 text-[#FFFFFFE6] outline-none [box-shadow:var(--field-shadow)] focus:[outline:2px_solid_#427FD8] focus:[outline-offset:-1px]" style={{ '--field-shadow': fieldShadow } as React.CSSProperties} value={value} onChange={(event) => onChange(event.target.value)} />
  </label>
}

function SelectField({ icon, value, onChange, children }: { icon?: ReactNode; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return <label className="relative flex min-w-0 flex-1 basis-0 items-center">
    <div className="absolute left-0 z-10 grid size-6 place-items-center text-[#FFFFFF66]">{icon}</div>
    <select className="h-6 w-full appearance-none rounded-[5px] bg-[#373737] pl-6 pr-5 text-xs/4 text-[#FFFFFFE6] outline-none [box-shadow:var(--field-shadow)] focus:[outline:2px_solid_#427FD8] focus:[outline-offset:-1px]" style={{ '--field-shadow': fieldShadow } as React.CSSProperties} value={value} onChange={(event) => onChange(event.target.value)}>{children}</select>
    <span className="absolute right-2 text-[#FFFFFFA6]">⌄</span>
  </label>
}

function CheckRow({ label, shortcut, checked, onChange }: { label: string; shortcut?: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <Row><label className="flex items-center gap-1.5 text-xs/4 text-[#FFFFFFE6]"><input className="sr-only" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span className="grid size-4 place-items-center rounded-sm bg-[#373737] [box-shadow:#FFFFFF08_0px_1px_0px_inset,#FFFFFF33_0px_0px_1px_0.5px_inset,#00000022_0px_1px_0.5px,#000000BB_0px_0px_3px_-1px]">{checked && '✓'}</span>{label}{shortcut && <span className="text-[#FFFFFF93]">{shortcut}</span>}</label></Row>
}

function normalizeHex(value: string, fallback: string) {
  const clean = value.replace(/[^a-fA-F0-9]/g, '').slice(0, 6)
  return clean.length === 6 ? `#${clean}` : fallback
}

function fillLabel(fill: Fill) {
  if (fill.type !== 'solid') return fill.type === 'linear-gradient' ? 'Gradient / 100%' : 'Image / 100%'
  return `${fill.color.replace('#', '').toUpperCase()} / ${Math.round(fill.alpha * 100)}%`
}

function fillPreview(fill: Fill) {
  if (fill.type === 'solid') return fill.color
  if (fill.type === 'linear-gradient') return `linear-gradient(${fill.angle}deg, ${fill.stops.map((stop) => `${stop.color} ${stop.position}%`).join(', ')})`
  return `radial-gradient(circle at ${fill.center.x}% ${fill.center.y}%, ${fill.stops.map((stop) => `${stop.color} ${stop.position}%`).join(', ')})`
}

export function PropertiesPanel() {
  const { activePage, selectedIds, project, updateSelected, detachInstance, exportJson } = useEditorStore()
  const node = selectedIds.length === 1 && activePage ? activePage.nodes[selectedIds[0]] : null
  const fill = node?.fills[0] ?? { type: 'solid' as const, color: activePage?.backgroundColor ?? '#282828', alpha: 1 }
  const stroke = node?.strokes[0] ?? { color: '#ffffff', alpha: 0.05, width: 1, position: 'center' as const }
  const effect = node?.effects[0] ?? { type: 'drop-shadow' as const, x: 0, y: 2, blur: 3, spread: 0, color: '#000000', alpha: 0.2 }
  const inner = (node?.metadata.innerShadow ?? { x: 0, y: 1, blur: 2, color: '#000000', alpha: 0.18 }) as { x: number; y: number; blur: number; color: string; alpha: number }
  const filterBlur = typeof node?.metadata.filterBlur === 'number' ? node.metadata.filterBlur : 0
  const filterBrightness = typeof node?.metadata.filterBrightness === 'number' ? node.metadata.filterBrightness : 100
  const filterContrast = typeof node?.metadata.filterContrast === 'number' ? node.metadata.filterContrast : 100
  const radius = node && typeof node.cornerRadius === 'number' ? node.cornerRadius : 0
  const update = (patch: Partial<SceneNode>) => node && updateSelected(patch)
  const setMeta = (patch: Record<string, unknown>) => node && update({ metadata: { ...node.metadata, ...patch } } as never)

  const imageFill = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !node) return
    const reader = new FileReader()
    reader.onload = () => update({ type: 'image', src: String(reader.result), alt: file.name, objectFit: 'cover' } as never)
    reader.readAsDataURL(file)
  }

  if (!project || !activePage) return <aside className="w-[300px] shrink-0 border-l border-[#373737] bg-[#2A2A2A]" />

  return <aside className="flex h-full w-[clamp(280px,22vw,300px)] shrink-0 flex-col overflow-y-auto overflow-x-hidden border-l border-[#373737] bg-[#2A2A2A] pb-24 text-xs/4 text-[#FFFFFFE6] antialiased [font-synthesis:none]">
    <Section title="Document" actions={<><span className="font-medium text-[#FFFFFFA6]">65%</span><span className="size-[22px] rounded-full bg-[#5958B1] [outline:2px_solid_#2A2A2A]" /></>}>
      <Row><button className="h-6 grow rounded-[5px] bg-[#373737] font-medium [box-shadow:var(--field-shadow)]" style={{ '--field-shadow': fieldShadow } as React.CSSProperties}>Copy link <span className="text-[#FFFFFF93]">Ctrl + L</span></button></Row>
    </Section>

    {node && <>
      <Section title="Layout" actions={<><IconButton title="Fit">⛶</IconButton><IconButton title="Hug">⛶</IconButton></>}>
        <Row><NumberField label="X" value={Math.round(node.x)} onChange={(x) => update({ x })} /><NumberField label="Y" value={Math.round(node.y)} onChange={(y) => update({ y })} /><NumberField label="∠" value={Math.round(node.rotation)} suffix="°" onChange={(rotation) => update({ rotation })} /></Row>
        <Row><NumberField label="W" value={Math.round(node.width)} onChange={(width) => update({ width: Math.max(1, width) })} /><NumberField label="H" value={Math.round(node.height)} onChange={(height) => update({ height: Math.max(1, height) })} /><SelectField value={node.layout.mode} onChange={(mode) => update({ layout: { ...node.layout, mode } } as never)}><option value="none">None</option><option value="horizontal">Flex X</option><option value="vertical">Flex Y</option></SelectField></Row>
        <CheckRow label="Absolute position" checked={node.constraints.horizontal !== 'left' || node.constraints.vertical !== 'top'} onChange={(checked) => update({ constraints: checked ? { horizontal: 'center', vertical: 'center' } : { horizontal: 'left', vertical: 'top' } } as never)} />
        <CheckRow label="Clip content" shortcut="Alt + C" checked={'clipContent' in node ? node.clipContent : false} onChange={(clipContent) => update({ clipContent } as never)} />
      </Section>

      <Section title="Radius" actions={<IconButton>⌜</IconButton>}>
        <Row><input className="h-3 flex-1 accent-[#F9F9F9]" type="range" min="0" max="96" value={radius} onChange={(event) => update({ cornerRadius: Number(event.target.value) })} /><NumberField value={radius} onChange={(cornerRadius) => update({ cornerRadius })} /></Row>
      </Section>

      <Section title="Blending" actions={<IconButton>◉</IconButton>}>
        <Row><NumberField label="▦" value={Math.round(node.opacity * 100)} suffix="%" onChange={(opacity) => update({ opacity: Math.max(0, Math.min(1, opacity / 100)) })} /><SelectField icon="◌" value="normal" onChange={() => undefined}><option value="normal">Normal</option><option value="multiply">Multiply</option><option value="screen">Screen</option></SelectField></Row>
      </Section>

      <Section title="Fill">
        <Row><div className="flex h-6 grow rounded-md bg-[#FFFFFF0D] p-px">
          {(['solid', 'linear-gradient', 'radial-gradient'] as const).map((type) => <button key={type} className={`flex-1 rounded-[5px] text-xs ${fill.type === type ? 'bg-[#FFFFFF0D] font-medium text-[#FFFFFFE6] [box-shadow:#FFFFFF08_0px_1px_0px_inset,#FFFFFF22_0px_0px_1px_0.5px_inset,#00000022_0px_1px_0.5px,#000000BB_0px_0px_3px_-1px]' : 'text-[#FFFFFF93]'}`} onClick={() => update({ fills: [type === 'solid' ? { type, color: fill.type === 'solid' ? fill.color : '#282828', alpha: 1 } : type === 'linear-gradient' ? linearPreset : radialPreset] } as never)}>{type === 'solid' ? 'Solid' : type === 'linear-gradient' ? 'Gradient' : 'Image'}</button>)}
        </div><label className="grid size-6 place-items-center rounded-[5px] hover:bg-white/5"><span>◉</span><input type="file" accept="image/*" hidden onChange={imageFill} /></label></Row>
        <Row><TextField icon={<span className="size-3.5 rounded-[1.5px] [box-shadow:#4D4D4D_0px_0px_0px_1px_inset]" style={{ background: fillPreview(fill) }} />} value={fillLabel(fill)} ariaLabel="Fill color" onChange={(value) => fill.type === 'solid' && update({ fills: [{ ...fill, color: normalizeHex(value, fill.color) }] } as never)} /></Row>
        {fill.type === 'linear-gradient' && <Row><NumberField label="∠" value={fill.angle} onChange={(angle) => update({ fills: [{ ...fill, angle }] } as never)} /><TextField icon="A" value={fill.stops[0].color.replace('#', '').toUpperCase()} onChange={(value) => { const stops = [...fill.stops]; stops[0] = { ...stops[0], color: normalizeHex(value, stops[0].color) }; update({ fills: [{ ...fill, stops }] } as never) }} /><TextField icon="B" value={fill.stops[1].color.replace('#', '').toUpperCase()} onChange={(value) => { const stops = [...fill.stops]; stops[1] = { ...stops[1], color: normalizeHex(value, stops[1].color) }; update({ fills: [{ ...fill, stops }] } as never) }} /></Row>}
      </Section>

      <Section title="Outline" actions={<IconButton>≡</IconButton>}>
        <Row><NumberField label="▤" value={stroke.width} onChange={(width) => update({ strokes: [{ ...stroke, width: Math.max(0, width) }] } as never)} /><NumberField label="▣" value={Math.round(stroke.alpha * 100)} suffix="%" onChange={(alpha) => update({ strokes: [{ ...stroke, alpha: Math.max(0, Math.min(1, alpha / 100)) }] } as never)} /><IconButton>◉</IconButton></Row>
        <Row><TextField icon={<span className="size-3.5 rounded-[1.5px] [box-shadow:#4D4D4D_0px_0px_0px_1px_inset]" style={{ background: stroke.color }} />} value={`${stroke.color.replace('#', '').toUpperCase()} / ${Math.round(stroke.alpha * 100)}%`} onChange={(value) => update({ strokes: [{ ...stroke, color: normalizeHex(value, stroke.color) }] } as never)} /></Row>
      </Section>

      <Section title="Border" actions={<IconButton>+</IconButton>}>
        <Row><SelectField icon="□" value={stroke.position} onChange={(position) => update({ strokes: [{ ...stroke, position: position as 'center' }] } as never)}><option value="center">Center</option></SelectField><NumberField label="W" value={stroke.width} onChange={(width) => update({ strokes: [{ ...stroke, width: Math.max(0, width) }] } as never)} /></Row>
      </Section>

      <Section title="Shadow" actions={<><IconButton>≡</IconButton><IconButton>+</IconButton></>}>
        <Row className="gap-3"><NumberField label="X" value={effect.x} onChange={(x) => update({ effects: [{ ...effect, x }] } as never)} /><NumberField label="Y" value={effect.y} onChange={(y) => update({ effects: [{ ...effect, y }] } as never)} /><NumberField label="B" value={effect.blur} onChange={(blur) => update({ effects: [{ ...effect, blur: Math.max(0, blur) }] } as never)} /><NumberField label="S" value={effect.spread} onChange={(spread) => update({ effects: [{ ...effect, spread }] } as never)} /></Row>
        <Row><TextField icon={<span className="size-3.5 rounded-[1.5px] [box-shadow:#4D4D4D_0px_0px_0px_1px_inset]" style={{ background: effect.color }} />} value={`${effect.color.replace('#', '').toUpperCase()} / ${Math.round(effect.alpha * 100)}%`} onChange={(value) => update({ effects: [{ ...effect, color: normalizeHex(value, effect.color) }] } as never)} /></Row>
      </Section>

      <Section title="Inner shadow">
        <Row><NumberField label="X" value={inner.x} onChange={(x) => setMeta({ innerShadow: { ...inner, x } })} /><NumberField label="Y" value={inner.y} onChange={(y) => setMeta({ innerShadow: { ...inner, y } })} /><NumberField label="B" value={inner.blur} onChange={(blur) => setMeta({ innerShadow: { ...inner, blur: Math.max(0, blur) } })} /></Row>
        <Row><TextField icon={<span className="size-3.5 rounded-[1.5px] [box-shadow:#4D4D4D_0px_0px_0px_1px_inset]" style={{ background: inner.color }} />} value={`${inner.color.replace('#', '').toUpperCase()} / ${Math.round(inner.alpha * 100)}%`} onChange={(value) => setMeta({ innerShadow: { ...inner, color: normalizeHex(value, inner.color) } })} /></Row>
      </Section>

      <Section title="Filters">
        <Row><NumberField label="B" value={filterBlur} onChange={(filterBlur) => setMeta({ filterBlur: Math.max(0, filterBlur) })} /><NumberField label="☀" value={filterBrightness} suffix="%" onChange={(filterBrightness) => setMeta({ filterBrightness })} /><NumberField label="C" value={filterContrast} suffix="%" onChange={(filterContrast) => setMeta({ filterContrast })} /></Row>
      </Section>

      {node.type === 'text' && <Section title="Text"><Row><textarea className="min-h-16 w-full resize-none rounded-[5px] bg-[#373737] p-2 text-[#FFFFFFE6] outline-none [box-shadow:var(--field-shadow)]" style={{ '--field-shadow': fieldShadow } as React.CSSProperties} value={node.text} onChange={(event) => update({ text: event.target.value } as never)} /></Row><Row><SelectField value={node.fontFamily} onChange={(fontFamily) => update({ fontFamily } as never)}><option value="Geist">Geist</option><option value="Inter Variable">Inter</option><option value="Arial">Arial</option></SelectField><NumberField label="S" value={node.fontSize} onChange={(fontSize) => update({ fontSize } as never)} /></Row></Section>}
      {node.type === 'image' && <Section title="Video"><Row><SelectField icon="↔" value={node.objectFit} onChange={(objectFit) => update({ objectFit } as never)}><option value="cover">Cover</option><option value="contain">Contain</option><option value="fill">Fill</option></SelectField></Row></Section>}
      {node.type === 'instance' && <Row><button className="h-6 grow rounded-[5px] bg-[#373737] font-medium [box-shadow:var(--field-shadow)]" style={{ '--field-shadow': fieldShadow } as React.CSSProperties} onClick={detachInstance}>Detach</button></Row>}
    </>}

    <Section title="Guides"><Row><NumberField label="G" value={project.settings.gridSize} onChange={(gridSize) => useEditorStore.setState({ project: { ...project, settings: { ...project.settings, gridSize: Math.max(2, gridSize) } } })} /><CheckRow label="Snap" checked={project.settings.snapToGrid} onChange={(snapToGrid) => useEditorStore.setState({ project: { ...project, settings: { ...project.settings, snapToGrid } } })} /></Row></Section>

    <Section title="Export">
      <Row><button className="h-6 flex-1 rounded-[5px] bg-[#373737] font-medium [box-shadow:var(--field-shadow)]" style={{ '--field-shadow': fieldShadow } as React.CSSProperties} onClick={() => { const json = exportJson(); if (json) downloadText(`${project.name}.bran.json`, json) }}>Project</button><button className="h-6 flex-1 rounded-[5px] bg-[#373737] font-medium [box-shadow:var(--field-shadow)]" style={{ '--field-shadow': fieldShadow } as React.CSSProperties} onClick={() => downloadText(`${activePage.name}.svg`, pageToSvg(activePage), 'image/svg+xml')}>SVG</button></Row>
    </Section>
  </aside>
}
