import Konva from 'konva'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Group, Image as KonvaImage, Transformer } from 'react-konva'

import { fitToContainer } from '../../../core/utils/coordinates'

interface BackgroundProps {
  url: string
  width: number
  height: number
  bgX?: number
  bgY?: number
  bgScale?: number
  isEditable?: boolean
  locked?: boolean
  onDragEnd?: (_x: number, _y: number) => void
  onTransformEnd?: (_x: number, _y: number, _scale: number) => void
  onError?: () => void
}

const Background = ({
  url,
  width,
  height,
  bgX = 0,
  bgY = 0,
  bgScale = 1,
  isEditable = false,
  locked = true,
  onDragEnd,
  onTransformEnd,
  onError,
}: BackgroundProps) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const imageRef = useRef<Konva.Image>(null)
  const transformerRef = useRef<Konva.Transformer>(null)

  useEffect(() => {
    if (!url) {
      return
    }

    let cancelled = false
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (!cancelled) {
        setImage(img)
      }
    }
    img.onerror = () => {
      console.error('Failed to load background image')
      if (!cancelled) {
        setImage(null)
      }
      if (onError) {
        onError()
      }
    }
    img.src = url

    return () => {
      cancelled = true
      img.onload = null
      img.onerror = null
    }
  }, [url, onError])

  const fitted = useMemo(() => {
    if (!image) {
      return null
    }
    return fitToContainer(image.naturalWidth, image.naturalHeight, width, height)
  }, [image, width, height])

  // Attach/detach transformer when editable state or lock state changes
  const isInteractive = isEditable && !locked
  useEffect(() => {
    const transformer = transformerRef.current
    const node = imageRef.current
    if (isInteractive && transformer && node) {
      transformer.nodes([node])
      transformer.getLayer()?.batchDraw()
    } else if (transformer) {
      transformer.nodes([])
      transformer.getLayer()?.batchDraw()
    }
  }, [isInteractive, image])

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (onDragEnd) {
        onDragEnd(e.target.x(), e.target.y())
      }
    },
    [onDragEnd],
  )

  const handleTransformEnd = useCallback(() => {
    const node = imageRef.current
    if (!node || !onTransformEnd) {
      return
    }

    // Konva Transformer applies scaleX/scaleY to the node. We need to:
    // 1. Read the new scale
    // 2. Reset node scaleX/scaleY to 1 and adjust width/height instead (or keep scale)
    // We'll normalize to a single "scale" factor relative to the fitted size
    const scaleX = node.scaleX()
    const newX = node.x()
    const newY = node.y()

    // Reset node scale so it doesn't compound on next transform
    node.scaleX(1)
    node.scaleY(1)

    // Apply the new scale to width/height
    if (fitted) {
      node.width(fitted.width * bgScale * scaleX)
      node.height(fitted.height * bgScale * scaleX)
    }

    // Calculate the new background scale relative to the fitted size
    const newScale = bgScale * scaleX

    onTransformEnd(newX, newY, newScale)
  }, [onTransformEnd, fitted, bgScale])

  if (!url || !image || !fitted) {
    return null
  }

  const imageWidth = fitted.width * bgScale
  const imageHeight = fitted.height * bgScale

  return (
    <Group>
      <KonvaImage
        ref={imageRef}
        image={image}
        x={bgX}
        y={bgY}
        width={imageWidth}
        height={imageHeight}
        draggable={isInteractive}
        listening={isInteractive}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      {isInteractive && (
        <Transformer
          ref={transformerRef}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          keepRatio
          boundBoxFunc={(_oldBox, newBox) => {
            // Prevent resizing to too small
            if (newBox.width < 20 || newBox.height < 20) {
              return _oldBox
            }
            return newBox
          }}
          rotateEnabled={false}
          borderStroke="#0078D7"
          borderStrokeWidth={2}
          anchorStroke="#0078D7"
          anchorFill="#FFFFFF"
          anchorSize={10}
          anchorCornerRadius={2}
        />
      )}
    </Group>
  )
}

export default Background
