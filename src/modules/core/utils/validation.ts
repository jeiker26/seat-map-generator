import { ZodError } from 'zod'

import { Seat, SeatMap } from '../types'
import { seatMapSchema, seatSchema } from './schema'

interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: ZodError
}

export const validateSeatMap = (data: unknown): ValidationResult<SeatMap> => {
  const result = seatMapSchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data as SeatMap }
  }

  return { success: false, errors: result.error }
}

export const validateSeat = (data: unknown): ValidationResult<Seat> => {
  const result = seatSchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data as Seat }
  }

  return { success: false, errors: result.error }
}

export const isValidCoordinate = (value: number): boolean => {
  return typeof value === 'number' && value >= 0 && value <= 1
}

export const isValidSeatLabel = (label: string): boolean => {
  return typeof label === 'string' && label.trim().length > 0 && label.length <= 20
}
