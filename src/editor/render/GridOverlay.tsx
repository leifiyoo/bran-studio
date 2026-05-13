export function GridOverlay({ gridSize }: { gridSize: number }) {
  return <defs><pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse"><path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="rgba(120,120,120,.22)" strokeWidth="1"/></pattern></defs>
}
