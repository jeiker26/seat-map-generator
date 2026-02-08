import { Group, Line, Rect, Text } from 'react-konva'

import { MapElement as MapElementType } from '../../../core/types'

interface MapElementsProps {
  elements: MapElementType[]
  containerWidth: number
  containerHeight: number
  isEditable?: boolean
  onElementDragEnd?: (_elementId: string, _x: number, _y: number) => void
}

const ICON_PATHS: Record<string, string> = {
  restroom: 'WC',
  cafe: 'CAFE',
  exit: 'EXIT',
  stairs: 'STAIRS',
  elevator: 'ELEV',
  info: 'INFO',
  food: 'FOOD',
  bar: 'BAR',
  vip: 'VIP',
}

const MapElements = ({
  elements,
  containerWidth,
  containerHeight,
  isEditable = false,
  onElementDragEnd,
}: MapElementsProps) => {
  const uniformScale = Math.min(containerWidth, containerHeight)

  const renderElement = (element: MapElementType) => {
    const pixelX = element.x * containerWidth
    const pixelY = element.y * containerHeight
    const pixelW = element.w * uniformScale
    const pixelH = element.h * uniformScale
    const color = element.color || '#666666'

    const handleDragEnd = (e: any) => {
      if (onElementDragEnd) {
        const newX = e.target.x() / containerWidth
        const newY = e.target.y() / containerHeight
        onElementDragEnd(element.id, newX, newY)
      }
    }

    switch (element.type) {
      case 'text-label':
        return (
          <Group
            key={element.id}
            x={pixelX}
            y={pixelY}
            draggable={isEditable}
            onDragEnd={handleDragEnd}
            rotation={element.r || 0}
          >
            <Text
              text={element.label || ''}
              width={pixelW}
              height={pixelH}
              align="center"
              verticalAlign="middle"
              fontSize={element.fontSize || 12}
              fill={color}
              fontStyle="bold"
            />
          </Group>
        )

      case 'icon':
        return (
          <Group
            key={element.id}
            x={pixelX}
            y={pixelY}
            draggable={isEditable}
            onDragEnd={handleDragEnd}
            rotation={element.r || 0}
          >
            <Rect width={pixelW} height={pixelH} fill="#F5F5F5" stroke="#BDBDBD" strokeWidth={1} cornerRadius={4} />
            <Text
              text={element.icon ? ICON_PATHS[element.icon] || element.icon : '?'}
              width={pixelW}
              height={pixelH}
              align="center"
              verticalAlign="middle"
              fontSize={Math.max(Math.min(pixelW, pixelH) * 0.35, 8)}
              fill={color}
              fontStyle="bold"
            />
          </Group>
        )

      case 'divider':
        return (
          <Group
            key={element.id}
            x={pixelX}
            y={pixelY}
            draggable={isEditable}
            onDragEnd={handleDragEnd}
            rotation={element.r || 0}
          >
            <Line points={[0, pixelH / 2, pixelW, pixelH / 2]} stroke={color} strokeWidth={2} dash={[4, 4]} />
          </Group>
        )

      case 'row-number':
        return (
          <Group key={element.id} x={pixelX} y={pixelY} listening={false}>
            <Text
              text={element.label || ''}
              width={pixelW}
              height={pixelH}
              align="center"
              verticalAlign="middle"
              fontSize={element.fontSize || 12}
              fill={color}
              fontStyle="bold"
            />
          </Group>
        )

      case 'column-header':
        return (
          <Group key={element.id} x={pixelX} y={pixelY} listening={false}>
            <Text
              text={element.label || ''}
              width={pixelW}
              height={pixelH}
              align="center"
              verticalAlign="middle"
              fontSize={element.fontSize || 11}
              fill={color}
              fontStyle="bold"
            />
          </Group>
        )

      default:
        return null
    }
  }

  return <Group>{elements.map(renderElement)}</Group>
}

export default MapElements
