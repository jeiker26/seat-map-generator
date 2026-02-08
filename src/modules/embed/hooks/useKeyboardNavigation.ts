import { useCallback, useMemo, useRef } from 'react'

import { Seat, SeatCategory, Zone } from '../../core/types'

interface UseKeyboardNavigationOptions {
  seats: Seat[]
  categories?: SeatCategory[]
  zones?: Zone[]
  onToggleSeat: (_seatId: string) => void
  onFocusSeat?: (_seatId: string) => void
  onBlurSeat?: () => void
}

interface SeatNavItem {
  seat: Seat
  category?: SeatCategory
  zone?: Zone
}

const SPATIAL_TOLERANCE = 0.005

export const useKeyboardNavigation = ({
  seats,
  categories,
  zones,
  onToggleSeat,
  onFocusSeat,
  onBlurSeat,
}: UseKeyboardNavigationOptions) => {
  const seatRefsMap = useRef<Map<string, HTMLButtonElement>>(new Map())

  const categoryMap = useMemo(() => {
    const map = new Map<string, SeatCategory>()
    if (categories) {
      categories.forEach((cat) => map.set(cat.id, cat))
    }
    return map
  }, [categories])

  const zoneMap = useMemo(() => {
    const map = new Map<string, Zone>()
    if (zones) {
      zones.forEach((zone) => map.set(zone.id, zone))
    }
    return map
  }, [zones])

  const sortedSeats: SeatNavItem[] = useMemo(() => {
    const items = seats.map((seat) => ({
      seat,
      category: seat.categoryId ? categoryMap.get(seat.categoryId) : undefined,
      zone: seat.zoneId ? zoneMap.get(seat.zoneId) : undefined,
    }))

    items.sort((a, b) => {
      const rowDiff = a.seat.y - b.seat.y
      if (Math.abs(rowDiff) > SPATIAL_TOLERANCE) {
        return rowDiff
      }
      return a.seat.x - b.seat.x
    })

    return items
  }, [seats, categoryMap, zoneMap])

  const findNeighbor = useCallback(
    (currentId: string, direction: 'up' | 'down' | 'left' | 'right'): string | null => {
      const current = seats.find((s) => s.id === currentId)
      if (!current) {
        return null
      }

      let best: Seat | null = null
      let bestDist = Infinity

      for (const seat of seats) {
        if (seat.id === currentId) {
          continue
        }

        const dx = seat.x - current.x
        const dy = seat.y - current.y

        let isInDirection = false
        switch (direction) {
          case 'left':
            isInDirection = dx < -SPATIAL_TOLERANCE
            break
          case 'right':
            isInDirection = dx > SPATIAL_TOLERANCE
            break
          case 'up':
            isInDirection = dy < -SPATIAL_TOLERANCE
            break
          case 'down':
            isInDirection = dy > SPATIAL_TOLERANCE
            break
        }

        if (!isInDirection) {
          continue
        }

        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < bestDist) {
          bestDist = dist
          best = seat
        }
      }

      return best?.id ?? null
    },
    [seats],
  )

  const handleSeatKeyDown = useCallback(
    (e: React.KeyboardEvent, seatId: string) => {
      let neighborId: string | null = null

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          neighborId = findNeighbor(seatId, 'left')
          break
        case 'ArrowRight':
          e.preventDefault()
          neighborId = findNeighbor(seatId, 'right')
          break
        case 'ArrowUp':
          e.preventDefault()
          neighborId = findNeighbor(seatId, 'up')
          break
        case 'ArrowDown':
          e.preventDefault()
          neighborId = findNeighbor(seatId, 'down')
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          onToggleSeat(seatId)
          return
        case 'Escape':
          e.preventDefault()
          ;(e.target as HTMLElement).blur()
          return
        default:
          return
      }

      if (neighborId) {
        const btn = seatRefsMap.current.get(neighborId)
        if (btn) {
          btn.focus()
        }
      }
    },
    [findNeighbor, onToggleSeat],
  )

  const registerSeatRef = useCallback((seatId: string, el: HTMLButtonElement | null) => {
    if (el) {
      seatRefsMap.current.set(seatId, el)
    } else {
      seatRefsMap.current.delete(seatId)
    }
  }, [])

  const handleSeatFocus = useCallback(
    (seatId: string) => {
      onFocusSeat?.(seatId)
    },
    [onFocusSeat],
  )

  const handleSeatBlur = useCallback(() => {
    onBlurSeat?.()
  }, [onBlurSeat])

  const getSeatAriaLabel = useCallback((item: SeatNavItem): string => {
    const parts: string[] = [`Seat ${item.seat.label}`]
    const status = item.seat.status || 'available'
    parts.push(status)

    if (item.category) {
      parts.push(item.category.name)
    }
    if (item.zone) {
      parts.push(item.zone.name)
    }
    if (item.seat.row !== undefined) {
      parts.push(`Row ${item.seat.row}`)
    }

    const price = item.category?.price ?? item.zone?.price
    if (price !== undefined) {
      parts.push(`$${price}`)
    }

    return parts.join(', ')
  }, [])

  return {
    sortedSeats,
    handleSeatKeyDown,
    registerSeatRef,
    handleSeatFocus,
    handleSeatBlur,
    getSeatAriaLabel,
  }
}
