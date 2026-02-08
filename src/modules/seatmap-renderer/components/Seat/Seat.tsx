import { useCallback, useMemo } from 'react'
import { Group, Rect, Text } from 'react-konva'

import { MIN_FONT_SIZE } from '../../../core/constants'
import { Seat as SeatType, SeatStatus } from '../../../core/types'

const STATUS_COLORS: Record<SeatStatus, string> = {
  available: '#4CAF50',
  reserved: '#FFC107',
  sold: '#F44336',
  blocked: '#9E9E9E',
}

interface SeatProps {
  seat: SeatType
  containerWidth: number
  containerHeight: number
  isSelected?: boolean
  isEditable?: boolean
  showLabel?: boolean
  onClick?: (seatId: string) => void
  onDragEnd?: (seatId: string, x: number, y: number) => void
}

const SeatComponent = ({
  seat,
  containerWidth,
  containerHeight,
  isSelected = false,
  isEditable = false,
  showLabel = true,
  onClick,
  onDragEnd,
}: SeatProps) => {
  const pixelX = seat.x * containerWidth
  const pixelY = seat.y * containerHeight
  const uniformScale = Math.min(containerWidth, containerHeight)
  const pixelW = seat.w * uniformScale
  const pixelH = seat.h * uniformScale

  const fillColor = useMemo(() => {
    if (isSelected) {
      return '#2196F3'
    }
    return STATUS_COLORS[seat.status || 'available']
  }, [isSelected, seat.status])

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(seat.id)
    }
  }, [onClick, seat.id])

  const handleDragEnd = useCallback(
    (e: any) => {
      if (onDragEnd) {
        const newX = e.target.x() / containerWidth
        const newY = e.target.y() / containerHeight
        onDragEnd(seat.id, newX, newY)
      }
    },
    [onDragEnd, seat.id, containerWidth, containerHeight],
  )

  return (
    <Group
      x={pixelX}
      y={pixelY}
      draggable={isEditable}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
      rotation={seat.r || 0}
    >
      <Rect
        width={pixelW}
        height={pixelH}
        fill={fillColor}
        stroke={isSelected ? '#1565C0' : '#333333'}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={3}
        shadowColor="rgba(0,0,0,0.2)"
        shadowBlur={isSelected ? 6 : 2}
        shadowOffset={{ x: 1, y: 1 }}
      />
      {showLabel && (
        <Text
          text={seat.label}
          width={pixelW}
          height={pixelH}
          align="center"
          verticalAlign="middle"
          fontSize={Math.max(Math.min(pixelW, pixelH) * 0.4, MIN_FONT_SIZE)}
          fill="#ffffff"
          listening={false}
        />
      )}
    </Group>
  )
}

export default SeatComponent
