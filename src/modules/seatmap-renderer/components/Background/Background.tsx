import { useCallback, useEffect, useState } from 'react'
import { Image as KonvaImage } from 'react-konva'

interface BackgroundProps {
  url: string
  width: number
  height: number
}

const Background = ({ url, width, height }: BackgroundProps) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  const loadImage = useCallback(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = url
    img.onload = () => setImage(img)
  }, [url])

  useEffect(() => {
    loadImage()
  }, [loadImage])

  if (!image) {
    return null
  }

  return <KonvaImage image={image} width={width} height={height} listening={false} />
}

export default Background
