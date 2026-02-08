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
