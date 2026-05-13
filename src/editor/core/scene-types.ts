export type Brand<T, Name extends string> = T & { readonly __brand: Name }
export type ProjectId = Brand<string, 'ProjectId'>
export type PageId = Brand<string, 'PageId'>
export type NodeId = Brand<string, 'NodeId'>
export type ComponentId = Brand<string, 'ComponentId'>
export type StyleId = Brand<string, 'StyleId'>
export type TokenId = Brand<string, 'TokenId'>

export type NodeType = 'frame' | 'rectangle' | 'text' | 'image' | 'group' | 'component' | 'instance'
export type ToolId = 'select' | 'hand' | 'frame' | 'rectangle' | 'text' | 'image'

export type GradientStop = { color: string; position: number; alpha: number }
export type Fill =
  | { type: 'solid'; color: string; alpha: number; tokenId?: TokenId }
  | { type: 'linear-gradient'; angle: number; stops: GradientStop[]; alpha: number; tokenId?: TokenId }
  | { type: 'radial-gradient'; center: { x: number; y: number }; radius: number; stops: GradientStop[]; alpha: number; tokenId?: TokenId }
export type Stroke = { color: string; alpha: number; width: number; position: 'center' }
export type Effect = { type: 'drop-shadow'; x: number; y: number; blur: number; spread: number; color: string; alpha: number }
export type Constraints = {
  horizontal: 'left' | 'right' | 'center' | 'left-right' | 'scale'
  vertical: 'top' | 'bottom' | 'center' | 'top-bottom' | 'scale'
}
export type Layout = {
  mode: 'none' | 'horizontal' | 'vertical'
  padding: { top: number; right: number; bottom: number; left: number }
  gap: number
  alignItems: 'start' | 'center' | 'end' | 'stretch'
  justifyContent: 'start' | 'center' | 'end' | 'space-between'
  wrap: 'no-wrap' | 'wrap'
  childSizing: 'fixed' | 'fill' | 'hug'
}

export type BaseSceneNode = {
  id: NodeId
  type: NodeType
  name: string
  parentId: NodeId | null
  children: NodeId[]
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  visible: boolean
  locked: boolean
  constraints: Constraints
  layout: Layout
  fills: Fill[]
  strokes: Stroke[]
  effects: Effect[]
  cornerRadius: number | { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number }
  createdAt: string
  updatedAt: string
  metadata: Record<string, unknown>
}

export type FrameNode = BaseSceneNode & { type: 'frame'; clipContent: boolean; devicePreset?: string }
export type RectangleNode = BaseSceneNode & { type: 'rectangle' }
export type TextNode = BaseSceneNode & {
  type: 'text'
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: 300 | 400 | 500 | 600 | 700 | 800
  fontStyle: 'normal' | 'italic'
  lineHeight: number
  letterSpacing: number
  paragraphSpacing: number
  textAlignHorizontal: 'left' | 'center' | 'right' | 'justify'
  textAlignVertical: 'top' | 'middle' | 'bottom'
  textDecoration: 'none' | 'underline' | 'line-through'
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  color: string
  autoResize: 'none' | 'width' | 'height' | 'both'
  textStyleId?: StyleId
}
export type ImageNode = BaseSceneNode & { type: 'image'; src: string; assetId?: string; alt: string; objectFit: 'fill' | 'contain' | 'cover'; crop?: { x: number; y: number; width: number; height: number } }
export type GroupNode = BaseSceneNode & { type: 'group' }
export type ComponentNode = BaseSceneNode & { type: 'component'; componentId: ComponentId; description?: string }
export type InstanceNode = BaseSceneNode & { type: 'instance'; componentId: ComponentId; overrides: Record<string, unknown> }
export type SceneNode = FrameNode | RectangleNode | TextNode | ImageNode | GroupNode | ComponentNode | InstanceNode

export type ColorToken = { id: TokenId; type: 'color'; name: string; value: string; alpha: number; description?: string }
export type SpacingToken = { id: TokenId; type: 'spacing'; name: string; value: number; description?: string }
export type RadiusToken = { id: TokenId; type: 'radius'; name: string; value: number; description?: string }
export type Token = ColorToken | SpacingToken | RadiusToken
export type TextStyle = { id: StyleId; type: 'text'; name: string; fontFamily: string; fontSize: number; fontWeight: number; lineHeight: number; letterSpacing: number; colorTokenId?: TokenId }
export type EffectStyle = { id: StyleId; type: 'effect'; name: string; shadows: Effect[]; blur?: number }
export type Style = TextStyle | EffectStyle
export type ComponentDefinition = { id: ComponentId; name: string; description?: string; rootNodeId: NodeId; nodeIds: NodeId[]; createdAt: string; updatedAt: string }

export type ViewportState = { x: number; y: number; zoom: number }
export type Page = {
  id: PageId
  projectId: ProjectId
  name: string
  nodes: Record<NodeId, SceneNode>
  rootNodeIds: NodeId[]
  createdAt: string
  updatedAt: string
  backgroundColor: string
  viewportState: ViewportState
}
export type Project = {
  id: ProjectId
  name: string
  description: string
  createdAt: string
  updatedAt: string
  version: number
  thumbnail?: string
  pages: PageId[]
  activePageId: PageId
  components: Record<ComponentId, ComponentDefinition>
  styles: Record<StyleId, Style>
  tokens: Record<TokenId, Token>
  settings: { snapToGrid: boolean; gridSize: number; theme: 'system' | 'light' | 'dark'; autosave: boolean }
}
