import { useMemo } from 'react'
import { Group, Text } from 'react-konva'

import { COLUMN_HEADER_FONT_SIZE } from '../../../core/constants'
import { Seat } from '../../../core/types'

interface ColumnHeadersProps {
  seats: Seat[]
  columnLabels?: string[]
  containerWidth: number
  containerHeight: number
}

interface ColumnInfo {
  column: number
  label: string
  x: number
  w: number
  topY: number
}

const ColumnHeaders = ({ seats, columnLabels, containerWidth, containerHeight }: ColumnHeadersProps) => {
  const columns = useMemo<ColumnInfo[]>(() => {
    const seatsWithCol = seats.filter((s) => s.column !== undefined && s.column !== null)
    if (seatsWithCol.length === 0) {
      return []
    }

    const colMap = new Map<number, Seat[]>()
    seatsWithCol.forEach((seat) => {
      const colNum = seat.column!
      if (!colMap.has(colNum)) {
        colMap.set(colNum, [])
      }
      colMap.get(colNum)!.push(seat)
    })

    const uniformScale = Math.min(containerWidth, containerHeight)
    const defaultLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

    return Array.from(colMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([colNum, colSeats]) => {
        const avgX = colSeats.reduce((sum, s) => sum + s.x, 0) / colSeats.length
        const avgW = colSeats.reduce((sum, s) => sum + s.w, 0) / colSeats.length
        const minY = Math.min(...colSeats.map((s) => s.y))

        const label =
          columnLabels && columnLabels[colNum] !== undefined
            ? columnLabels[colNum]
            : defaultLabels[colNum] || String(colNum + 1)

        return {
          column: colNum,
          label,
          x: avgX * containerWidth,
          w: avgW * uniformScale,
          topY: minY * containerHeight,
        }
      })
  }, [seats, columnLabels, containerWidth, containerHeight])

  if (columns.length === 0) {
    return null
  }

  const fontSize = COLUMN_HEADER_FONT_SIZE
  const headerOffset = 20

  return (
    <Group listening={false}>
      {columns.map((colInfo) => (
        <Text
          key={`col-${colInfo.column}`}
          text={colInfo.label}
          x={colInfo.x}
          y={colInfo.topY - headerOffset}
          width={colInfo.w}
          height={fontSize}
          align="center"
          verticalAlign="middle"
          fontSize={fontSize}
          fontStyle="bold"
          fill="#666666"
        />
      ))}
    </Group>
  )
}

export default ColumnHeaders
