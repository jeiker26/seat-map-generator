import { useMemo } from 'react'
import { Group, Text } from 'react-konva'

import { ROW_NUMBER_FONT_SIZE } from '../../../core/constants'
import { Seat } from '../../../core/types'

interface RowNumbersProps {
  seats: Seat[]
  containerWidth: number
  containerHeight: number
}

interface RowInfo {
  row: number
  y: number
  h: number
  leftX: number
  rightX: number
  rightW: number
}

const RowNumbers = ({ seats, containerWidth, containerHeight }: RowNumbersProps) => {
  const rows = useMemo<RowInfo[]>(() => {
    const seatsWithRow = seats.filter((s) => s.row !== undefined && s.row !== null)
    if (seatsWithRow.length === 0) {
      return []
    }

    const rowMap = new Map<number, Seat[]>()
    seatsWithRow.forEach((seat) => {
      const rowNum = seat.row!
      if (!rowMap.has(rowNum)) {
        rowMap.set(rowNum, [])
      }
      rowMap.get(rowNum)!.push(seat)
    })

    const uniformScale = Math.min(containerWidth, containerHeight)

    return Array.from(rowMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([rowNum, rowSeats]) => {
        const avgY = rowSeats.reduce((sum, s) => sum + s.y, 0) / rowSeats.length
        const avgH = rowSeats.reduce((sum, s) => sum + s.h, 0) / rowSeats.length
        const minX = Math.min(...rowSeats.map((s) => s.x))
        const maxX = Math.max(...rowSeats.map((s) => s.x))
        const maxW = rowSeats.find((s) => s.x === maxX)?.w || 0

        return {
          row: rowNum,
          y: avgY * containerHeight,
          h: avgH * uniformScale,
          leftX: minX * containerWidth,
          rightX: maxX * containerWidth,
          rightW: maxW * uniformScale,
        }
      })
  }, [seats, containerWidth, containerHeight])

  if (rows.length === 0) {
    return null
  }

  const fontSize = ROW_NUMBER_FONT_SIZE

  return (
    <Group listening={false}>
      {rows.map((rowInfo) => {
        const textWidth = 30
        const centerX = (rowInfo.leftX + rowInfo.rightX + rowInfo.rightW) / 2

        return (
          <Text
            key={`row-${rowInfo.row}`}
            text={String(rowInfo.row)}
            x={centerX - textWidth / 2}
            y={rowInfo.y + (rowInfo.h - fontSize) / 2}
            width={textWidth}
            height={fontSize}
            align="center"
            verticalAlign="middle"
            fontSize={fontSize}
            fontStyle="bold"
            fill="#666666"
          />
        )
      })}
    </Group>
  )
}

export default RowNumbers
