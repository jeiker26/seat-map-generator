import { z } from 'zod'

export const zoneSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1),
  price: z.number().nonnegative().optional(),
})

export const seatSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(20),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().min(0).max(1),
  h: z.number().min(0).max(1),
  r: z.number().optional(),
  zoneId: z.string().optional(),
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
  settings: seatMapSettingsSchema.optional(),
})
