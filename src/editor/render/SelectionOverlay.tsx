import type { Rect } from '@/editor/core/geometry'

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se'
export function SelectionOverlay({ rect, zoom = 1, onResizeStart, variant = 'selection' }: { rect: Rect | null; zoom?: number; onResizeStart?: (event: React.PointerEvent, handle: ResizeHandle) => void; variant?: 'selection' | 'marquee' | 'create' }) {
  if (!rect) return null
  const size = 8 / zoom
  const handles: [ResizeHandle, number, number][] = [['nw', rect.x, rect.y], ['n', rect.x + rect.width / 2, rect.y], ['ne', rect.x + rect.width, rect.y], ['w', rect.x, rect.y + rect.height / 2], ['e', rect.x + rect.width, rect.y + rect.height / 2], ['sw', rect.x, rect.y + rect.height], ['s', rect.x + rect.width / 2, rect.y + rect.height], ['se', rect.x + rect.width, rect.y + rect.height]]
  if (variant === 'marquee') return <g pointerEvents="none"><rect {...rect} fill="rgba(66,127,216,.08)" stroke="#427FD8" strokeDasharray={`${4 / zoom} ${3 / zoom}`} strokeWidth={1 / zoom} /></g>
  if (variant === 'create') return <g pointerEvents="none"><rect {...rect} fill="rgba(255,255,255,.08)" stroke="#FFFFFF99" strokeDasharray={`${5 / zoom} ${3 / zoom}`} strokeWidth={1 / zoom} /></g>
  return <g><rect x={rect.x - 1 / zoom} y={rect.y - 1 / zoom} width={rect.width + 2 / zoom} height={rect.height + 2 / zoom} fill="none" stroke="#427FD8" strokeWidth={1.25 / zoom}/>{handles.map(([handle,x,y])=><rect key={handle} x={x-size/2} y={y-size/2} width={size} height={size} rx={1 / zoom} fill="#fff" stroke="#427FD8" strokeWidth={1 / zoom} onPointerDown={(event)=>onResizeStart?.(event, handle)} style={{cursor: `${handle}-resize`}}/>)}</g>
}
