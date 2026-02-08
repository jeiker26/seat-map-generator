import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'

import { Seat, SeatMap } from '../../../core/types'
import { useEditorState } from '../../hooks/useEditorState'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import GridGenerator from '../GridGenerator/GridGenerator'
import SeatProperties from '../SeatProperties/SeatProperties'
import Toolbar from '../Toolbar/Toolbar'
import styles from './Editor.module.scss'

const Canvas = dynamic(() => import('../../../seatmap-renderer/components/Canvas/Canvas'), { ssr: false })

const DEFAULT_SEATMAP: SeatMap = {
  id: crypto.randomUUID(),
  version: '1.0',
  name: 'Untitled Map',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  background: { url: '', width: 800, height: 600 },
  seats: [],
  zones: [],
  settings: { allowMultiSelect: true, showLabels: true, theme: 'light' },
}

const Editor = () => {
  const seatMap = useEditorState((s) => s.seatMap)
  const selectedSeats = useEditorState((s) => s.selectedSeats)
  const activeTool = useEditorState((s) => s.activeTool)
  const setSeatMap = useEditorState((s) => s.setSeatMap)
  const addSeat = useEditorState((s) => s.addSeat)
  const updateSeat = useEditorState((s) => s.updateSeat)
  const selectSeat = useEditorState((s) => s.selectSeat)
  const clearSelection = useEditorState((s) => s.clearSelection)
  const setActiveTool = useEditorState((s) => s.setActiveTool)

  const [isGridOpen, setIsGridOpen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  useKeyboardShortcuts()

  if (!seatMap) {
    setSeatMap(DEFAULT_SEATMAP)
  }

  const handleStageClick = useCallback(
    (x: number, y: number) => {
      if (activeTool === 'add') {
        const newSeat: Seat = {
          id: crypto.randomUUID(),
          label: `S${(seatMap?.seats.length || 0) + 1}`,
          x,
          y,
          w: 0.02,
          h: 0.02,
          status: 'available',
        }
        addSeat(newSeat)
      } else if (activeTool === 'select') {
        clearSelection()
      }

      if (activeTool === 'grid') {
        setIsGridOpen(true)
        setActiveTool('select')
      }
    },
    [activeTool, addSeat, clearSelection, seatMap, setActiveTool],
  )

  const handleSeatClick = useCallback(
    (seatId: string) => {
      if (activeTool === 'select') {
        clearSelection()
        selectSeat(seatId)
      }
    },
    [activeTool, clearSelection, selectSeat],
  )

  const handleSeatDragEnd = useCallback(
    (seatId: string, x: number, y: number) => {
      updateSeat(seatId, { x, y })
    },
    [updateSeat],
  )

  const handleExport = useCallback(() => {
    if (!seatMap) {
      return
    }
    const json = JSON.stringify(seatMap, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${seatMap.name || 'seatmap'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [seatMap])

  const handleImport = useCallback(
    (data: string) => {
      try {
        const parsed = JSON.parse(data) as SeatMap
        setSeatMap(parsed)
      } catch {
        console.error('Failed to parse imported JSON')
      }
    },
    [setSeatMap],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (!file || !file.type.startsWith('image/')) {
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        const img = new window.Image()
        img.onload = () => {
          if (seatMap) {
            const updatedMap: SeatMap = {
              ...seatMap,
              background: {
                url,
                width: img.naturalWidth,
                height: img.naturalHeight,
                aspectRatio: img.naturalWidth / img.naturalHeight,
              },
              updatedAt: new Date().toISOString(),
            }
            setSeatMap(updatedMap)
          }
        }
        img.src = url
      }
      reader.readAsDataURL(file)
    },
    [seatMap, setSeatMap],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  if (!seatMap) {
    return null
  }

  return (
    <div className={styles.editor}>
      <Toolbar onExport={handleExport} onImport={handleImport} />
      <div className={styles.editor__content}>
        <div
          className={`${styles.editor__canvas} ${isDragOver ? styles['editor__canvas--dragover'] : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Canvas
            seatMap={seatMap}
            isEditable
            selectedSeats={selectedSeats}
            showLabels={seatMap.settings?.showLabels ?? true}
            onSeatClick={handleSeatClick}
            onSeatDragEnd={handleSeatDragEnd}
            onStageClick={handleStageClick}
          />
          {isDragOver && <div className={styles['editor__drop-overlay']}>Drop image to set as background</div>}
        </div>
        <SeatProperties />
      </div>
      <GridGenerator isOpen={isGridOpen} onClose={() => setIsGridOpen(false)} />
    </div>
  )
}

export default Editor
