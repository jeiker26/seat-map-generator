import { Seat, SeatStatus } from '../../core/types'

const STATUS_COLORS: Record<SeatStatus, string> = {
  available: '#4CAF50',
  reserved: '#FFC107',
  sold: '#F44336',
  blocked: '#9E9E9E',
}

export const getStatusColor = (status: SeatStatus): string => {
  return STATUS_COLORS[status] || STATUS_COLORS.available
}

export const getSeatBounds = (seats: Seat[]): { minX: number; minY: number; maxX: number; maxY: number } => {
  if (seats.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  }

  return {
    minX: Math.min(...seats.map((s) => s.x)),
    minY: Math.min(...seats.map((s) => s.y)),
    maxX: Math.max(...seats.map((s) => s.x + s.w)),
    maxY: Math.max(...seats.map((s) => s.y + s.h)),
  }
}

export const generateSeatId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
