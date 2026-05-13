import type { Guide } from '@/editor/core/snapping'

export function GuidesOverlay({ guides }: { guides: Guide[] }) {
  return <g>{guides.map((guide, i) => guide.orientation === 'vertical' ? <line key={i} x1={guide.position} x2={guide.position} y1={guide.from} y2={guide.to} stroke="#ff4d8d" strokeWidth={1}/> : <line key={i} y1={guide.position} y2={guide.position} x1={guide.from} x2={guide.to} stroke="#ff4d8d" strokeWidth={1}/>)}</g>
}
