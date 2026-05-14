import { z } from 'zod'

const id = z.string().min(1)
const nodeTypeSchema = z.enum(['frame', 'rectangle', 'text', 'image', 'group', 'component', 'instance', 'section', 'vector', 'line', 'ellipse', 'polygon', 'star', 'boolean-group', 'slice', 'video', 'embed', 'shader', 'connector', 'artboard'])
const gradientStopSchema = z.object({ color: z.string(), position: z.number().min(0).max(100), alpha: z.number().min(0).max(1) })
const fillSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('solid'), color: z.string(), alpha: z.number(), tokenId: id.optional() }),
  z.object({ type: z.literal('linear-gradient'), angle: z.number(), stops: z.array(gradientStopSchema).min(2), alpha: z.number(), tokenId: id.optional() }),
  z.object({ type: z.literal('radial-gradient'), center: z.object({ x: z.number(), y: z.number() }), radius: z.number(), stops: z.array(gradientStopSchema).min(2), alpha: z.number(), tokenId: id.optional() }),
  z.object({ type: z.literal('image'), src: z.string(), alpha: z.number(), objectFit: z.enum(['fill', 'contain', 'cover']), crop: z.object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() }).optional(), tokenId: id.optional() }),
  z.object({ type: z.literal('video'), src: z.string(), alpha: z.number(), poster: z.string().optional(), playback: z.enum(['loop', 'once', 'manual']), tokenId: id.optional() }),
  z.object({ type: z.literal('pattern'), sourceNodeId: id, alpha: z.number(), scale: z.number(), rotation: z.number(), tokenId: id.optional() }),
])
const strokeSchema = z.object({ color: z.string(), alpha: z.number(), width: z.number(), position: z.enum(['inside', 'center', 'outside']), align: z.enum(['inside', 'center', 'outside']).optional(), cap: z.enum(['butt', 'round', 'square']).optional(), join: z.enum(['miter', 'round', 'bevel']).optional(), dash: z.array(z.number()).optional(), tokenId: id.optional() })
const effectSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('drop-shadow'), x: z.number(), y: z.number(), blur: z.number(), spread: z.number(), color: z.string(), alpha: z.number() }),
  z.object({ type: z.literal('inner-shadow'), x: z.number(), y: z.number(), blur: z.number(), spread: z.number(), color: z.string(), alpha: z.number() }),
  z.object({ type: z.literal('layer-blur'), blur: z.number() }),
  z.object({ type: z.literal('background-blur'), blur: z.number() }),
  z.object({ type: z.literal('filter'), filter: z.enum(['blur', 'brightness', 'contrast', 'saturation', 'grayscale', 'sepia', 'invert', 'hue-rotate']), value: z.number() }),
])
const constraintsSchema = z.object({ horizontal: z.enum(['left', 'right', 'center', 'left-right', 'scale']), vertical: z.enum(['top', 'bottom', 'center', 'top-bottom', 'scale']) })
const gridTrackSchema = z.union([z.object({ type: z.literal('fixed'), value: z.number() }), z.object({ type: z.literal('fr'), value: z.number() }), z.object({ type: z.literal('auto') })])
const layoutSchema = z.object({
  mode: z.enum(['none', 'horizontal', 'vertical', 'grid']),
  padding: z.object({ top: z.number(), right: z.number(), bottom: z.number(), left: z.number() }),
  gap: z.number(),
  alignItems: z.enum(['start', 'center', 'end', 'stretch']),
  justifyContent: z.enum(['start', 'center', 'end', 'space-between']),
  wrap: z.enum(['no-wrap', 'wrap']),
  childSizing: z.enum(['fixed', 'fill', 'hug']),
  absolute: z.boolean().optional(),
  strokesIncludedInLayout: z.boolean().optional(),
  grid: z.object({ columns: z.array(gridTrackSchema), rows: z.array(gridTrackSchema), columnGap: z.number(), rowGap: z.number() }).optional(),
})
const exportSettingSchema = z.object({ format: z.enum(['png', 'jpg', 'svg', 'webp', 'avif', 'pdf', 'mp4']), scale: z.number().optional(), width: z.number().optional(), suffix: z.string().optional(), enabled: z.boolean() })

const baseNodeSchema = z.object({
  id,
  type: nodeTypeSchema,
  name: z.string(),
  parentId: id.nullable(),
  children: z.array(id),
  x: z.number(),
  y: z.number(),
  width: z.number().nonnegative(),
  height: z.number().nonnegative(),
  rotation: z.number(),
  zIndex: z.number(),
  opacity: z.number().min(0).max(1),
  blendMode: z.string(),
  visible: z.boolean(),
  locked: z.boolean(),
  constraints: constraintsSchema,
  layoutSizing: z.object({ horizontal: z.enum(['fixed', 'hug', 'fill']), vertical: z.enum(['fixed', 'hug', 'fill']), minWidth: z.number().optional(), maxWidth: z.number().optional(), minHeight: z.number().optional(), maxHeight: z.number().optional() }),
  layout: layoutSchema,
  fills: z.array(fillSchema),
  strokes: z.array(strokeSchema),
  effects: z.array(effectSchema),
  cornerRadius: z.union([z.number(), z.object({ topLeft: z.number(), topRight: z.number(), bottomRight: z.number(), bottomLeft: z.number() })]),
  exportSettings: z.array(exportSettingSchema),
  devStatus: z.enum(['none', 'ready', 'completed']),
  annotations: z.array(z.object({ id, label: z.string(), value: z.string(), createdAt: z.string() })),
  comments: z.array(z.object({ id, authorId: z.string(), body: z.string(), resolved: z.boolean(), createdAt: z.string(), updatedAt: z.string() })),
  variableModeOverrides: z.record(z.string(), z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.record(z.string(), z.unknown()),
}).passthrough()

export const sceneNodeSchema = baseNodeSchema

export const pageSchema = z.object({
  id,
  projectId: id,
  name: z.string(),
  nodes: z.record(id, sceneNodeSchema),
  rootNodeIds: z.array(id),
  createdAt: z.string(),
  updatedAt: z.string(),
  backgroundColor: z.string(),
  viewportState: z.object({ x: z.number(), y: z.number(), zoom: z.number() }),
  variableModeOverrides: z.record(z.string(), z.string()),
  prototypeInteractions: z.array(z.object({ id, sourceNodeId: id }).passthrough()),
}).passthrough()

export const tokenSchema = z.object({ id, type: z.enum(['color', 'spacing', 'radius', 'string', 'boolean']), name: z.string() }).passthrough()
export const styleSchema = z.object({ id, type: z.enum(['text', 'effect', 'color', 'grid', 'export']), name: z.string() }).passthrough()

export const projectSchema = z.object({
  id,
  name: z.string(),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number(),
  thumbnail: z.string().optional(),
  pages: z.array(id),
  activePageId: id,
  components: z.record(id, z.object({ id, name: z.string(), rootNodeId: id, nodeIds: z.array(id) }).passthrough()),
  styles: z.record(id, styleSchema),
  tokens: z.record(id, tokenSchema),
  variableCollections: z.record(z.string(), z.object({ id, name: z.string(), defaultModeId: z.string(), modes: z.record(z.string(), z.object({ id: z.string(), name: z.string() })), variables: z.record(z.string(), z.object({ id: z.string(), name: z.string(), type: z.enum(['color', 'number', 'string', 'boolean']), valuesByMode: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.object({ type: z.literal('alias'), variableId: z.string() })])) }).passthrough()) }).passthrough()),
  libraries: z.record(z.string(), z.object({ id: z.string(), name: z.string(), remote: z.boolean() }).passthrough()),
  settings: z.object({ snapToGrid: z.boolean(), gridSize: z.number(), theme: z.enum(['system', 'light', 'dark']), autosave: z.boolean(), showLayoutGuides: z.boolean(), showPixelGrid: z.boolean(), multiplayer: z.boolean() }).passthrough(),
  enterprise: z.object({ teamId: z.string().optional(), permissions: z.record(z.string(), z.enum(['owner', 'admin', 'editor', 'viewer'])), auditLog: z.array(z.object({ id: z.string(), actorId: z.string(), action: z.string(), createdAt: z.string() })) }).passthrough(),
}).passthrough()

export const exportSchema = z.object({ format: z.literal('bran.project'), version: z.number(), exportedAt: z.string(), project: projectSchema, pages: z.array(pageSchema), assets: z.array(z.object({ id: z.string(), projectId: id, name: z.string(), type: z.string(), dataUrl: z.string(), createdAt: z.string() }).passthrough()) })
