import { Group, Rect, Text } from 'react-konva'

import { Zone as ZoneType } from '../../../core/types'

interface ZoneProps {
  zone: ZoneType
  bounds: { x: number; y: number; w: number; h: number }
  containerWidth: number
  containerHeight: number
}

const ZoneComponent = ({ zone, bounds, containerWidth, containerHeight }: ZoneProps) => {
  const pixelX = bounds.x * containerWidth
  const pixelY = bounds.y * containerHeight
  const pixelW = bounds.w * containerWidth
  const pixelH = bounds.h * containerHeight

  return (
    <Group x={pixelX} y={pixelY} listening={false}>
      <Rect width={pixelW} height={pixelH} fill={zone.color} opacity={0.15} cornerRadius={4} />
      <Text text={zone.name} x={4} y={4} fontSize={12} fill={zone.color} fontStyle="bold" />
    </Group>
  )
}

export default ZoneComponent
