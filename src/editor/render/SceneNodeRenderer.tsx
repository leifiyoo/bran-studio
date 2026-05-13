'use client'

import type { SceneNode } from '@/editor/core/scene-types'

export function fillPaint(node: SceneNode) {
  const fill = node.fills[0]
  if (!fill) return 'transparent'
  if (fill.type === 'solid') return fill.color
  return `url(#fill-${node.id})`
}

export function FillDefs({ node }: { node: SceneNode }) {
  const fill = node.fills[0]
  if (!fill || fill.type === 'solid') return null
  if (fill.type === 'linear-gradient') {
    const radians = (fill.angle * Math.PI) / 180
    const x = Math.cos(radians) * 50
    const y = Math.sin(radians) * 50
    return <linearGradient id={`fill-${node.id}`} x1={`${50 - x}%`} y1={`${50 - y}%`} x2={`${50 + x}%`} y2={`${50 + y}%`}>{fill.stops.map((stop, index) => <stop key={index} offset={`${stop.position}%`} stopColor={stop.color} stopOpacity={stop.alpha * fill.alpha}/>)}</linearGradient>
  }
  return <radialGradient id={`fill-${node.id}`} cx={`${fill.center.x}%`} cy={`${fill.center.y}%`} r={`${fill.radius}%`}>{fill.stops.map((stop, index) => <stop key={index} offset={`${stop.position}%`} stopColor={stop.color} stopOpacity={stop.alpha * fill.alpha}/>)}</radialGradient>
}

export function SceneNodeRenderer({ node, selected, onPointerDown, onDoubleClick }: { node: SceneNode; selected: boolean; onPointerDown: (event: React.PointerEvent, node: SceneNode) => void; onDoubleClick: (node: SceneNode) => void }) {
  if (!node.visible) return null
  const filters = ((node.metadata.filters as Array<{ type?: string; value?: number }> | undefined) ?? [
    ...(typeof node.metadata.filterBlur === 'number' ? [{ type: 'blur', value: node.metadata.filterBlur }] : []),
    ...(typeof node.metadata.filterBrightness === 'number' ? [{ type: 'brightness', value: node.metadata.filterBrightness }] : []),
    ...(typeof node.metadata.filterContrast === 'number' ? [{ type: 'contrast', value: node.metadata.filterContrast }] : []),
  ])
  const cssFilter = [
    ...node.effects.map((effect) => `drop-shadow(${effect.x}px ${effect.y}px ${effect.blur}px color-mix(in srgb, ${effect.color} ${Math.round(effect.alpha * 100)}%, transparent))`),
    ...filters.map((filter) => filter.type === 'blur' ? `blur(${filter.value ?? 0}px)` : filter.type === 'brightness' ? `brightness(${filter.value ?? 100}%)` : filter.type === 'contrast' ? `contrast(${filter.value ?? 100}%)` : ''),
  ].filter(Boolean).join(' ')
  const common = { transform: `translate(${node.x} ${node.y}) rotate(${node.rotation})`, opacity: node.opacity, onPointerDown: (event: React.PointerEvent) => onPointerDown(event, node), onDoubleClick: () => onDoubleClick(node), style: { cursor: node.locked ? 'not-allowed' : 'move', filter: cssFilter || undefined } }
  const fill = fillPaint(node)
  const stroke = selected ? '#2357ff' : node.strokes[0]?.color ?? 'transparent'
  const strokeWidth = selected ? 2 : node.strokes[0]?.width ?? 0
  const strokeOpacity = selected ? 1 : node.strokes[0]?.alpha ?? 1
  const innerShadows = ((node.metadata.innerShadows as Array<{ blur?: number; color?: string; alpha?: number }> | undefined) ?? (node.metadata.innerShadow ? [node.metadata.innerShadow as { blur?: number; color?: string; alpha?: number }] : []))
  const innerOverlay = innerShadows.map((inner, index) => <rect key={index} width={node.width} height={node.height} rx={typeof node.cornerRadius === 'number' ? node.cornerRadius : 0} fill="none" stroke={inner.color ?? '#000000'} strokeOpacity={inner.alpha ?? 0.18} strokeWidth={Math.max(1, (inner.blur ?? 2) * 2)} style={{ pointerEvents: 'none' }} />)
  if (node.type === 'text') {
    return <g {...common}><foreignObject width={node.width} height={node.height}><div style={{fontFamily: `${node.fontFamily}, Geist, Inter, Arial, sans-serif`, fontSize: node.fontSize, fontWeight: node.fontWeight, letterSpacing: node.letterSpacing, lineHeight: `${node.lineHeight}px`, color: node.color, whiteSpace: 'pre-wrap', overflow: 'hidden', textAlign: node.textAlignHorizontal as never}}>{node.text}</div></foreignObject>{selected && <rect width={node.width} height={node.height} fill="none" stroke="#2563eb" strokeWidth={1.5}/>}</g>
  }
  if (node.type === 'image') {
    return <g {...common}><clipPath id={`clip-${node.id}`}><rect width={node.width} height={node.height} rx={typeof node.cornerRadius === 'number' ? node.cornerRadius : 0}/></clipPath><image href={node.src} width={node.width} height={node.height} preserveAspectRatio={node.objectFit === 'contain' ? 'xMidYMid meet' : node.objectFit === 'fill' ? 'none' : 'xMidYMid slice'} clipPath={`url(#clip-${node.id})`}/>{innerOverlay}<rect width={node.width} height={node.height} rx={typeof node.cornerRadius === 'number' ? node.cornerRadius : 0} fill="none" stroke={stroke} strokeOpacity={strokeOpacity} strokeWidth={strokeWidth}/></g>
  }
  return <g {...common}><FillDefs node={node}/><rect width={node.width} height={node.height} rx={typeof node.cornerRadius === 'number' ? node.cornerRadius : 0} fill={node.type === 'instance' ? '#f8fafc' : fill} stroke={stroke} strokeOpacity={strokeOpacity} strokeWidth={strokeWidth}/>{innerOverlay}{node.type === 'instance' && <text x={16} y={32} fontSize={16} fill="#2563eb">Instance</text>}</g>
}
