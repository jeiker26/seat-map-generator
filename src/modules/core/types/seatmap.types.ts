export interface SeatMap {
  id: string
  version: '1.0'
  name: string
  createdAt: string
  updatedAt: string
  background: SeatMapBackground
  seats: Seat[]
  zones?: Zone[]
  settings?: SeatMapSettings
}

export interface SeatMapBackground {
  url: string
  width: number
  height: number
  aspectRatio?: number
}

export interface SeatMapSettings {
  allowMultiSelect: boolean
  maxSelectable?: number
  showLabels: boolean
  theme?: 'light' | 'dark'
  defaultSeatSize?: SeatSize
}

export interface SeatSize {
  w: number
  h: number
}

export interface Seat {
  id: string
  label: string
  x: number
  y: number
  w: number
  h: number
  r?: number
  zoneId?: string
  status?: SeatStatus
  metadata?: Record<string, unknown>
}

export type SeatStatus = 'available' | 'reserved' | 'sold' | 'blocked'

export interface Zone {
  id: string
  name: string
  color: string
  price?: number
}
