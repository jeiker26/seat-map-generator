import Konva from 'konva'
import { useCallback, useState } from 'react'

import { ZOOM_LIMITS } from '../../core/constants'

interface ZoomPanState {
  scale: number
  position: { x: number; y: number }
}

const DEFAULT_STATE: ZoomPanState = {
  scale: 1,
  position: { x: 0, y: 0 },
}

const useZoomPan = (minScale = ZOOM_LIMITS.MIN, maxScale = ZOOM_LIMITS.MAX) => {
  const [scale, setScale] = useState(DEFAULT_STATE.scale)
  const [position, setPosition] = useState(DEFAULT_STATE.position)

  const clampScale = useCallback(
    (value: number) => Math.max(minScale, Math.min(maxScale, value)),
    [minScale, maxScale],
  )

  const zoomIn = useCallback(() => {
    setScale((prev) => clampScale(prev * 1.2))
  }, [clampScale])

  const zoomOut = useCallback(() => {
    setScale((prev) => clampScale(prev / 1.2))
  }, [clampScale])

  const resetZoom = useCallback(() => {
    setScale(DEFAULT_STATE.scale)
    setPosition(DEFAULT_STATE.position)
  }, [])

  const zoomToFit = useCallback(
    (contentWidth: number, contentHeight: number, containerWidth: number, containerHeight: number) => {
      if (contentWidth === 0 || contentHeight === 0) {
        return
      }

      const scaleX = containerWidth / contentWidth
      const scaleY = containerHeight / contentHeight
      const fitScale = clampScale(Math.min(scaleX, scaleY))

      const offsetX = (containerWidth - contentWidth * fitScale) / 2
      const offsetY = (containerHeight - contentHeight * fitScale) / 2

      setScale(fitScale)
      setPosition({ x: offsetX, y: offsetY })
    },
    [clampScale],
  )

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
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
      const clampedScale = clampScale(newScale)

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      }

      setScale(clampedScale)
      setPosition({
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      })
    },
    [clampScale],
  )

  return {
    scale,
    position,
    zoomIn,
    zoomOut,
    resetZoom,
    zoomToFit,
    handleWheel,
    setPosition,
  }
}

export default useZoomPan
