import { z } from 'zod'

export const zoneSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1),
  price: z.number().nonnegative().optional(),
})

export const seatCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1),
  borderColor: z.string().optional(),
  textColor: z.string().optional(),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  order: z.number().int().nonnegative().optional(),
})

export const mapElementSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['text-label', 'icon', 'divider', 'row-number', 'column-header']),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().min(0).max(1),
  h: z.number().min(0).max(1),
  r: z.number().optional(),
  label: z.string().optional(),
  icon: z.enum(['restroom', 'cafe', 'exit', 'stairs', 'elevator', 'info', 'food', 'bar', 'vip']).optional(),
  fontSize: z.number().positive().optional(),
  color: z.string().optional(),
})

export const gridConfigSchema = z.object({
  columnLabels: z.array(z.string()).optional(),
  aisleAfterColumns: z.array(z.number().int().nonnegative()).optional(),
  aisleWidth: z.number().positive().optional(),
  rowNumbersVisible: z.boolean().optional(),
  columnHeadersVisible: z.boolean().optional(),
})

export const seatSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(20),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().min(0).max(1),
  h: z.number().min(0).max(1),
  r: z.number().optional(),
  row: z.number().int().optional(),
  column: z.number().int().optional(),
  zoneId: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['available', 'reserved', 'sold', 'blocked']).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export const seatSizeSchema = z.object({
  w: z.number().min(0.005).max(0.5),
  h: z.number().min(0.005).max(0.5),
})

export const seatMapBackgroundSchema = z.object({
  url: z.union([z.string().url(), z.literal('')]),
  width: z.number().nonnegative(),
  height: z.number().nonnegative(),
  aspectRatio: z.number().positive().optional(),
})

export const seatMapSettingsSchema = z.object({
  allowMultiSelect: z.boolean(),
  maxSelectable: z.number().positive().optional(),
  showLabels: z.boolean(),
  showLegend: z.boolean().optional(),
  showRowNumbers: z.boolean().optional(),
  showColumnHeaders: z.boolean().optional(),
  theme: z.enum(['light', 'dark']).optional(),
  defaultSeatSize: seatSizeSchema.optional(),
})

export const seatMapSchema = z.object({
  id: z.string().min(1),
  version: z.literal('1.0'),
  name: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  background: seatMapBackgroundSchema,
  seats: z.array(seatSchema),
  zones: z.array(zoneSchema).optional(),
  categories: z.array(seatCategorySchema).optional(),
  elements: z.array(mapElementSchema).optional(),
  gridConfig: gridConfigSchema.optional(),
  settings: seatMapSettingsSchema.optional(),
})
