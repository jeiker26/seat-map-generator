import Konva from 'konva'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Layer, Rect, Stage } from 'react-konva'

import { EditorTool, SeatCategory, SeatMap } from '../../../core/types'
import Background from '../Background/Background'
import ColumnHeaders from '../ColumnHeaders/ColumnHeaders'
import Legend from '../Legend/Legend'
import MapElements from '../MapElements/MapElements'
import RowNumbers from '../RowNumbers/RowNumbers'
import SeatComponent from '../Seat/Seat'
import ZoneComponent from '../Zone/Zone'

interface SelectionRect {
  startX: number
  startY: number
  currentX: number
  currentY: number
}

interface CanvasProps {
  seatMap: SeatMap
  isEditable?: boolean
  selectedSeats?: string[]
  showLabels?: boolean
  activeTool?: EditorTool
  onSeatClick?: (_seatId: string, _event?: MouseEvent) => void
  onSeatDragEnd?: (_seatId: string, _x: number, _y: number) => void
  onGroupDragEnd?: (_draggedSeatId: string, _deltaX: number, _deltaY: number) => void
  onStageClick?: (_x: number, _y: number) => void
  onElementDragEnd?: (_elementId: string, _x: number, _y: number) => void
  onSeatHover?: (_seatId: string, _pixelX: number, _pixelY: number) => void
  onSeatHoverEnd?: (_seatId: string) => void
  onLassoSelect?: (_seatIds: string[], _additive: boolean) => void
  onBackgroundDragEnd?: (_x: number, _y: number) => void
  onBackgroundTransformEnd?: (_x: number, _y: number, _scale: number) => void
  showZoomIndicator?: boolean
}

const Canvas = ({
  seatMap,
  isEditable = false,
  selectedSeats = [],
  showLabels = true,
  activeTool,
  onSeatClick,
  onSeatDragEnd,
  onGroupDragEnd,
  onStageClick,
  onElementDragEnd,
  onSeatHover,
  onSeatHoverEnd,
  onLassoSelect,
  onBackgroundDragEnd,
  onBackgroundTransformEnd,
  showZoomIndicator = false,
}: CanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null)
  const isSelectingRef = useRef(false)
  const dragStartRef = useRef<{ seatId: string; x: number; y: number } | null>(null)
  const seatNodeRefs = useRef<Map<string, Konva.Group>>(new Map())

  const isSeatDraggable = isEditable && activeTool === 'select'

  const registerSeatNode = useCallback((seatId: string, node: Konva.Group | null) => {
    if (node) {
      seatNodeRefs.current.set(seatId, node)
    } else {
      seatNodeRefs.current.delete(seatId)
    }
  }, [])

  const handleSeatDragStart = useCallback((seatId: string, x: number, y: number) => {
    dragStartRef.current = { seatId, x, y }
  }, [])

  const handleSeatDragMove = useCallback(
    (seatId: string, pixelDeltaX: number, pixelDeltaY: number) => {
      if (selectedSeats.length <= 1 || !selectedSeats.includes(seatId)) {
        return
      }
      // Move all other selected seats visually by the same pixel delta
      for (const id of selectedSeats) {
        if (id === seatId) {
          continue
        }
        const node = seatNodeRefs.current.get(id)
        if (!node) {
          continue
        }
        const seat = seatMap.seats.find((s) => s.id === id)
        if (!seat) {
          continue
        }
        const basePixelX = seat.x * dimensions.width
        const basePixelY = seat.y * dimensions.height
        node.x(basePixelX + pixelDeltaX)
        node.y(basePixelY + pixelDeltaY)
      }
    },
    [selectedSeats, seatMap.seats, dimensions],
  )

  const handleSeatDragEnd = useCallback(
    (seatId: string, newX: number, newY: number) => {
      const startPos = dragStartRef.current
      if (startPos && onGroupDragEnd) {
        const deltaX = newX - startPos.x
        const deltaY = newY - startPos.y
        onGroupDragEnd(seatId, deltaX, deltaY)
      } else if (onSeatDragEnd) {
        onSeatDragEnd(seatId, newX, newY)
      }
      dragStartRef.current = null
    },
    [onGroupDragEnd, onSeatDragEnd],
  )

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

  const { background, seats, zones, categories, elements, gridConfig, settings } = seatMap

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

  const isLassoEnabled = isEditable && activeTool === 'select' && Boolean(onLassoSelect)

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isLassoEnabled) {
        return
      }
      // Only start lasso when clicking on the stage background (not on a seat or element)
      if (e.target !== e.target.getStage()) {
        return
      }
      const stage = e.target.getStage()
      if (!stage) {
        return
      }
      const pointer = stage.getPointerPosition()
      if (!pointer) {
        return
      }

      // Convert pixel position to normalized coordinates
      const normX = (pointer.x - position.x) / scale / dimensions.width
      const normY = (pointer.y - position.y) / scale / dimensions.height

      isSelectingRef.current = true
      setSelectionRect({ startX: normX, startY: normY, currentX: normX, currentY: normY })
    },
    [isLassoEnabled, position, scale, dimensions],
  )

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isSelectingRef.current || !selectionRect) {
        return
      }
      const stage = e.target.getStage()
      if (!stage) {
        return
      }
      const pointer = stage.getPointerPosition()
      if (!pointer) {
        return
      }

      const normX = (pointer.x - position.x) / scale / dimensions.width
      const normY = (pointer.y - position.y) / scale / dimensions.height

      setSelectionRect((prev) => {
        if (!prev) {
          return prev
        }
        return { ...prev, currentX: normX, currentY: normY }
      })
    },
    [selectionRect, position, scale, dimensions],
  )

  const handleMouseUp = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isSelectingRef.current || !selectionRect || !onLassoSelect) {
        isSelectingRef.current = false
        setSelectionRect(null)
        return
      }

      isSelectingRef.current = false

      // Calculate the normalized bounding box of the selection rectangle
      const rectMinX = Math.min(selectionRect.startX, selectionRect.currentX)
      const rectMaxX = Math.max(selectionRect.startX, selectionRect.currentX)
      const rectMinY = Math.min(selectionRect.startY, selectionRect.currentY)
      const rectMaxY = Math.max(selectionRect.startY, selectionRect.currentY)

      // Require a minimum drag distance to avoid accidental selections (threshold in normalized coords)
      const MIN_DRAG_THRESHOLD = 0.005
      if (rectMaxX - rectMinX < MIN_DRAG_THRESHOLD && rectMaxY - rectMinY < MIN_DRAG_THRESHOLD) {
        setSelectionRect(null)
        return
      }

      // Find all seats whose center falls within the selection rectangle
      const matchingSeatIds = seats
        .filter((seat) => {
          const centerX = seat.x + seat.w / 2
          const centerY = seat.y + seat.h / 2
          return centerX >= rectMinX && centerX <= rectMaxX && centerY >= rectMinY && centerY <= rectMaxY
        })
        .map((seat) => seat.id)

      const isAdditive = e.evt.shiftKey
      onLassoSelect(matchingSeatIds, isAdditive)

      setSelectionRect(null)
    },
    [selectionRect, onLassoSelect, seats],
  )

  // Compute the selection rectangle pixel coordinates for rendering
  const selectionRectPixels = useMemo(() => {
    if (!selectionRect) {
      return null
    }
    const x1 = selectionRect.startX * dimensions.width
    const y1 = selectionRect.startY * dimensions.height
    const x2 = selectionRect.currentX * dimensions.width
    const y2 = selectionRect.currentY * dimensions.height
    return {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    }
  }, [selectionRect, dimensions])

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

  const stageDraggable = !isLassoEnabled

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
        draggable={stageDraggable}
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
        onClick={handleStageClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {background?.url && (
            <Background
              url={background.url}
              width={dimensions.width}
              height={dimensions.height}
              bgX={background.x ?? 0}
              bgY={background.y ?? 0}
              bgScale={background.scale ?? 1}
              isEditable={isEditable}
              locked={background.locked ?? true}
              onDragEnd={onBackgroundDragEnd}
              onTransformEnd={onBackgroundTransformEnd}
            />
          )}
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
              isDraggable={isSeatDraggable}
              showLabel={showLabels}
              category={seat.categoryId ? categoryMap.get(seat.categoryId) : undefined}
              onClick={onSeatClick}
              onDragStart={handleSeatDragStart}
              onDragMove={handleSeatDragMove}
              onDragEnd={handleSeatDragEnd}
              onMouseEnter={onSeatHover}
              onMouseLeave={onSeatHoverEnd}
              onNodeRef={registerSeatNode}
            />
          ))}
        </Layer>
        {selectionRectPixels && (
          <Layer>
            <Rect
              x={selectionRectPixels.x}
              y={selectionRectPixels.y}
              width={selectionRectPixels.width}
              height={selectionRectPixels.height}
              fill="rgba(0, 120, 215, 0.15)"
              stroke="#0078D7"
              strokeWidth={1}
              dash={[4, 4]}
              listening={false}
            />
          </Layer>
        )}
      </Stage>
      {showLegend && categories && categories.length > 0 && <Legend categories={categories} />}
      {showZoomIndicator && (
        <button
          type="button"
          data-testid="zoom-indicator"
          onClick={() => {
            setScale(1)
            setPosition({ x: 0, y: 0 })
          }}
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px 10px',
            backgroundColor: '#ffffff',
            borderRadius: 8,
            border: 'none',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.08)',
            fontSize: 12,
            fontWeight: 500,
            color: '#495057',
            cursor: 'pointer',
            fontFamily: "'SF Mono', Monaco, Menlo, monospace",
            lineHeight: 1,
            userSelect: 'none',
          }}
          title="Reset zoom to 100%"
        >
          {Math.round(scale * 100)}%
        </button>
      )}
    </div>
  )
}

export default Canvas
