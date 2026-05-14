import type { SpacingMatch } from '@/editor/core/smart-spacing'

export function SpacingOverlay({ matches, zoom }: { matches: SpacingMatch[]; zoom: number }) {
  return (
    <g pointerEvents="none">
      {matches.map((match, index) => {
        if (match.orientation === 'horizontal') {
          const y = match.moving.y + match.moving.height / 2
          const x1 = match.from.x + match.from.width
          const x2 = match.moving.x
          const labelX = (x1 + x2) / 2
          return <g key={index}><line x1={x1} x2={x2} y1={y} y2={y} stroke="#FF4D8D" strokeWidth={1 / zoom}/><text x={labelX} y={y - 6 / zoom} textAnchor="middle" fontSize={11 / zoom} fill="#FFB3CF">{match.spacing}</text></g>
        }
        const x = match.moving.x + match.moving.width / 2
        const y1 = match.from.y + match.from.height
        const y2 = match.moving.y
        const labelY = (y1 + y2) / 2
        return <g key={index}><line x1={x} x2={x} y1={y1} y2={y2} stroke="#FF4D8D" strokeWidth={1 / zoom}/><text x={x + 6 / zoom} y={labelY} fontSize={11 / zoom} fill="#FFB3CF">{match.spacing}</text></g>
      })}
    </g>
  )
}
