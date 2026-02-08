import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'

import { DEFAULT_SEAT_SIZE, MAX_BACKGROUND_SIZE_BYTES, MAX_BACKGROUND_SIZE_MB } from '../../../core/constants'
import { Seat, SeatMap } from '../../../core/types'
import { useEditorState } from '../../hooks/useEditorState'
import { OPEN_CATEGORIES_EVENT, useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { createEmptySeatMap, downloadJson, importFromJson } from '../../services'
import CategoryManager from '../CategoryManager/CategoryManager'
import GridGenerator from '../GridGenerator/GridGenerator'
import SeatProperties from '../SeatProperties/SeatProperties'
import Toolbar from '../Toolbar/Toolbar'
import styles from './Editor.module.scss'

const Canvas = dynamic(() => import('../../../seatmap-renderer/components/Canvas/Canvas'), { ssr: false })

const DEFAULT_SEATMAP: SeatMap = createEmptySeatMap()

const Editor = () => {
  const seatMap = useEditorState((s) => s.seatMap)
  const selectedSeats = useEditorState((s) => s.selectedSeats)
  const activeTool = useEditorState((s) => s.activeTool)
  const setSeatMap = useEditorState((s) => s.setSeatMap)
  const addSeat = useEditorState((s) => s.addSeat)
  const updateSeat = useEditorState((s) => s.updateSeat)
  const updateElement = useEditorState((s) => s.updateElement)
  const selectSeat = useEditorState((s) => s.selectSeat)
  const selectSeats = useEditorState((s) => s.selectSeats)
  const deselectSeat = useEditorState((s) => s.deselectSeat)
  const clearSelection = useEditorState((s) => s.clearSelection)
  const setActiveTool = useEditorState((s) => s.setActiveTool)
  const updateBackground = useEditorState((s) => s.updateBackground)

  const [isGridOpen, setIsGridOpen] = useState(false)
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [backgroundError, setBackgroundError] = useState<string | null>(null)

  useKeyboardShortcuts()

  useEffect(() => {
    const handleOpenCategories = () => setIsCategoryManagerOpen(true)
    window.addEventListener(OPEN_CATEGORIES_EVENT, handleOpenCategories)
    return () => window.removeEventListener(OPEN_CATEGORIES_EVENT, handleOpenCategories)
  }, [])

  if (!seatMap) {
    setSeatMap(DEFAULT_SEATMAP)
  }

  const handleStageClick = useCallback(
    (x: number, y: number) => {
      if (activeTool === 'add') {
        const seatSize = seatMap?.settings?.defaultSeatSize || DEFAULT_SEAT_SIZE
        const newSeat: Seat = {
          id: crypto.randomUUID(),
          label: `S${(seatMap?.seats.length || 0) + 1}`,
          x,
          y,
          w: seatSize.w,
          h: seatSize.h,
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
    (seatId: string, event?: MouseEvent) => {
      if (activeTool === 'select') {
        const isShiftHeld = event?.shiftKey ?? false

        if (isShiftHeld) {
          if (selectedSeats.includes(seatId)) {
            deselectSeat(seatId)
          } else {
            selectSeat(seatId)
          }
        } else {
          clearSelection()
          selectSeat(seatId)
        }
      }
    },
    [activeTool, selectedSeats, clearSelection, selectSeat, deselectSeat],
  )

  const handleSeatDragEnd = useCallback(
    (seatId: string, x: number, y: number) => {
      updateSeat(seatId, { x, y })
    },
    [updateSeat],
  )

  const handleElementDragEnd = useCallback(
    (elementId: string, x: number, y: number) => {
      updateElement(elementId, { x, y })
    },
    [updateElement],
  )

  const handleOpenCategories = useCallback(() => {
    setIsCategoryManagerOpen(true)
  }, [])

  const handleLassoSelect = useCallback(
    (seatIds: string[], additive: boolean) => {
      if (additive) {
        // Shift+drag: add new seats to existing selection (avoid duplicates)
        const existingSet = new Set(selectedSeats)
        const newIds = seatIds.filter((id) => !existingSet.has(id))
        selectSeats([...selectedSeats, ...newIds])
      } else {
        // Normal drag: replace selection entirely
        selectSeats(seatIds)
      }
    },
    [selectedSeats, selectSeats],
  )

  const handleBackgroundDragEnd = useCallback(
    (x: number, y: number) => {
      updateBackground({ x, y })
    },
    [updateBackground],
  )

  const handleBackgroundTransformEnd = useCallback(
    (x: number, y: number, bgScale: number) => {
      updateBackground({ x, y, scale: bgScale })
    },
    [updateBackground],
  )

  const isBackgroundLocked = seatMap?.background?.locked ?? true

  const handleToggleBackgroundLock = useCallback(() => {
    updateBackground({ locked: !isBackgroundLocked })
  }, [updateBackground, isBackgroundLocked])

  const handleExport = useCallback(() => {
    if (!seatMap) {
      return
    }
    downloadJson(seatMap)
  }, [seatMap])

  const handleImport = useCallback(
    (data: string) => {
      const result = importFromJson(data)
      if (result.success === true) {
        setSeatMap(result.data)
      } else if (result.success === false) {
        console.error('Import validation failed:', result.errors.join('; '))
      }
    },
    [setSeatMap],
  )

  const processBackgroundFile = useCallback(
    (file: File) => {
      setBackgroundError(null)

      if (!file.type.startsWith('image/')) {
        setBackgroundError('Invalid file type. Please select an image file.')
        return
      }

      if (file.size > MAX_BACKGROUND_SIZE_BYTES) {
        setBackgroundError(`File size exceeds ${MAX_BACKGROUND_SIZE_MB}MB limit.`)
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
        img.onerror = () => {
          setBackgroundError('Failed to load image. The file may be corrupted.')
        }
        img.src = url
      }
      reader.readAsDataURL(file)
    },
    [seatMap, setSeatMap],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (!file) {
        return
      }
      processBackgroundFile(file)
    },
    [processBackgroundFile],
  )

  const handleUploadBackground = useCallback(
    (file: File) => {
      processBackgroundFile(file)
    },
    [processBackgroundFile],
  )

  const handleRemoveBackground = useCallback(() => {
    if (seatMap) {
      const updatedMap: SeatMap = {
        ...seatMap,
        background: { url: '', width: 0, height: 0 },
        updatedAt: new Date().toISOString(),
      }
      setSeatMap(updatedMap)
      setBackgroundError(null)
    }
  }, [seatMap, setSeatMap])

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
      <Toolbar
        onExport={handleExport}
        onImport={handleImport}
        onUploadBackground={handleUploadBackground}
        onRemoveBackground={handleRemoveBackground}
        onOpenCategories={handleOpenCategories}
        onToggleBackgroundLock={handleToggleBackgroundLock}
        hasBackground={Boolean(seatMap.background?.url)}
        isBackgroundLocked={isBackgroundLocked}
      />
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
            activeTool={activeTool}
            onSeatClick={handleSeatClick}
            onSeatDragEnd={handleSeatDragEnd}
            onStageClick={handleStageClick}
            onElementDragEnd={handleElementDragEnd}
            onLassoSelect={handleLassoSelect}
            onBackgroundDragEnd={handleBackgroundDragEnd}
            onBackgroundTransformEnd={handleBackgroundTransformEnd}
          />
          {isDragOver && <div className={styles['editor__drop-overlay']}>Drop image to set as background</div>}
          {backgroundError && (
            <div className={styles['editor__error']}>
              {backgroundError}
              <button
                className={styles['editor__error-close']}
                onClick={() => setBackgroundError(null)}
                type="button"
                aria-label="Dismiss error"
              >
                x
              </button>
            </div>
          )}
        </div>
        <SeatProperties />
      </div>
      <GridGenerator isOpen={isGridOpen} onClose={() => setIsGridOpen(false)} />
      <CategoryManager isOpen={isCategoryManagerOpen} onClose={() => setIsCategoryManagerOpen(false)} />
    </div>
  )
}

export default Editor
