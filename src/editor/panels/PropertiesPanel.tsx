'use client'

import type { ChangeEvent, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { downloadText, pageToSvg } from '@/editor/core/export'
import type { Effect, Fill, SceneNode, Stroke } from '@/editor/core/scene-types'
import { useEditorStore } from '@/editor/store/editor-store'

const fieldShadow = '#FFFFFF08 0px 1px 0px inset, #FFFFFF11 0px 0px 1px 0.5px inset, #00000022 0px 1px 0.5px, #000000BB 0px 0px 3px -1px'
const solidFill = (color = '#282828', alpha = 1): Fill => ({ type: 'solid', color, alpha })
const defaultStroke: Stroke = { color: '#ffffff', alpha: 0.05, width: 1, position: 'center' }
const defaultShadow: Effect = { type: 'drop-shadow', x: 0, y: 2, blur: 3, spread: 0, color: '#000000', alpha: 0.2 }
const defaultInner = { x: 0, y: 2, blur: 3, spread: 0, color: '#000000', alpha: 0.2 }
const linearPreset: Fill = { type: 'linear-gradient', angle: 135, alpha: 1, stops: [{ color: '#ffffff', position: 0, alpha: 1 }, { color: '#737373', position: 100, alpha: 1 }] }
const radialPreset: Fill = { type: 'radial-gradient', center: { x: 50, y: 50 }, radius: 75, alpha: 1, stops: [{ color: '#ffffff', position: 0, alpha: 1 }, { color: '#282828', position: 100, alpha: 1 }] }

type InnerShadow = typeof defaultInner
type FilterLayer = { type: 'blur' | 'brightness' | 'contrast'; value: number }

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function parseColorLabel(value: string, fallbackColor: string, fallbackAlpha: number) {
  const [hexPart, alphaPart] = value.split('/')
  const hex = hexPart.replace(/[^a-fA-F0-9]/g, '').slice(0, 6)
  const alpha = Number(alphaPart?.replace(/[^\d.-]/g, ''))
  return {
    color: hex.length === 6 ? `#${hex}` : fallbackColor,
    alpha: Number.isFinite(alpha) ? clamp(alpha / 100, 0, 1) : fallbackAlpha,
  }
}

function colorLabel(color: string, alpha: number) {
  return `${color.replace('#', '').toUpperCase()} / ${Math.round(alpha * 100)}%`
}

function IconButton({ children, onClick, title, muted = false }: { children: ReactNode; onClick?: () => void; title?: string; muted?: boolean }) {
  return <Button type="button" title={title} onClick={onClick} variant="ghost" size="icon-xs" className={`rounded-[5px] text-xs hover:bg-white/5 ${muted ? 'text-[#FFFFFF80]' : 'text-[#FFFFFFE6]'}`}>{children}</Button>
}

function Section({ title, children, onAdd, muted = false, actions }: { title: string; children?: ReactNode; onAdd?: () => void; muted?: boolean; actions?: ReactNode }) {
  return <section className="border-b border-[#373737]">
    <div className="flex h-8 items-center justify-between px-3">
      <div className={`font-medium ${muted ? 'text-[#FFFFFF80]' : 'text-[#FFFFFFE6]'}`}>{title}</div>
      <div className="flex items-center gap-2">{actions ?? <IconButton muted={muted && !onAdd} onClick={onAdd}>+</IconButton>}</div>
    </div>
    {children && <div className="-mt-2 py-2">{children}</div>}
  </section>
}

function Row({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`flex items-center gap-2 px-3 py-1 ${className}`}>{children}</div>
}

function DragHandle({ label, onDelta, icon }: { label?: string; icon?: ReactNode; onDelta?: (delta: number) => void }) {
  const down = (event: React.PointerEvent) => {
    if (!onDelta) return
    event.preventDefault()
    const startX = event.clientX
    const startDelta = { current: 0 }
    const move = (moveEvent: PointerEvent) => {
      const next = Math.round((moveEvent.clientX - startX) / (moveEvent.shiftKey ? 1 : 2))
      if (next !== startDelta.current) {
        onDelta(next - startDelta.current)
        startDelta.current = next
      }
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up, { once: true })
  }
  return <div onPointerDown={down} className="absolute left-0 top-0 z-10 grid size-6 cursor-ew-resize select-none place-items-center text-center text-xs font-medium leading-none text-[#FFFFFF66] [touch-action:none]">{icon ?? label}</div>
}

function NumberField({ label, value, onChange, suffix = '', min, max, icon }: { label?: string; value: number; onChange: (value: number) => void; suffix?: string; min?: number; max?: number; icon?: ReactNode }) {
  const set = (next: number) => onChange(clamp(next, min ?? -Infinity, max ?? Infinity))
  return <label className="relative flex h-6 min-w-0 flex-1 basis-0 items-center">
    <DragHandle label={label} icon={icon} onDelta={(delta) => set(value + delta)} />
    <input aria-label={label} type="text" inputMode="decimal" className="h-6 w-full rounded-[5px] bg-[#373737] pb-px pl-6 pr-1.5 text-left align-middle text-xs leading-6 tabular-nums text-[#FFFFFFE6] outline-none [box-shadow:var(--field-shadow)] focus:[outline:2px_solid_#427FD8] focus:[outline-offset:-1px]" style={{ '--field-shadow': fieldShadow } as React.CSSProperties} value={`${value}${suffix}`} onChange={(event) => {
      const next = Number(event.target.value.replace(/[^\d.-]/g, ''))
      if (Number.isFinite(next)) set(next)
    }} />
  </label>
}

function SelectField({ icon, value, onChange, children }: { icon?: ReactNode; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return <label className="relative flex h-6 min-w-0 flex-1 basis-0 items-center">
    <div className="absolute left-0 top-0 z-10 grid size-6 place-items-center text-[#FFFFFF66]">{icon}</div>
    <select className="h-6 w-full appearance-none rounded-[5px] bg-[#373737] pb-px pl-6 pr-5 text-xs leading-6 text-[#FFFFFFE6] outline-none [box-shadow:var(--field-shadow)] focus:[outline:2px_solid_#427FD8] focus:[outline-offset:-1px]" style={{ '--field-shadow': fieldShadow } as React.CSSProperties} value={value} onChange={(event) => onChange(event.target.value)}>{children}</select>
    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#FFFFFFA6]">v</span>
  </label>
}

function ColorField({ color, alpha, onChange, label }: { color: string; alpha: number; onChange: (color: string, alpha: number) => void; label: string }) {
  return <label className="relative flex h-6 min-w-0 flex-1 items-center">
    <input aria-label={`${label} picker`} type="color" className="absolute left-1 top-1 z-20 size-4 cursor-pointer opacity-0" value={color} onChange={(event) => onChange(event.target.value, alpha)} />
    <span className="absolute left-1 top-1 z-10 size-4 rounded-[1.5px] [box-shadow:#4D4D4D_0px_0px_0px_1px_inset]" style={{ background: color }} />
    <input aria-label={label} className="h-6 w-full rounded-[5px] bg-[#373737] pb-px pl-6 pr-1.5 text-xs leading-6 text-[#FFFFFFE6] outline-none [box-shadow:var(--field-shadow)] focus:[outline:2px_solid_#427FD8] focus:[outline-offset:-1px]" style={{ '--field-shadow': fieldShadow } as React.CSSProperties} value={colorLabel(color, alpha)} onChange={(event) => {
      const parsed = parseColorLabel(event.target.value, color, alpha)
      onChange(parsed.color, parsed.alpha)
    }} />
  </label>
}

function CheckRow({ label, checked, onChange, shortcut }: { label: string; checked: boolean; onChange: (checked: boolean) => void; shortcut?: string }) {
  return <Row><label className="flex items-center gap-1.5 text-xs/4 text-[#FFFFFFE6]"><input className="sr-only" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span className="grid size-4 place-items-center rounded-sm bg-[#373737] text-[10px] leading-none [box-shadow:#FFFFFF08_0px_1px_0px_inset,#FFFFFF33_0px_0px_1px_0.5px_inset,#00000022_0px_1px_0.5px,#000000BB_0px_0px_3px_-1px]">{checked ? 'x' : ''}</span>{label}{shortcut && <span className="text-[#FFFFFF93]">{shortcut}</span>}</label></Row>
}


function fillPreview(fill: Fill) {
  if (fill.type === 'solid') return fill.color
  if (fill.type === 'linear-gradient') return `linear-gradient(${fill.angle}deg, ${fill.stops.map((stop) => `${stop.color} ${stop.position}%`).join(', ')})`
  return `radial-gradient(circle at ${fill.center.x}% ${fill.center.y}%, ${fill.stops.map((stop) => `${stop.color} ${stop.position}%`).join(', ')})`
}

export function PropertiesPanel() {
  const { activePage, selectedIds, project, updateSelected, detachInstance, exportJson } = useEditorStore()
  const node = selectedIds.length === 1 && activePage ? activePage.nodes[selectedIds[0]] : null
  const fill = node?.fills[0] ?? solidFill(activePage?.backgroundColor ?? '#282828')
  const nodeHasFill = Boolean(node?.fills[0])
  const radius = node && typeof node.cornerRadius === 'number' ? node.cornerRadius : 0
  const radiusMax = node ? Math.max(1, Math.floor(Math.min(node.width, node.height) / 2)) : 96
  const innerShadows = ((node?.metadata.innerShadows as InnerShadow[] | undefined) ?? (node?.metadata.innerShadow ? [node.metadata.innerShadow as InnerShadow] : []))
  const filters = ((node?.metadata.filters as FilterLayer[] | undefined) ?? [
    ...(typeof node?.metadata.filterBlur === 'number' ? [{ type: 'blur' as const, value: node.metadata.filterBlur }] : []),
    ...(typeof node?.metadata.filterBrightness === 'number' ? [{ type: 'brightness' as const, value: node.metadata.filterBrightness }] : []),
    ...(typeof node?.metadata.filterContrast === 'number' ? [{ type: 'contrast' as const, value: node.metadata.filterContrast }] : []),
  ])
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
      <Row><button className="h-6 grow rounded-[5px] bg-[#373737] pb-px font-medium leading-6 [box-shadow:var(--field-shadow)]" style={{ '--field-shadow': fieldShadow } as React.CSSProperties}>Copy link <span className="text-[#FFFFFF93]">Ctrl + L</span></button></Row>
    </Section>

    {node && <>
      <Section title="Layout" actions={<><IconButton title="Fit">[]</IconButton><IconButton title="Hug">()</IconButton></>}>
        <Row><NumberField label="X" value={Math.round(node.x)} onChange={(x) => update({ x })} /><NumberField label="Y" value={Math.round(node.y)} onChange={(y) => update({ y })} /><NumberField label="R" value={Math.round(node.rotation)} suffix="°" onChange={(rotation) => update({ rotation })} /></Row>
        <Row><NumberField label="W" value={Math.round(node.width)} min={1} onChange={(width) => update({ width })} /><NumberField label="H" value={Math.round(node.height)} min={1} onChange={(height) => update({ height })} /><SelectField value={node.layout.mode} onChange={(mode) => update({ layout: { ...node.layout, mode } } as never)}><option value="none">None</option><option value="horizontal">Flex X</option><option value="vertical">Flex Y</option></SelectField></Row>
        <CheckRow label="Absolute position" checked={node.constraints.horizontal !== 'left' || node.constraints.vertical !== 'top'} onChange={(checked) => update({ constraints: checked ? { horizontal: 'center', vertical: 'center' } : { horizontal: 'left', vertical: 'top' } } as never)} />
        <CheckRow label="Clip content" shortcut="Alt + C" checked={'clipContent' in node ? node.clipContent : false} onChange={(clipContent) => update({ clipContent } as never)} />
      </Section>

      <Section title="Radius" actions={<IconButton>r</IconButton>}>
        <Row><input className="h-3 flex-1 accent-[#F9F9F9]" type="range" min="0" max={radiusMax} value={clamp(radius, 0, radiusMax)} onChange={(event) => update({ cornerRadius: Number(event.target.value) })} /><NumberField value={radius} min={0} max={radiusMax} onChange={(cornerRadius) => update({ cornerRadius })} /></Row>
      </Section>

      <Section title="Blending" actions={<IconButton>eye</IconButton>}>
        <Row><NumberField label="O" value={Math.round(node.opacity * 100)} suffix="%" min={0} max={100} onChange={(opacity) => update({ opacity: opacity / 100 })} /><SelectField icon="M" value="normal" onChange={() => undefined}><option value="normal">Normal</option><option value="multiply">Multiply</option><option value="screen">Screen</option></SelectField></Row>
      </Section>

      <Section title="Fill" muted={!nodeHasFill} onAdd={!nodeHasFill ? () => update({ fills: [solidFill('#282828', 1)] } as never) : undefined}>
        {nodeHasFill && <>
        <Row><div className="flex h-6 grow rounded-md bg-[#FFFFFF0D] p-px">
          {(['solid', 'linear-gradient', 'radial-gradient'] as const).map((type) => <button key={type} className={`flex-1 rounded-[5px] pb-px text-xs leading-5 ${fill.type === type ? 'bg-[#FFFFFF0D] font-medium text-[#FFFFFFE6] [box-shadow:#FFFFFF08_0px_1px_0px_inset,#FFFFFF22_0px_0px_1px_0.5px_inset,#00000022_0px_1px_0.5px,#000000BB_0px_0px_3px_-1px]' : 'text-[#FFFFFF93]'}`} onClick={() => update({ fills: [type === 'solid' ? solidFill(fill.type === 'solid' ? fill.color : '#282828') : type === 'linear-gradient' ? linearPreset : radialPreset] } as never)}>{type === 'solid' ? 'Solid' : type === 'linear-gradient' ? 'Gradient' : 'Image'}</button>)}
        </div><label className="grid size-6 place-items-center rounded-[5px] hover:bg-white/5"><span>img</span><input type="file" accept="image/*" hidden onChange={imageFill} /></label></Row>
        {fill.type === 'solid' && <Row><ColorField label="Fill color" color={fill.color} alpha={fill.alpha} onChange={(color, alpha) => update({ fills: [{ ...fill, color, alpha }] } as never)} /></Row>}
        {fill.type !== 'solid' && <Row><div className="h-6 flex-1 rounded-[5px] [box-shadow:var(--field-shadow)]" style={{ '--field-shadow': fieldShadow, background: fillPreview(fill) } as React.CSSProperties} /></Row>}
        {fill.type === 'linear-gradient' && <Row><NumberField label="∠" value={fill.angle} onChange={(angle) => update({ fills: [{ ...fill, angle }] } as never)} /><ColorField label="Stop A" color={fill.stops[0].color} alpha={fill.stops[0].alpha} onChange={(color, alpha) => { const stops = [...fill.stops]; stops[0] = { ...stops[0], color, alpha }; update({ fills: [{ ...fill, stops }] } as never) }} /><ColorField label="Stop B" color={fill.stops[1].color} alpha={fill.stops[1].alpha} onChange={(color, alpha) => { const stops = [...fill.stops]; stops[1] = { ...stops[1], color, alpha }; update({ fills: [{ ...fill, stops }] } as never) }} /></Row>}
        </>}
      </Section>

      <Section title="Outline" muted={node.strokes.length === 0} onAdd={() => update({ strokes: [...node.strokes, defaultStroke] } as never)}>
        {node.strokes.map((stroke, index) => <div key={index}>
          <Row><NumberField label="W" value={stroke.width} min={0} onChange={(width) => { const strokes = [...node.strokes]; strokes[index] = { ...stroke, width }; update({ strokes } as never) }} /><NumberField label="A" value={Math.round(stroke.alpha * 100)} suffix="%" min={0} max={100} onChange={(alpha) => { const strokes = [...node.strokes]; strokes[index] = { ...stroke, alpha: alpha / 100 }; update({ strokes } as never) }} /><IconButton onClick={() => update({ strokes: node.strokes.filter((_, i) => i !== index) } as never)}>-</IconButton></Row>
          <Row><ColorField label="Outline color" color={stroke.color} alpha={stroke.alpha} onChange={(color, alpha) => { const strokes = [...node.strokes]; strokes[index] = { ...stroke, color, alpha }; update({ strokes } as never) }} /></Row>
        </div>)}
      </Section>

      <Section title="Shadow" muted={node.effects.length === 0} onAdd={() => update({ effects: [...node.effects, defaultShadow] } as never)}>
        {node.effects.map((shadow, index) => <div key={index} className={index > 0 ? 'border-t border-[#373737BF] py-2' : ''}>
          <Row><div className="flex-1 text-[#FFFFFF93]">Drop shadow {index + 1}</div><IconButton onClick={() => update({ effects: node.effects.filter((_, i) => i !== index) } as never)}>-</IconButton></Row>
          <Row className="gap-3"><NumberField label="X" value={shadow.x} onChange={(x) => { const effects = [...node.effects]; effects[index] = { ...shadow, x }; update({ effects } as never) }} /><NumberField label="Y" value={shadow.y} onChange={(y) => { const effects = [...node.effects]; effects[index] = { ...shadow, y }; update({ effects } as never) }} /><NumberField label="B" value={shadow.blur} min={0} onChange={(blur) => { const effects = [...node.effects]; effects[index] = { ...shadow, blur }; update({ effects } as never) }} /><NumberField label="S" value={shadow.spread} onChange={(spread) => { const effects = [...node.effects]; effects[index] = { ...shadow, spread }; update({ effects } as never) }} /></Row>
          <Row><ColorField label="Shadow color" color={shadow.color} alpha={shadow.alpha} onChange={(color, alpha) => { const effects = [...node.effects]; effects[index] = { ...shadow, color, alpha }; update({ effects } as never) }} /></Row>
        </div>)}
      </Section>

      <Section title="Inner shadow" muted={innerShadows.length === 0} onAdd={() => setMeta({ innerShadows: [...innerShadows, defaultInner], innerShadow: undefined })}>
        {innerShadows.map((inner, index) => <div key={index} className={index > 0 ? 'border-t border-[#373737BF] py-2' : ''}>
          <Row><div className="flex-1 text-[#FFFFFF93]">Inner shadow {index + 1}</div><IconButton onClick={() => setMeta({ innerShadows: innerShadows.filter((_, i) => i !== index), innerShadow: undefined })}>-</IconButton></Row>
          <Row className="gap-3"><NumberField label="X" value={inner.x} onChange={(x) => { const next = [...innerShadows]; next[index] = { ...inner, x }; setMeta({ innerShadows: next, innerShadow: undefined }) }} /><NumberField label="Y" value={inner.y} onChange={(y) => { const next = [...innerShadows]; next[index] = { ...inner, y }; setMeta({ innerShadows: next, innerShadow: undefined }) }} /><NumberField label="B" value={inner.blur} min={0} onChange={(blur) => { const next = [...innerShadows]; next[index] = { ...inner, blur }; setMeta({ innerShadows: next, innerShadow: undefined }) }} /><NumberField label="S" value={inner.spread} onChange={(spread) => { const next = [...innerShadows]; next[index] = { ...inner, spread }; setMeta({ innerShadows: next, innerShadow: undefined }) }} /></Row>
          <Row><ColorField label="Inner shadow color" color={inner.color} alpha={inner.alpha} onChange={(color, alpha) => { const next = [...innerShadows]; next[index] = { ...inner, color, alpha }; setMeta({ innerShadows: next, innerShadow: undefined }) }} /></Row>
        </div>)}
      </Section>

      <Section title="Filters" muted={filters.length === 0} onAdd={() => setMeta({ filters: [...filters, { type: 'blur', value: 0 }], filterBlur: undefined, filterBrightness: undefined, filterContrast: undefined })}>
        {filters.map((filter, index) => <div key={index} className={index > 0 ? 'border-t border-[#373737BF] py-2' : ''}>
          <Row><SelectField value={filter.type} onChange={(type) => { const next = [...filters]; next[index] = { type: type as FilterLayer['type'], value: type === 'blur' ? 0 : 100 }; setMeta({ filters: next, filterBlur: undefined, filterBrightness: undefined, filterContrast: undefined }) }}><option value="blur">Blur</option><option value="brightness">Brightness</option><option value="contrast">Contrast</option></SelectField><IconButton onClick={() => setMeta({ filters: filters.filter((_, i) => i !== index), filterBlur: undefined, filterBrightness: undefined, filterContrast: undefined })}>-</IconButton></Row>
          <Row><NumberField label={filter.type === 'blur' ? 'B' : filter.type === 'brightness' ? 'L' : 'C'} value={filter.value} min={0} suffix={filter.type === 'blur' ? '' : '%'} onChange={(value) => { const next = [...filters]; next[index] = { ...filter, value }; setMeta({ filters: next, filterBlur: undefined, filterBrightness: undefined, filterContrast: undefined }) }} /></Row>
        </div>)}
      </Section>

      {node.type === 'text' && <Section title="Text"><Row><textarea className="min-h-16 w-full resize-none rounded-[5px] bg-[#373737] p-2 text-[#FFFFFFE6] outline-none [box-shadow:var(--field-shadow)]" style={{ '--field-shadow': fieldShadow } as React.CSSProperties} value={node.text} onChange={(event) => update({ text: event.target.value } as never)} /></Row><Row><SelectField value={node.fontFamily} onChange={(fontFamily) => update({ fontFamily } as never)}><option value="Geist">Geist</option><option value="Inter Variable">Inter</option><option value="Arial">Arial</option></SelectField><NumberField label="S" value={node.fontSize} onChange={(fontSize) => update({ fontSize } as never)} /></Row></Section>}
      {node.type === 'image' && <Section title="Video"><Row><SelectField icon="F" value={node.objectFit} onChange={(objectFit) => update({ objectFit } as never)}><option value="cover">Cover</option><option value="contain">Contain</option><option value="fill">Fill</option></SelectField></Row></Section>}
      {node.type === 'instance' && <Row><button className="h-6 grow rounded-[5px] bg-[#373737] pb-px font-medium leading-6 [box-shadow:var(--field-shadow)]" style={{ '--field-shadow': fieldShadow } as React.CSSProperties} onClick={detachInstance}>Detach</button></Row>}
    </>}

    <Section title="Guides"><Row><NumberField label="G" value={project.settings.gridSize} min={2} onChange={(gridSize) => useEditorStore.setState({ project: { ...project, settings: { ...project.settings, gridSize } } })} /><CheckRow label="Snap" checked={project.settings.snapToGrid} onChange={(snapToGrid) => useEditorStore.setState({ project: { ...project, settings: { ...project.settings, snapToGrid } } })} /></Row></Section>

    <Section title="Export">
      <Row><button className="h-6 flex-1 rounded-[5px] bg-[#373737] pb-px font-medium leading-6 [box-shadow:var(--field-shadow)]" style={{ '--field-shadow': fieldShadow } as React.CSSProperties} onClick={() => { const json = exportJson(); if (json) downloadText(`${project.name}.bran.json`, json) }}>Project</button><button className="h-6 flex-1 rounded-[5px] bg-[#373737] pb-px font-medium leading-6 [box-shadow:var(--field-shadow)]" style={{ '--field-shadow': fieldShadow } as React.CSSProperties} onClick={() => downloadText(`${activePage.name}.svg`, pageToSvg(activePage), 'image/svg+xml')}>SVG</button></Row>
    </Section>
  </aside>
}
