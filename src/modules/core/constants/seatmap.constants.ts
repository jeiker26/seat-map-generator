import { SeatCategory } from '../types'

export const SEAT_STATUS_COLORS: Record<string, string> = {
  available: '#4CAF50',
  reserved: '#FFC107',
  sold: '#F44336',
  blocked: '#9E9E9E',
}

export const DEFAULT_SEAT_SIZE = {
  w: 0.02,
  h: 0.02,
}

export const ZOOM_LIMITS = {
  MIN: 0.1,
  MAX: 5,
  STEP: 0.1,
}

export const CANVAS_DEFAULTS = {
  BACKGROUND_COLOR: '#f5f5f5',
  GRID_COLOR: '#e0e0e0',
  SELECTION_COLOR: '#2196F3',
}

export const MAX_SEATS = 5000
export const MAX_HISTORY_ENTRIES = 50
export const MAX_BACKGROUND_SIZE_MB = 10
export const MAX_BACKGROUND_SIZE_BYTES = MAX_BACKGROUND_SIZE_MB * 1024 * 1024
export const MIN_FONT_SIZE = 8

export const DEFAULT_CATEGORIES: SeatCategory[] = [
  {
    id: 'standard',
    name: 'Standard',
    color: '#E8E8E8',
    borderColor: '#BDBDBD',
    textColor: '#424242',
    description: 'Standard seat',
    order: 0,
  },
  {
    id: 'premium',
    name: 'Premium',
    color: '#BBDEFB',
    borderColor: '#64B5F6',
    textColor: '#1565C0',
    description: 'Premium seat with extra features',
    order: 1,
  },
  {
    id: 'vip',
    name: 'VIP',
    color: '#FFD54F',
    borderColor: '#FFA000',
    textColor: '#E65100',
    description: 'VIP seat with best view',
    order: 2,
  },
  {
    id: 'accessible',
    name: 'Accessible',
    color: '#C8E6C9',
    borderColor: '#66BB6A',
    textColor: '#2E7D32',
    description: 'Wheelchair accessible seat',
    order: 3,
  },
  {
    id: 'extra-legroom',
    name: 'Extra Legroom',
    color: '#B3E5FC',
    borderColor: '#4FC3F7',
    textColor: '#0277BD',
    description: 'Seat with extra legroom',
    order: 4,
  },
]

export const STATUS_OPACITY: Record<string, number> = {
  available: 1,
  reserved: 0.7,
  sold: 0.4,
  blocked: 0.3,
}

export const DEFAULT_AISLE_WIDTH = 0.04
export const DEFAULT_COLUMN_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
export const ROW_NUMBER_FONT_SIZE = 12
export const COLUMN_HEADER_FONT_SIZE = 11
