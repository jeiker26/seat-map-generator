import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'

import { HostCommand, Seat, SeatMap } from '../../../core/types'
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
  const [tooltipSeat, _setTooltipSeat] = useState<Seat | null>(null)
  const [tooltipPos, _setTooltipPos] = useState({ x: 0, y: 0 })
  const [tooltipVisible, _setTooltipVisible] = useState(false)
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

  return (
    <div
      className={`${styles['embed-renderer']} ${seatMap.settings?.theme === 'dark' ? styles['embed-renderer--dark'] : ''}`}
    >
      <Canvas
        seatMap={seatMap}
        selectedSeats={selectedIds}
        showLabels={seatMap.settings?.showLabels ?? true}
        onSeatClick={handleSeatClick}
      />
      <SeatTooltip seat={tooltipSeat} position={tooltipPos} visible={tooltipVisible} />
    </div>
  )
}

export default EmbedRenderer
