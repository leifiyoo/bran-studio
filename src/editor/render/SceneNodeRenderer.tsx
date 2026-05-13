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
  const common = { transform: `translate(${node.x} ${node.y}) rotate(${node.rotation})`, opacity: node.opacity, onPointerDown: (event: React.PointerEvent) => onPointerDown(event, node), onDoubleClick: () => onDoubleClick(node), style: { cursor: node.locked ? 'not-allowed' : 'move' } }
  const fill = fillPaint(node)
  const stroke = selected ? '#2357ff' : node.strokes[0]?.color ?? 'transparent'
  const strokeWidth = selected ? 2 : node.strokes[0]?.width ?? 0
  if (node.type === 'text') {
    return <g {...common}><foreignObject width={node.width} height={node.height}><div style={{fontFamily: `${node.fontFamily}, Inter, Arial, sans-serif`, fontSize: node.fontSize, fontWeight: node.fontWeight, letterSpacing: node.letterSpacing, lineHeight: `${node.lineHeight}px`, color: node.color, whiteSpace: 'pre-wrap', overflow: 'hidden', textAlign: node.textAlignHorizontal as never}}>{node.text}</div></foreignObject>{selected && <rect width={node.width} height={node.height} fill="none" stroke="#2563eb" strokeWidth={1.5}/>}</g>
  }
  if (node.type === 'image') {
    return <g {...common}><clipPath id={`clip-${node.id}`}><rect width={node.width} height={node.height} rx={typeof node.cornerRadius === 'number' ? node.cornerRadius : 0}/></clipPath><image href={node.src} width={node.width} height={node.height} preserveAspectRatio={node.objectFit === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice'} clipPath={`url(#clip-${node.id})`}/><rect width={node.width} height={node.height} rx={typeof node.cornerRadius === 'number' ? node.cornerRadius : 0} fill="none" stroke={stroke} strokeWidth={strokeWidth}/></g>
  }
  return <g {...common}><FillDefs node={node}/><rect width={node.width} height={node.height} rx={typeof node.cornerRadius === 'number' ? node.cornerRadius : 0} fill={node.type === 'instance' ? '#f8fafc' : fill} stroke={stroke} strokeWidth={strokeWidth}/>{node.type === 'instance' && <text x={16} y={32} fontSize={16} fill="#2563eb">Instance</text>}</g>
}
