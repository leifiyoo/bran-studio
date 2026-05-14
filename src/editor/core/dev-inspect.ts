import type { Fill, SceneNode } from './scene-types'

function firstSolid(fill: Fill | undefined) {
  return fill?.type === 'solid' ? fill.color : undefined
}

function radius(node: SceneNode) {
  return typeof node.cornerRadius === 'number' ? `${node.cornerRadius}px` : `${node.cornerRadius.topLeft}px ${node.cornerRadius.topRight}px ${node.cornerRadius.bottomRight}px ${node.cornerRadius.bottomLeft}px`
}

export function describeNodeForDevMode(node: SceneNode) {
  const fill = firstSolid(node.fills[0])
  const stroke = node.strokes[0]
  const cssLines = [
    'position: absolute;',
    `left: ${Math.round(node.x * 100) / 100}px;`,
    `top: ${Math.round(node.y * 100) / 100}px;`,
    `width: ${Math.round(node.width * 100) / 100}px;`,
    `height: ${Math.round(node.height * 100) / 100}px;`,
    node.rotation ? `transform: rotate(${node.rotation}deg);` : '',
    node.opacity < 1 ? `opacity: ${node.opacity};` : '',
    node.blendMode !== 'normal' ? `mix-blend-mode: ${node.blendMode};` : '',
    fill ? `background: ${fill};` : '',
    `border-radius: ${radius(node)};`,
    stroke ? `border: ${stroke.width}px solid ${stroke.color};` : '',
  ].filter(Boolean)
  if (node.type === 'text') {
    cssLines.push(`font-family: ${node.fontFamily};`, `font-size: ${node.fontSize}px;`, `font-weight: ${node.fontWeight};`, `line-height: ${node.lineHeight}px;`, `letter-spacing: ${node.letterSpacing}px;`, `color: ${node.color};`)
  }
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    measurements: { x: node.x, y: node.y, width: node.width, height: node.height, rotation: node.rotation },
    css: cssLines.join('\n'),
    tailwind: ['absolute', `left-[${Math.round(node.x)}px]`, `top-[${Math.round(node.y)}px]`, `w-[${Math.round(node.width)}px]`, `h-[${Math.round(node.height)}px]`].join(' '),
    exportSettings: node.exportSettings,
    devStatus: node.devStatus,
  }
}
