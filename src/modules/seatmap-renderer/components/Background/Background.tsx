import { useEffect, useMemo, useState } from 'react'
import { Image as KonvaImage } from 'react-konva'

import { fitToContainer } from '../../../core/utils/coordinates'

interface BackgroundProps {
  url: string
  width: number
  height: number
  onError?: () => void
}

const Background = ({ url, width, height, onError }: BackgroundProps) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

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

  if (!url || !image || !fitted) {
    return null
  }

  return <KonvaImage image={image} width={fitted.width} height={fitted.height} listening={false} />
}

export default Background
