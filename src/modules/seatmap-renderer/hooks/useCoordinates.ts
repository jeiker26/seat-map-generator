import { useCallback } from 'react'

import {
  normalizedToPixel as normalizedToPixelUtil,
  pixelToNormalized as pixelToNormalizedUtil,
} from '../utils/coordinates'

const useCoordinates = (containerWidth: number, containerHeight: number) => {
  const normalizedToPixel = useCallback(
    (normalized: number, isHorizontal: boolean) => {
      const containerSize = isHorizontal ? containerWidth : containerHeight
      return normalizedToPixelUtil(normalized, containerSize)
    },
    [containerWidth, containerHeight],
  )

  const pixelToNormalized = useCallback(
    (pixel: number, isHorizontal: boolean) => {
      const containerSize = isHorizontal ? containerWidth : containerHeight
      return pixelToNormalizedUtil(pixel, containerSize)
    },
    [containerWidth, containerHeight],
  )

  const normalizedToPixelPoint = useCallback(
    (point: { x: number; y: number }) => ({
      x: normalizedToPixelUtil(point.x, containerWidth),
      y: normalizedToPixelUtil(point.y, containerHeight),
    }),
    [containerWidth, containerHeight],
  )

  const pixelToNormalizedPoint = useCallback(
    (point: { x: number; y: number }) => ({
      x: pixelToNormalizedUtil(point.x, containerWidth),
      y: pixelToNormalizedUtil(point.y, containerHeight),
    }),
    [containerWidth, containerHeight],
  )

  return {
    normalizedToPixel,
    pixelToNormalized,
    normalizedToPixelPoint,
    pixelToNormalizedPoint,
  }
}

export default useCoordinates
