export function GridOverlay({ gridSize, zoom }: { gridSize: number; zoom: number }) {
  const minorOpacity = zoom >= 3 ? 0.1 : 0
  const majorOpacity = zoom >= 2 ? 0.16 : 0
  const major = gridSize * 8
  return <defs>
    <pattern id="grid-minor" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
      <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke={`rgba(255,255,255,${minorOpacity})`} strokeWidth={1 / Math.max(zoom, 0.2)} />
    </pattern>
    <pattern id="grid-major" width={major} height={major} patternUnits="userSpaceOnUse">
      <path d={`M ${major} 0 L 0 0 0 ${major}`} fill="none" stroke={`rgba(255,255,255,${majorOpacity})`} strokeWidth={1 / Math.max(zoom, 0.2)} />
    </pattern>
  </defs>
}
