import Konva from 'konva'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Layer, Stage } from 'react-konva'

import { SeatCategory, SeatMap } from '../../../core/types'
import Background from '../Background/Background'
import ColumnHeaders from '../ColumnHeaders/ColumnHeaders'
import Legend from '../Legend/Legend'
import MapElements from '../MapElements/MapElements'
import RowNumbers from '../RowNumbers/RowNumbers'
import SeatComponent from '../Seat/Seat'
import ZoneComponent from '../Zone/Zone'

interface CanvasProps {
  seatMap: SeatMap
  isEditable?: boolean
  selectedSeats?: string[]
  showLabels?: boolean
  onSeatClick?: (_seatId: string, _event?: MouseEvent) => void
  onSeatDragEnd?: (_seatId: string, _x: number, _y: number) => void
  onStageClick?: (_x: number, _y: number) => void
  onElementDragEnd?: (_elementId: string, _x: number, _y: number) => void
}

const Canvas = ({
  seatMap,
  isEditable = false,
  selectedSeats = [],
  showLabels = true,
  onSeatClick,
  onSeatDragEnd,
  onStageClick,
  onElementDragEnd,
}: CanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
      }
    })

    observer.observe(container)
    setDimensions({ width: container.offsetWidth, height: container.offsetHeight })

    return () => observer.disconnect()
  }, [])

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = e.target.getStage()
    if (!stage) {
      return
    }

    const oldScale = stage.scaleX()
    const pointer = stage.getPointerPosition()
    if (!pointer) {
      return
    }

    const scaleBy = 1.1
    const direction = e.evt.deltaY > 0 ? -1 : 1
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy
    const clampedScale = Math.max(0.1, Math.min(5, newScale))

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }

    setScale(clampedScale)
    setPosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    })
  }, [])

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    setPosition({ x: e.target.x(), y: e.target.y() })
  }, [])

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage() && onStageClick) {
        const stage = e.target.getStage()
        if (!stage) {
          return
        }
        const pointer = stage.getPointerPosition()
        if (!pointer) {
          return
        }
        const x = (pointer.x - position.x) / scale / dimensions.width
        const y = (pointer.y - position.y) / scale / dimensions.height
        onStageClick(x, y)
      }
    },
    [onStageClick, position, scale, dimensions],
  )

  const { background, seats, zones, categories, elements, gridConfig, settings } = seatMap

  const categoryMap = useMemo(() => {
    const map = new Map<string, SeatCategory>()
    if (categories) {
      categories.forEach((cat) => map.set(cat.id, cat))
    }
    return map
  }, [categories])

  const showRowNumbers = settings?.showRowNumbers ?? gridConfig?.rowNumbersVisible ?? false
  const showColumnHeaders = settings?.showColumnHeaders ?? gridConfig?.columnHeadersVisible ?? false
  const showLegend = settings?.showLegend ?? (categories && categories.length > 0)

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
        onClick={handleStageClick}
      >
        <Layer>
          {background?.url && <Background url={background.url} width={dimensions.width} height={dimensions.height} />}
        </Layer>
        <Layer>
          {zones?.map((zone) => {
            const zoneSeats = seats.filter((s) => s.zoneId === zone.id)
            if (zoneSeats.length === 0) {
              return null
            }
            const minX = Math.min(...zoneSeats.map((s) => s.x))
            const minY = Math.min(...zoneSeats.map((s) => s.y))
            const maxX = Math.max(...zoneSeats.map((s) => s.x + s.w))
            const maxY = Math.max(...zoneSeats.map((s) => s.y + s.h))
            return (
              <ZoneComponent
                key={zone.id}
                zone={zone}
                bounds={{ x: minX - 0.01, y: minY - 0.01, w: maxX - minX + 0.02, h: maxY - minY + 0.02 }}
                containerWidth={dimensions.width}
                containerHeight={dimensions.height}
              />
            )
          })}
        </Layer>
        <Layer>
          {showRowNumbers && (
            <RowNumbers seats={seats} containerWidth={dimensions.width} containerHeight={dimensions.height} />
          )}
          {showColumnHeaders && (
            <ColumnHeaders
              seats={seats}
              columnLabels={gridConfig?.columnLabels}
              containerWidth={dimensions.width}
              containerHeight={dimensions.height}
            />
          )}
          {elements && elements.length > 0 && (
            <MapElements
              elements={elements}
              containerWidth={dimensions.width}
              containerHeight={dimensions.height}
              isEditable={isEditable}
              onElementDragEnd={onElementDragEnd}
            />
          )}
        </Layer>
        <Layer>
          {seats.map((seat) => (
            <SeatComponent
              key={seat.id}
              seat={seat}
              containerWidth={dimensions.width}
              containerHeight={dimensions.height}
              isSelected={selectedSeats.includes(seat.id)}
              isEditable={isEditable}
              showLabel={showLabels}
              category={seat.categoryId ? categoryMap.get(seat.categoryId) : undefined}
              onClick={onSeatClick}
              onDragEnd={onSeatDragEnd}
            />
          ))}
        </Layer>
      </Stage>
      {showLegend && categories && categories.length > 0 && <Legend categories={categories} />}
    </div>
  )
}

export default Canvas
