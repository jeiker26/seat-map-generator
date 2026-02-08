import Konva from 'konva'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Group, Rect, Text } from 'react-konva'

import { MIN_FONT_SIZE, STATUS_OPACITY } from '../../../core/constants'
import { Seat as SeatType, SeatCategory, SeatStatus } from '../../../core/types'

const FALLBACK_STATUS_COLORS: Record<SeatStatus, string> = {
  available: '#4CAF50',
  reserved: '#FFC107',
  sold: '#F44336',
  blocked: '#9E9E9E',
}

const _DEFAULT_SEAT_COLOR = '#E8E8E8'
const _DEFAULT_BORDER_COLOR = '#BDBDBD'
const DEFAULT_TEXT_COLOR = '#424242'

interface SeatProps {
  seat: SeatType
  containerWidth: number
  containerHeight: number
  isSelected?: boolean
  isEditable?: boolean
  isDraggable?: boolean
  showLabel?: boolean
  category?: SeatCategory
  onClick?: (_seatId: string, _event?: MouseEvent) => void
  onDragStart?: (_seatId: string, _x: number, _y: number) => void
  onDragMove?: (_seatId: string, _pixelDeltaX: number, _pixelDeltaY: number) => void
  onDragEnd?: (_seatId: string, _x: number, _y: number) => void
  onMouseEnter?: (_seatId: string, _pixelX: number, _pixelY: number) => void
  onMouseLeave?: (_seatId: string) => void
  onNodeRef?: (_seatId: string, _node: Konva.Group | null) => void
}

const SeatComponent = ({
  seat,
  containerWidth,
  containerHeight,
  isSelected = false,
  isEditable: _isEditable = false,
  isDraggable = false,
  showLabel = true,
  category,
  onClick,
  onDragStart,
  onDragMove,
  onDragEnd,
  onMouseEnter,
  onMouseLeave,
  onNodeRef,
}: SeatProps) => {
  const groupRef = useRef<Konva.Group>(null)
  const pixelX = seat.x * containerWidth
  const pixelY = seat.y * containerHeight
  const uniformScale = Math.min(containerWidth, containerHeight)
  const pixelW = seat.w * uniformScale
  const pixelH = seat.h * uniformScale

  useEffect(() => {
    if (onNodeRef) {
      onNodeRef(seat.id, groupRef.current)
    }
    return () => {
      if (onNodeRef) {
        onNodeRef(seat.id, null)
      }
    }
  }, [onNodeRef, seat.id])

  const status = seat.status || 'available'
  const opacity = STATUS_OPACITY[status] ?? 1

  const fillColor = useMemo(() => {
    if (isSelected) {
      return '#2196F3'
    }
    if (category) {
      return category.color
    }
    return FALLBACK_STATUS_COLORS[status]
  }, [isSelected, category, status])

  const strokeColor = useMemo(() => {
    if (isSelected) {
      return '#1565C0'
    }
    if (category) {
      return category.borderColor || category.color
    }
    return '#333333'
  }, [isSelected, category])

  const textColor = useMemo(() => {
    if (isSelected) {
      return '#ffffff'
    }
    if (category) {
      return category.textColor || DEFAULT_TEXT_COLOR
    }
    return '#ffffff'
  }, [isSelected, category])

  const handleClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (onClick) {
        onClick(seat.id, e.evt)
      }
    },
    [onClick, seat.id],
  )

  const handleTap = useCallback(() => {
    if (onClick) {
      onClick(seat.id)
    }
  }, [onClick, seat.id])

  const handleDragStart = useCallback(() => {
    if (onDragStart) {
      onDragStart(seat.id, seat.x, seat.y)
    }
  }, [onDragStart, seat.id, seat.x, seat.y])

  const handleDragMove = useCallback(
    (e: any) => {
      if (onDragMove) {
        const pixelDeltaX = e.target.x() - pixelX
        const pixelDeltaY = e.target.y() - pixelY
        onDragMove(seat.id, pixelDeltaX, pixelDeltaY)
      }
    },
    [onDragMove, seat.id, pixelX, pixelY],
  )

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

  const handleMouseEnter = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (onMouseEnter) {
        const stage = e.target.getStage()
        if (stage) {
          const pointer = stage.getPointerPosition()
          if (pointer) {
            onMouseEnter(seat.id, pointer.x, pointer.y)
          }
        }
      }
      const container = e.target.getStage()?.container()
      if (container) {
        container.style.cursor = 'pointer'
      }
    },
    [onMouseEnter, seat.id],
  )

  const handleMouseLeave = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (onMouseLeave) {
        onMouseLeave(seat.id)
      }
      const container = e.target.getStage()?.container()
      if (container) {
        container.style.cursor = 'default'
      }
    },
    [onMouseLeave, seat.id],
  )

  return (
    <Group
      ref={groupRef}
      x={pixelX}
      y={pixelY}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleTap}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      rotation={seat.r || 0}
      opacity={isSelected ? 1 : opacity}
    >
      <Rect
        width={pixelW}
        height={pixelH}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={3}
        shadowColor="rgba(0,0,0,0.15)"
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
          fill={textColor}
          listening={false}
        />
      )}
    </Group>
  )
}

export default SeatComponent
