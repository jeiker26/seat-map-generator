import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { HostCommand, Seat, SeatCategory, SeatMap, Zone } from '../../../core/types'
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation'
import { usePostMessage } from '../../hooks/usePostMessage'
import { useSelection } from '../../hooks/useSelection'
import SeatTooltip from '../SeatTooltip/SeatTooltip'
import styles from './EmbedRenderer.module.scss'

const Canvas = dynamic(() => import('../../../seatmap-renderer/components/Canvas/Canvas'), { ssr: false })

interface EmbedRendererProps {
  seatMap: SeatMap
}

const EmbedRenderer = ({ seatMap: initialSeatMap }: EmbedRendererProps) => {
  const [seatMap, setSeatMap] = useState<SeatMap>(initialSeatMap)
  const [tooltipSeat, setTooltipSeat] = useState<Seat | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const prevSelectedRef = useRef<string[]>([])

  const { selectedIds, selectedSeats, toggleSeat, clearSelection, selectMultiple } = useSelection({
    settings: seatMap.settings,
    seats: seatMap.seats,
  })

  const handleCommand = useCallback(
    (command: HostCommand) => {
      switch (command.type) {
        case 'seatmap:setStatus': {
          const updates = command.payload
          setSeatMap((prev) => ({
            ...prev,
            seats: prev.seats.map((seat) => {
              const update = updates.find((u) => u.seatId === seat.id)
              return update ? { ...seat, status: update.status } : seat
            }),
          }))
          break
        }
        case 'seatmap:clearSelection':
          clearSelection()
          break
        case 'seatmap:selectSeats':
          selectMultiple(command.payload.seatIds)
          break
        case 'seatmap:setTheme':
          setSeatMap((prev) => ({
            ...prev,
            settings: {
              ...prev.settings,
              allowMultiSelect: prev.settings?.allowMultiSelect ?? true,
              showLabels: prev.settings?.showLabels ?? true,
              theme: command.payload.theme,
            },
          }))
          break
      }
    },
    [clearSelection, selectMultiple],
  )

  const { sendEvent } = usePostMessage({ onCommand: handleCommand })

  useEffect(() => {
    sendEvent({ type: 'seatmap:ready' })
  }, [sendEvent])

  useEffect(() => {
    const prev = prevSelectedRef.current
    const added = selectedIds.filter((id) => !prev.includes(id))
    const removed = prev.filter((id) => !selectedIds.includes(id))

    if (added.length > 0 || removed.length > 0) {
      sendEvent({ type: 'seatmap:selected', payload: { seats: selectedSeats } })
    }

    removed.forEach((id) => {
      sendEvent({ type: 'seatmap:deselected', payload: { seatId: id } })
    })

    prevSelectedRef.current = selectedIds
  }, [selectedIds, selectedSeats, sendEvent])

  const handleSeatClick = useCallback(
    (seatId: string) => {
      toggleSeat(seatId)
    },
    [toggleSeat],
  )

  const seatMapCategories = seatMap.categories
  const categoryMap = useMemo(() => {
    const map = new Map<string, SeatCategory>()
    if (seatMapCategories) {
      seatMapCategories.forEach((cat) => map.set(cat.id, cat))
    }
    return map
  }, [seatMapCategories])

  const seatMapZones = seatMap.zones
  const zoneMap = useMemo(() => {
    const map = new Map<string, Zone>()
    if (seatMapZones) {
      seatMapZones.forEach((zone) => map.set(zone.id, zone))
    }
    return map
  }, [seatMapZones])

  const handleSeatHover = useCallback(
    (seatId: string, pixelX: number, pixelY: number) => {
      const seat = seatMap.seats.find((s) => s.id === seatId)
      if (seat) {
        setTooltipSeat(seat)
        setTooltipPos({ x: pixelX, y: pixelY })
        setTooltipVisible(true)
      }
    },
    [seatMap.seats],
  )

  const handleSeatHoverEnd = useCallback((_seatId: string) => {
    setTooltipVisible(false)
    setTooltipSeat(null)
  }, [])

  const tooltipCategory = tooltipSeat?.categoryId ? (categoryMap.get(tooltipSeat.categoryId) ?? null) : null
  const tooltipZone = tooltipSeat?.zoneId ? (zoneMap.get(tooltipSeat.zoneId) ?? null) : null

  const handleFocusSeat = useCallback(
    (seatId: string) => {
      const seat = seatMap.seats.find((s) => s.id === seatId)
      if (seat) {
        setTooltipSeat(seat)
        setTooltipPos({ x: 0, y: 0 })
        setTooltipVisible(true)
      }
    },
    [seatMap.seats],
  )

  const handleBlurSeat = useCallback(() => {
    setTooltipVisible(false)
    setTooltipSeat(null)
  }, [])

  const { sortedSeats, handleSeatKeyDown, registerSeatRef, handleSeatFocus, handleSeatBlur, getSeatAriaLabel } =
    useKeyboardNavigation({
      seats: seatMap.seats,
      categories: seatMap.categories,
      zones: seatMap.zones,
      onToggleSeat: toggleSeat,
      onFocusSeat: handleFocusSeat,
      onBlurSeat: handleBlurSeat,
    })

  return (
    <div
      className={`${styles['embed-renderer']} ${seatMap.settings?.theme === 'dark' ? styles['embed-renderer--dark'] : ''}`}
      role="application"
      aria-label={`Seat map: ${seatMap.name}`}
    >
      <Canvas
        seatMap={seatMap}
        selectedSeats={selectedIds}
        showLabels={seatMap.settings?.showLabels ?? true}
        onSeatClick={handleSeatClick}
        onSeatHover={handleSeatHover}
        onSeatHoverEnd={handleSeatHoverEnd}
      />
      <div className={styles['embed-renderer__a11y']} role="group" aria-label="Seat selection">
        {sortedSeats.map((item) => {
          const isSelected = selectedIds.includes(item.seat.id)
          const status = item.seat.status || 'available'
          const isDisabled = status === 'sold' || status === 'blocked'

          return (
            <button
              key={item.seat.id}
              ref={(el) => registerSeatRef(item.seat.id, el)}
              className={styles['embed-renderer__a11y-seat']}
              role="checkbox"
              aria-checked={isSelected}
              aria-disabled={isDisabled}
              aria-label={getSeatAriaLabel(item)}
              tabIndex={0}
              onKeyDown={(e) => handleSeatKeyDown(e, item.seat.id)}
              onFocus={() => handleSeatFocus(item.seat.id)}
              onBlur={handleSeatBlur}
              onClick={() => {
                if (!isDisabled) {
                  toggleSeat(item.seat.id)
                }
              }}
            />
          )
        })}
      </div>
      <SeatTooltip
        seat={tooltipSeat}
        position={tooltipPos}
        visible={tooltipVisible}
        category={tooltipCategory}
        zone={tooltipZone}
      />
    </div>
  )
}

export default EmbedRenderer
