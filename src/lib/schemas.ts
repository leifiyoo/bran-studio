import { z } from 'zod'

const id = z.string().min(3)
const gradientStopSchema = z.object({ color: z.string(), position: z.number().min(0).max(100), alpha: z.number().min(0).max(1) })
const fillSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('solid'), color: z.string(), alpha: z.number(), tokenId: id.optional() }),
  z.object({ type: z.literal('linear-gradient'), angle: z.number(), stops: z.array(gradientStopSchema).min(2), alpha: z.number(), tokenId: id.optional() }),
  z.object({ type: z.literal('radial-gradient'), center: z.object({ x: z.number(), y: z.number() }), radius: z.number(), stops: z.array(gradientStopSchema).min(2), alpha: z.number(), tokenId: id.optional() }),
])
const strokeSchema = z.object({ color: z.string(), alpha: z.number(), width: z.number(), position: z.literal('center') })
const effectSchema = z.object({ type: z.literal('drop-shadow'), x: z.number(), y: z.number(), blur: z.number(), spread: z.number(), color: z.string(), alpha: z.number() })
const constraintsSchema = z.object({ horizontal: z.enum(['left', 'right', 'center', 'left-right', 'scale']), vertical: z.enum(['top', 'bottom', 'center', 'top-bottom', 'scale']) })
const layoutSchema = z.object({
  mode: z.enum(['none', 'horizontal', 'vertical']),
  padding: z.object({ top: z.number(), right: z.number(), bottom: z.number(), left: z.number() }),
  gap: z.number(),
  alignItems: z.enum(['start', 'center', 'end', 'stretch']),
  justifyContent: z.enum(['start', 'center', 'end', 'space-between']),
  wrap: z.enum(['no-wrap', 'wrap']),
  childSizing: z.enum(['fixed', 'fill', 'hug']),
})

const baseNodeSchema = z.object({
  id,
  type: z.enum(['frame', 'rectangle', 'text', 'image', 'group', 'component', 'instance']),
  name: z.string(),
  parentId: id.nullable(),
  children: z.array(id),
  x: z.number(),
  y: z.number(),
  width: z.number().nonnegative(),
  height: z.number().nonnegative(),
  rotation: z.number(),
  opacity: z.number().min(0).max(1),
  visible: z.boolean(),
  locked: z.boolean(),
  constraints: constraintsSchema,
  layout: layoutSchema,
  fills: z.array(fillSchema),
  strokes: z.array(strokeSchema),
  effects: z.array(effectSchema),
  cornerRadius: z.union([z.number(), z.object({ topLeft: z.number(), topRight: z.number(), bottomRight: z.number(), bottomLeft: z.number() })]),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.record(z.string(), z.unknown()),
})

export const sceneNodeSchema = z.discriminatedUnion('type', [
  baseNodeSchema.extend({ type: z.literal('frame'), clipContent: z.boolean(), devicePreset: z.string().optional() }),
  baseNodeSchema.extend({ type: z.literal('rectangle') }),
  baseNodeSchema.extend({
    type: z.literal('text'),
    text: z.string(),
    fontFamily: z.string(),
    fontSize: z.number(),
    fontWeight: z.union([z.literal(300), z.literal(400), z.literal(500), z.literal(600), z.literal(700), z.literal(800)]),
    fontStyle: z.enum(['normal', 'italic']),
    lineHeight: z.number(),
    letterSpacing: z.number(),
    paragraphSpacing: z.number(),
    textAlignHorizontal: z.enum(['left', 'center', 'right', 'justify']),
    textAlignVertical: z.enum(['top', 'middle', 'bottom']),
    textDecoration: z.enum(['none', 'underline', 'line-through']),
    textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']),
    color: z.string(),
    autoResize: z.enum(['none', 'width', 'height', 'both']),
    textStyleId: id.optional(),
  }),
  baseNodeSchema.extend({ type: z.literal('image'), src: z.string(), assetId: z.string().optional(), alt: z.string(), objectFit: z.enum(['fill', 'contain', 'cover']), crop: z.object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() }).optional() }),
  baseNodeSchema.extend({ type: z.literal('group') }),
  baseNodeSchema.extend({ type: z.literal('component'), componentId: id, description: z.string().optional() }),
  baseNodeSchema.extend({ type: z.literal('instance'), componentId: id, overrides: z.record(z.string(), z.unknown()) }),
])

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
})

export const tokenSchema = z.discriminatedUnion('type', [
  z.object({ id, type: z.literal('color'), name: z.string(), value: z.string(), alpha: z.number(), description: z.string().optional() }),
  z.object({ id, type: z.literal('spacing'), name: z.string(), value: z.number(), description: z.string().optional() }),
  z.object({ id, type: z.literal('radius'), name: z.string(), value: z.number(), description: z.string().optional() }),
])

export const styleSchema = z.discriminatedUnion('type', [
  z.object({ id, type: z.literal('text'), name: z.string(), fontFamily: z.string(), fontSize: z.number(), fontWeight: z.number(), lineHeight: z.number(), letterSpacing: z.number(), colorTokenId: id.optional() }),
  z.object({ id, type: z.literal('effect'), name: z.string(), shadows: z.array(effectSchema), blur: z.number().optional() }),
])

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
  components: z.record(id, z.object({ id, name: z.string(), description: z.string().optional(), rootNodeId: id, nodeIds: z.array(id), createdAt: z.string(), updatedAt: z.string() })),
  styles: z.record(id, styleSchema),
  tokens: z.record(id, tokenSchema),
  settings: z.object({ snapToGrid: z.boolean(), gridSize: z.number(), theme: z.enum(['system', 'light', 'dark']), autosave: z.boolean() }),
})

export const exportSchema = z.object({ format: z.literal('bran.project'), version: z.number(), exportedAt: z.string(), project: projectSchema, pages: z.array(pageSchema), assets: z.array(z.object({ id: z.string(), projectId: id, name: z.string(), type: z.string(), dataUrl: z.string(), createdAt: z.string() })) })
