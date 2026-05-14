export type Brand<T, Name extends string> = T & { readonly __brand: Name }
export type ProjectId = Brand<string, 'ProjectId'>
export type PageId = Brand<string, 'PageId'>
export type NodeId = Brand<string, 'NodeId'>
export type ComponentId = Brand<string, 'ComponentId'>
export type StyleId = Brand<string, 'StyleId'>
export type TokenId = Brand<string, 'TokenId'>

export type NodeType =
  | 'frame'
  | 'rectangle'
  | 'text'
  | 'image'
  | 'group'
  | 'component'
  | 'instance'
  | 'section'
  | 'vector'
  | 'line'
  | 'ellipse'
  | 'polygon'
  | 'star'
  | 'boolean-group'
  | 'slice'
  | 'video'
  | 'embed'
  | 'shader'
  | 'connector'
  | 'artboard'
export type ToolId = 'select' | 'hand' | 'frame' | 'rectangle' | 'text' | 'image'

export type GradientStop = { color: string; position: number; alpha: number }
export type Fill =
  | { type: 'solid'; color: string; alpha: number; tokenId?: TokenId }
  | { type: 'linear-gradient'; angle: number; stops: GradientStop[]; alpha: number; tokenId?: TokenId }
  | { type: 'radial-gradient'; center: { x: number; y: number }; radius: number; stops: GradientStop[]; alpha: number; tokenId?: TokenId }
  | { type: 'image'; src: string; alpha: number; objectFit: 'fill' | 'contain' | 'cover'; crop?: { x: number; y: number; width: number; height: number }; tokenId?: TokenId }
  | { type: 'video'; src: string; alpha: number; poster?: string; playback: 'loop' | 'once' | 'manual'; tokenId?: TokenId }
  | { type: 'pattern'; sourceNodeId: NodeId; alpha: number; scale: number; rotation: number; tokenId?: TokenId }
export type Stroke = {
  color: string
  alpha: number
  width: number
  position: 'inside' | 'center' | 'outside'
  align?: 'inside' | 'center' | 'outside'
  cap?: 'butt' | 'round' | 'square'
  join?: 'miter' | 'round' | 'bevel'
  dash?: number[]
  tokenId?: TokenId
}
export type Effect = {
  type: 'drop-shadow' | 'inner-shadow' | 'layer-blur' | 'background-blur' | 'filter'
  x: number
  y: number
  blur: number
  spread: number
  color: string
  alpha: number
  filter?: 'blur' | 'brightness' | 'contrast' | 'saturation' | 'grayscale' | 'sepia' | 'invert' | 'hue-rotate'
  value?: number
}
export type Constraints = {
  horizontal: 'left' | 'right' | 'center' | 'left-right' | 'scale'
  vertical: 'top' | 'bottom' | 'center' | 'top-bottom' | 'scale'
}
export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity'
export type LayoutSizing = {
  horizontal: 'fixed' | 'hug' | 'fill'
  vertical: 'fixed' | 'hug' | 'fill'
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
}
export type GridTrackSize = { type: 'fixed'; value: number } | { type: 'fr'; value: number } | { type: 'auto' }
export type GridLayout = {
  columns: GridTrackSize[]
  rows: GridTrackSize[]
  columnGap: number
  rowGap: number
}
export type Layout = {
  mode: 'none' | 'horizontal' | 'vertical' | 'grid'
  padding: { top: number; right: number; bottom: number; left: number }
  gap: number
  alignItems: 'start' | 'center' | 'end' | 'stretch'
  justifyContent: 'start' | 'center' | 'end' | 'space-between'
  wrap: 'no-wrap' | 'wrap'
  childSizing: 'fixed' | 'fill' | 'hug'
  absolute?: boolean
  strokesIncludedInLayout?: boolean
  grid?: GridLayout
}
export type LayoutGuide =
  | { id: string; type: 'uniform'; size: number; color: string; opacity: number; visible: boolean }
  | { id: string; type: 'columns' | 'rows'; count: number; gutter: number; margin: number; color: string; opacity: number; visible: boolean }
export type CanvasGuide = { id: string; orientation: 'horizontal' | 'vertical'; position: number; color: string; visible: boolean }
export type ExportSetting = { format: 'png' | 'jpg' | 'svg' | 'webp' | 'avif' | 'pdf' | 'mp4'; scale?: number; width?: number; suffix?: string; enabled: boolean }
export type DevStatus = 'none' | 'ready' | 'completed'
export type Annotation = { id: string; label: string; value: string; createdAt: string }
export type CommentThread = { id: string; authorId: string; body: string; resolved: boolean; createdAt: string; updatedAt: string }
export type VariableModeOverrides = Record<string, string>

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
  zIndex: number
  opacity: number
  blendMode: BlendMode
  visible: boolean
  locked: boolean
  constraints: Constraints
  layoutSizing: LayoutSizing
  layout: Layout
  fills: Fill[]
  strokes: Stroke[]
  effects: Effect[]
  cornerRadius: number | { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number }
  exportSettings: ExportSetting[]
  devStatus: DevStatus
  annotations: Annotation[]
  comments: CommentThread[]
  variableModeOverrides: VariableModeOverrides
  createdAt: string
  updatedAt: string
  metadata: Record<string, unknown>
}

export type ContainerExtras = {
  clipContent: boolean
  layoutGuides: LayoutGuide[]
  canvasGuides: CanvasGuide[]
  prototypeStart?: boolean
  devicePreset?: string
  overflowBehavior: 'visible' | 'clip' | 'scroll'
}
export type FrameNode = BaseSceneNode & ContainerExtras & { type: 'frame' }
export type ArtboardNode = BaseSceneNode & ContainerExtras & { type: 'artboard' }
export type SectionNode = BaseSceneNode & ContainerExtras & { type: 'section'; sectionContentsHidden: boolean }
export type RectangleNode = BaseSceneNode & { type: 'rectangle' }
export type VectorNode = BaseSceneNode & { type: 'vector'; pathData: string }
export type LineNode = BaseSceneNode & { type: 'line' }
export type EllipseNode = BaseSceneNode & { type: 'ellipse' }
export type PolygonNode = BaseSceneNode & { type: 'polygon'; points: number }
export type StarNode = BaseSceneNode & { type: 'star'; points: number; innerRadius: number }
export type BooleanGroupNode = BaseSceneNode & { type: 'boolean-group'; operation: 'union' | 'subtract' | 'intersect' | 'exclude' }
export type SliceNode = BaseSceneNode & { type: 'slice' }
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
  paragraphIndent: number
  textAlignHorizontal: 'left' | 'center' | 'right' | 'justify'
  textAlignVertical: 'top' | 'middle' | 'bottom'
  textDecoration: 'none' | 'underline' | 'line-through'
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  textWrap: 'wrap' | 'nowrap' | 'truncate'
  color: string
  autoResize: 'none' | 'width' | 'height' | 'both'
  openTypeFeatures: Record<string, boolean>
  variableFontAxes: Record<string, number>
  textStyleId?: StyleId
}
export type ImageNode = BaseSceneNode & { type: 'image'; src: string; assetId?: string; alt: string; objectFit: 'fill' | 'contain' | 'cover'; crop?: { x: number; y: number; width: number; height: number } }
export type VideoNode = BaseSceneNode & { type: 'video'; src: string; assetId?: string; poster?: string; playback: 'loop' | 'once' | 'manual'; muted: boolean }
export type EmbedNode = BaseSceneNode & { type: 'embed'; url: string; provider?: string }
export type ShaderNode = BaseSceneNode & { type: 'shader'; shader: string; parameters: Record<string, number | string | boolean> }
export type ConnectorNode = BaseSceneNode & { type: 'connector'; startNodeId?: NodeId; endNodeId?: NodeId; points: { x: number; y: number }[] }
export type GroupNode = BaseSceneNode & { type: 'group' }
export type ComponentProperty =
  | { id: string; name: string; type: 'text'; defaultValue: string; targetNodeId?: NodeId }
  | { id: string; name: string; type: 'boolean'; defaultValue: boolean; targetNodeId?: NodeId }
  | { id: string; name: string; type: 'variant'; defaultValue: string; values: string[] }
  | { id: string; name: string; type: 'instance-swap'; defaultValue?: ComponentId; preferredValues: ComponentId[] }
  | { id: string; name: string; type: 'slot'; targetNodeId?: NodeId }
export type ComponentNode = BaseSceneNode & { type: 'component'; componentId: ComponentId; description?: string; componentProperties: ComponentProperty[]; variantProperties: Record<string, string>; slotIds: NodeId[] }
export type InstanceOverride = { propertyId?: string; nodeId?: NodeId; value: unknown }
export type InstanceNode = BaseSceneNode & { type: 'instance'; componentId: ComponentId; overrides: Record<string, InstanceOverride | unknown>; variantSelection: Record<string, string>; slotChildren: Record<string, NodeId[]> }
export type SceneNode =
  | FrameNode
  | ArtboardNode
  | SectionNode
  | RectangleNode
  | VectorNode
  | LineNode
  | EllipseNode
  | PolygonNode
  | StarNode
  | BooleanGroupNode
  | SliceNode
  | TextNode
  | ImageNode
  | VideoNode
  | EmbedNode
  | ShaderNode
  | ConnectorNode
  | GroupNode
  | ComponentNode
  | InstanceNode

export type ColorToken = { id: TokenId; type: 'color'; name: string; value: string; alpha: number; description?: string }
export type SpacingToken = { id: TokenId; type: 'spacing'; name: string; value: number; description?: string }
export type RadiusToken = { id: TokenId; type: 'radius'; name: string; value: number; description?: string }
export type StringToken = { id: TokenId; type: 'string'; name: string; value: string; description?: string }
export type BooleanToken = { id: TokenId; type: 'boolean'; name: string; value: boolean; description?: string }
export type Token = ColorToken | SpacingToken | RadiusToken | StringToken | BooleanToken
export type TextStyle = { id: StyleId; type: 'text'; name: string; fontFamily: string; fontSize: number; fontWeight: number; lineHeight: number; letterSpacing: number; colorTokenId?: TokenId }
export type EffectStyle = { id: StyleId; type: 'effect'; name: string; shadows: Effect[]; blur?: number }
export type ColorStyle = { id: StyleId; type: 'color'; name: string; fills: Fill[] }
export type GridStyle = { id: StyleId; type: 'grid'; name: string; layoutGuides: LayoutGuide[] }
export type ExportStyle = { id: StyleId; type: 'export'; name: string; exportSettings: ExportSetting[] }
export type Style = TextStyle | EffectStyle | ColorStyle | GridStyle | ExportStyle
export type ComponentVariant = { id: ComponentId; name: string; properties: Record<string, string>; rootNodeId: NodeId }
export type ComponentDefinition = {
  id: ComponentId
  name: string
  description?: string
  rootNodeId: NodeId
  nodeIds: NodeId[]
  properties: ComponentProperty[]
  variants: ComponentVariant[]
  defaultVariantId?: ComponentId
  libraryId?: string
  createdAt: string
  updatedAt: string
}
export type VariableAlias = { type: 'alias'; variableId: string }
export type VariableValue = string | number | boolean | VariableAlias
export type VariableDefinition = { id: string; name: string; type: 'color' | 'number' | 'string' | 'boolean'; valuesByMode: Record<string, VariableValue>; description?: string; group?: string }
export type VariableCollection = { id: string; name: string; defaultModeId: string; modes: Record<string, { id: string; name: string }>; variables: Record<string, VariableDefinition> }
export type LibraryDefinition = { id: string; name: string; description?: string; publishedAt?: string; remote: boolean }
export type PrototypeInteraction = {
  id: string
  sourceNodeId: NodeId
  trigger: 'click' | 'hover' | 'drag' | 'after-delay'
  action: 'navigate' | 'open-overlay' | 'swap-overlay' | 'close-overlay' | 'set-variable-mode' | 'open-url'
  destinationId?: NodeId
  transition: 'instant' | 'dissolve' | 'move-in' | 'push' | 'smart-animate'
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
  durationMs: number
  overlay?: { position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'manual'; closeOnOutsideClick: boolean; backgroundColor: string; backgroundAlpha: number }
}

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
  variableModeOverrides: VariableModeOverrides
  prototypeInteractions: PrototypeInteraction[]
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
  variableCollections: Record<string, VariableCollection>
  libraries: Record<string, LibraryDefinition>
  settings: { snapToGrid: boolean; gridSize: number; theme: 'system' | 'light' | 'dark'; autosave: boolean; showLayoutGuides: boolean; showPixelGrid: boolean; multiplayer: boolean }
  enterprise: { teamId?: string; permissions: Record<string, 'owner' | 'admin' | 'editor' | 'viewer'>; auditLog: { id: string; actorId: string; action: string; createdAt: string }[] }
}
