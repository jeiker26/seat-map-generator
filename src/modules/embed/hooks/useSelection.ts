import { useCallback, useState } from 'react'

import { Seat, SeatMapSettings } from '../../core/types'

interface UseSelectionOptions {
  settings?: SeatMapSettings | null
  seats: Seat[]
}

export const useSelection = ({ settings, seats }: UseSelectionOptions) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSeat = useCallback(
    (seatId: string) => {
      setSelectedIds((prev) => {
        if (prev.includes(seatId)) {
          return prev.filter((id) => id !== seatId)
        }

        const seat = seats.find((s) => s.id === seatId)
        if (!seat || seat.status === 'sold' || seat.status === 'blocked') {
          return prev
        }

        if (!settings?.allowMultiSelect) {
          return [seatId]
        }

        if (settings?.maxSelectable && prev.length >= settings.maxSelectable) {
          return prev
        }

        return [...prev, seatId]
      })
    },
    [seats, settings],
  )

  const selectSeat = useCallback((seatId: string) => {
    setSelectedIds((prev) => (prev.includes(seatId) ? prev : [...prev, seatId]))
  }, [])

  const deselectSeat = useCallback((seatId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== seatId))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  const selectMultiple = useCallback((seatIds: string[]) => {
    setSelectedIds(seatIds)
  }, [])

  const selectedSeats = seats.filter((s) => selectedIds.includes(s.id))

  return {
    selectedIds,
    selectedSeats,
    toggleSeat,
    selectSeat,
    deselectSeat,
    clearSelection,
    selectMultiple,
  }
}
