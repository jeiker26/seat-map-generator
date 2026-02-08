export interface SeatMap {
  id: string
  version: '1.0'
  name: string
  createdAt: string
  updatedAt: string
  background: SeatMapBackground
  seats: Seat[]
  zones?: Zone[]
  categories?: SeatCategory[]
  elements?: MapElement[]
  gridConfig?: GridConfig
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
  showLegend?: boolean
  showRowNumbers?: boolean
  showColumnHeaders?: boolean
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
  row?: number
  column?: number
  zoneId?: string
  categoryId?: string
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

export interface SeatCategory {
  id: string
  name: string
  color: string
  borderColor?: string
  textColor?: string
  description?: string
  price?: number
  order?: number
}

export type MapElementType = 'text-label' | 'icon' | 'divider' | 'row-number' | 'column-header'

export type MapElementIcon = 'restroom' | 'cafe' | 'exit' | 'stairs' | 'elevator' | 'info' | 'food' | 'bar' | 'vip'

export interface MapElement {
  id: string
  type: MapElementType
  x: number
  y: number
  w: number
  h: number
  r?: number
  label?: string
  icon?: MapElementIcon
  fontSize?: number
  color?: string
}

export interface GridConfig {
  columnLabels?: string[]
  aisleAfterColumns?: number[]
  aisleWidth?: number
  rowNumbersVisible?: boolean
  columnHeadersVisible?: boolean
}
