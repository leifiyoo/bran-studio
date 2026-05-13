import type { Rect } from '@/editor/core/geometry'

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se'
export function SelectionOverlay({ rect, zoom = 1, onResizeStart }: { rect: Rect | null; zoom?: number; onResizeStart?: (event: React.PointerEvent, handle: ResizeHandle) => void }) {
  if (!rect) return null
  const size = 8 / zoom
  const handles: [ResizeHandle, number, number][] = [['nw', rect.x, rect.y], ['n', rect.x + rect.width / 2, rect.y], ['ne', rect.x + rect.width, rect.y], ['w', rect.x, rect.y + rect.height / 2], ['e', rect.x + rect.width, rect.y + rect.height / 2], ['sw', rect.x, rect.y + rect.height], ['s', rect.x + rect.width / 2, rect.y + rect.height], ['se', rect.x + rect.width, rect.y + rect.height]]
  return <g><rect {...rect} fill="none" stroke="#2563eb" strokeWidth={1.5 / zoom}/>{handles.map(([handle,x,y])=><rect key={handle} x={x-size/2} y={y-size/2} width={size} height={size} fill="#fff" stroke="#2563eb" strokeWidth={1 / zoom} onPointerDown={(event)=>onResizeStart?.(event, handle)} style={{cursor: `${handle}-resize`}}/>)}</g>
}
