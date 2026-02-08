export const normalizedToPixel = (normalized: number, containerSize: number): number => {
  return normalized * containerSize
}

export const pixelToNormalized = (pixel: number, containerSize: number): number => {
  if (containerSize === 0) {
    return 0
  }

  return pixel / containerSize
}

export const normalizedToPixelPoint = (
  point: { x: number; y: number },
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } => {
  return {
    x: normalizedToPixel(point.x, containerWidth),
    y: normalizedToPixel(point.y, containerHeight),
  }
}

export const pixelToNormalizedPoint = (
  point: { x: number; y: number },
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } => {
  return {
    x: pixelToNormalized(point.x, containerWidth),
    y: pixelToNormalized(point.y, containerHeight),
  }
}

export const clampNormalized = (value: number): number => {
  return Math.min(1, Math.max(0, value))
}

export const calculateAspectRatio = (width: number, height: number): number => {
  if (height === 0) {
    return 0
  }

  return width / height
}

export const fitToContainer = (
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number
): { width: number; height: number; scale: number } => {
  if (imageWidth === 0 || imageHeight === 0) {
    return { width: 0, height: 0, scale: 0 }
  }

  const scaleX = containerWidth / imageWidth
  const scaleY = containerHeight / imageHeight
  const scale = Math.min(scaleX, scaleY)

  return {
    width: imageWidth * scale,
    height: imageHeight * scale,
    scale,
  }
}
