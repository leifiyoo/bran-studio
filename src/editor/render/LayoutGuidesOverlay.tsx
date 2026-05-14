import { layoutGuideSegments } from '@/editor/core/layout-guides'
import type { SceneNode } from '@/editor/core/scene-types'

export function LayoutGuidesOverlay({ nodes }: { nodes: SceneNode[] }) {
  const segments = nodes.flatMap(layoutGuideSegments)
  return (
    <g pointerEvents="none">
      {segments.map((segment, index) =>
        segment.orientation === 'vertical' ? (
          <line key={index} x1={segment.position} x2={segment.position} y1={segment.from} y2={segment.to} stroke={segment.color} strokeOpacity={segment.opacity} strokeWidth={1} />
        ) : (
          <line key={index} y1={segment.position} y2={segment.position} x1={segment.from} x2={segment.to} stroke={segment.color} strokeOpacity={segment.opacity} strokeWidth={1} />
        ),
      )}
    </g>
  )
}
