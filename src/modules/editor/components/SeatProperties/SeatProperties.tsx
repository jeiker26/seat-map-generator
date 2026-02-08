import { useCallback, useMemo } from 'react'

import { Seat, SeatStatus } from '../../../core/types'
import { useEditorState } from '../../hooks/useEditorState'
import styles from './SeatProperties.module.scss'

const STATUS_OPTIONS: SeatStatus[] = ['available', 'reserved', 'sold', 'blocked']

const SeatProperties = () => {
  const seatMap = useEditorState((s) => s.seatMap)
  const selectedSeats = useEditorState((s) => s.selectedSeats)
  const updateSeat = useEditorState((s) => s.updateSeat)
  const updateSeats = useEditorState((s) => s.updateSeats)
  const batchUpdateSeats = useEditorState((s) => s.batchUpdateSeats)
  const deleteSeat = useEditorState((s) => s.deleteSeat)
  const deleteSeats = useEditorState((s) => s.deleteSeats)
  const clearSelection = useEditorState((s) => s.clearSelection)

  const categories = seatMap?.categories || []

  const selectedSeat = useMemo(() => {
    if (selectedSeats.length !== 1 || !seatMap) {
      return null
    }
    return seatMap.seats.find((s) => s.id === selectedSeats[0]) || null
  }, [selectedSeats, seatMap])

  const selectedSeatObjects = useMemo(() => {
    if (!seatMap || selectedSeats.length < 2) {
      return []
    }
    const idSet = new Set(selectedSeats)
    return seatMap.seats.filter((s) => idSet.has(s.id))
  }, [seatMap, selectedSeats])

  // --- Alignment handlers ---
  const handleAlignLeft = useCallback(() => {
    if (selectedSeatObjects.length < 2) {
      return
    }
    const minX = Math.min(...selectedSeatObjects.map((s) => s.x))
    const updates = selectedSeatObjects.filter((s) => s.x !== minX).map((s) => ({ id: s.id, updates: { x: minX } }))
    if (updates.length > 0) {
      batchUpdateSeats(updates)
    }
  }, [selectedSeatObjects, batchUpdateSeats])

  const handleAlignRight = useCallback(() => {
    if (selectedSeatObjects.length < 2) {
      return
    }
    const maxRight = Math.max(...selectedSeatObjects.map((s) => s.x + s.w))
    const updates = selectedSeatObjects
      .filter((s) => s.x + s.w !== maxRight)
      .map((s) => ({ id: s.id, updates: { x: maxRight - s.w } }))
    if (updates.length > 0) {
      batchUpdateSeats(updates)
    }
  }, [selectedSeatObjects, batchUpdateSeats])

  const handleAlignTop = useCallback(() => {
    if (selectedSeatObjects.length < 2) {
      return
    }
    const minY = Math.min(...selectedSeatObjects.map((s) => s.y))
    const updates = selectedSeatObjects.filter((s) => s.y !== minY).map((s) => ({ id: s.id, updates: { y: minY } }))
    if (updates.length > 0) {
      batchUpdateSeats(updates)
    }
  }, [selectedSeatObjects, batchUpdateSeats])

  const handleAlignBottom = useCallback(() => {
    if (selectedSeatObjects.length < 2) {
      return
    }
    const maxBottom = Math.max(...selectedSeatObjects.map((s) => s.y + s.h))
    const updates = selectedSeatObjects
      .filter((s) => s.y + s.h !== maxBottom)
      .map((s) => ({ id: s.id, updates: { y: maxBottom - s.h } }))
    if (updates.length > 0) {
      batchUpdateSeats(updates)
    }
  }, [selectedSeatObjects, batchUpdateSeats])

  const handleCenterHorizontal = useCallback(() => {
    if (selectedSeatObjects.length < 2) {
      return
    }
    const avgCenterX = selectedSeatObjects.reduce((sum, s) => sum + s.x + s.w / 2, 0) / selectedSeatObjects.length
    const updates = selectedSeatObjects.map((s) => ({
      id: s.id,
      updates: { x: avgCenterX - s.w / 2 },
    }))
    batchUpdateSeats(updates)
  }, [selectedSeatObjects, batchUpdateSeats])

  const handleCenterVertical = useCallback(() => {
    if (selectedSeatObjects.length < 2) {
      return
    }
    const avgCenterY = selectedSeatObjects.reduce((sum, s) => sum + s.y + s.h / 2, 0) / selectedSeatObjects.length
    const updates = selectedSeatObjects.map((s) => ({
      id: s.id,
      updates: { y: avgCenterY - s.h / 2 },
    }))
    batchUpdateSeats(updates)
  }, [selectedSeatObjects, batchUpdateSeats])

  // --- Distribution handlers ---
  const handleDistributeHorizontal = useCallback(() => {
    if (selectedSeatObjects.length < 3) {
      return
    }
    const sorted = [...selectedSeatObjects].sort((a, b) => a.x - b.x)
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const totalSpan = last.x + last.w - first.x
    const totalSeatWidth = sorted.reduce((sum, s) => sum + s.w, 0)
    const gap = (totalSpan - totalSeatWidth) / (sorted.length - 1)
    let currentX = first.x
    const updates: Array<{ id: string; updates: Partial<Seat> }> = []
    for (const seat of sorted) {
      if (seat.x !== currentX) {
        updates.push({ id: seat.id, updates: { x: currentX } })
      }
      currentX += seat.w + gap
    }
    if (updates.length > 0) {
      batchUpdateSeats(updates)
    }
  }, [selectedSeatObjects, batchUpdateSeats])

  const handleDistributeVertical = useCallback(() => {
    if (selectedSeatObjects.length < 3) {
      return
    }
    const sorted = [...selectedSeatObjects].sort((a, b) => a.y - b.y)
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const totalSpan = last.y + last.h - first.y
    const totalSeatHeight = sorted.reduce((sum, s) => sum + s.h, 0)
    const gap = (totalSpan - totalSeatHeight) / (sorted.length - 1)
    let currentY = first.y
    const updates: Array<{ id: string; updates: Partial<Seat> }> = []
    for (const seat of sorted) {
      if (seat.y !== currentY) {
        updates.push({ id: seat.id, updates: { y: currentY } })
      }
      currentY += seat.h + gap
    }
    if (updates.length > 0) {
      batchUpdateSeats(updates)
    }
  }, [selectedSeatObjects, batchUpdateSeats])

  // --- Bulk size handlers ---
  const handleBulkWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value)
      if (value >= 0.005 && value <= 0.5 && selectedSeats.length > 1) {
        updateSeats(selectedSeats, { w: value })
      }
    },
    [selectedSeats, updateSeats],
  )

  const handleBulkHeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value)
      if (value >= 0.005 && value <= 0.5 && selectedSeats.length > 1) {
        updateSeats(selectedSeats, { h: value })
      }
    },
    [selectedSeats, updateSeats],
  )

  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (selectedSeat) {
        updateSeat(selectedSeat.id, { label: e.target.value })
      }
    },
    [selectedSeat, updateSeat],
  )

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (selectedSeat) {
        updateSeat(selectedSeat.id, { status: e.target.value as SeatStatus })
      }
    },
    [selectedSeat, updateSeat],
  )

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const categoryId = e.target.value || undefined
      if (selectedSeats.length === 1 && selectedSeat) {
        updateSeat(selectedSeat.id, { categoryId })
      } else if (selectedSeats.length > 1) {
        updateSeats(selectedSeats, { categoryId })
      }
    },
    [selectedSeat, selectedSeats, updateSeat, updateSeats],
  )

  const handleBulkStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const status = e.target.value as SeatStatus
      if (selectedSeats.length > 1) {
        updateSeats(selectedSeats, { status })
      }
    },
    [selectedSeats, updateSeats],
  )

  const handleWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (selectedSeat) {
        const value = Number(e.target.value)
        if (value >= 0.005 && value <= 0.5) {
          updateSeat(selectedSeat.id, { w: value })
        }
      }
    },
    [selectedSeat, updateSeat],
  )

  const handleHeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (selectedSeat) {
        const value = Number(e.target.value)
        if (value >= 0.005 && value <= 0.5) {
          updateSeat(selectedSeat.id, { h: value })
        }
      }
    },
    [selectedSeat, updateSeat],
  )

  const handleDelete = useCallback(() => {
    if (selectedSeats.length > 1) {
      deleteSeats(selectedSeats)
    } else {
      selectedSeats.forEach((id) => deleteSeat(id))
    }
    clearSelection()
  }, [selectedSeats, deleteSeat, deleteSeats, clearSelection])

  if (selectedSeats.length === 0) {
    return (
      <div className={`${styles['seat-properties']} ${styles['seat-properties--empty']}`}>
        <p className={styles['seat-properties__empty']}>No seat selected</p>
      </div>
    )
  }

  if (selectedSeats.length > 1) {
    const commonCategoryId = (() => {
      if (!seatMap) {
        return ''
      }
      const selected = seatMap.seats.filter((s) => selectedSeats.includes(s.id))
      const firstCat = selected[0]?.categoryId || ''
      return selected.every((s) => (s.categoryId || '') === firstCat) ? firstCat : ''
    })()

    return (
      <div className={styles['seat-properties']}>
        <h3 className={styles['seat-properties__title']}>{selectedSeats.length} Seats Selected</h3>

        {categories.length > 0 && (
          <div className={styles['seat-properties__field']}>
            <label htmlFor="bulk-category" className={styles['seat-properties__label']}>
              Category
            </label>
            <select
              id="bulk-category"
              value={commonCategoryId}
              onChange={handleCategoryChange}
              className={styles['seat-properties__select']}
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles['seat-properties__field']}>
          <label htmlFor="bulk-status" className={styles['seat-properties__label']}>
            Status
          </label>
          <select
            id="bulk-status"
            onChange={handleBulkStatusChange}
            className={styles['seat-properties__select']}
            defaultValue=""
          >
            <option value="" disabled>
              Set status...
            </option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles['seat-properties__section']}>
          <span className={styles['seat-properties__section-title']}>Align</span>
          <div className={styles['seat-properties__toolbar']}>
            <button
              className={styles['seat-properties__toolbar-btn']}
              onClick={handleAlignLeft}
              title="Align Left"
              type="button"
            >
              ⫷ Left
            </button>
            <button
              className={styles['seat-properties__toolbar-btn']}
              onClick={handleCenterHorizontal}
              title="Center Horizontal"
              type="button"
            >
              ⫿ Center H
            </button>
            <button
              className={styles['seat-properties__toolbar-btn']}
              onClick={handleAlignRight}
              title="Align Right"
              type="button"
            >
              ⫸ Right
            </button>
            <button
              className={styles['seat-properties__toolbar-btn']}
              onClick={handleAlignTop}
              title="Align Top"
              type="button"
            >
              ⫠ Top
            </button>
            <button
              className={styles['seat-properties__toolbar-btn']}
              onClick={handleCenterVertical}
              title="Center Vertical"
              type="button"
            >
              ⫿ Center V
            </button>
            <button
              className={styles['seat-properties__toolbar-btn']}
              onClick={handleAlignBottom}
              title="Align Bottom"
              type="button"
            >
              ⫡ Bottom
            </button>
          </div>
        </div>

        <div className={styles['seat-properties__section']}>
          <span className={styles['seat-properties__section-title']}>Distribute</span>
          <div className={styles['seat-properties__toolbar']}>
            <button
              className={styles['seat-properties__toolbar-btn']}
              onClick={handleDistributeHorizontal}
              title="Distribute Horizontal (needs 3+ seats)"
              type="button"
              disabled={selectedSeats.length < 3}
            >
              ↔ Horizontal
            </button>
            <button
              className={styles['seat-properties__toolbar-btn']}
              onClick={handleDistributeVertical}
              title="Distribute Vertical (needs 3+ seats)"
              type="button"
              disabled={selectedSeats.length < 3}
            >
              ↕ Vertical
            </button>
          </div>
        </div>

        <div className={styles['seat-properties__section']}>
          <span className={styles['seat-properties__section-title']}>Size</span>
          <div className={styles['seat-properties__row']}>
            <div className={styles['seat-properties__field']}>
              <label htmlFor="bulk-width" className={styles['seat-properties__label']}>
                Width
              </label>
              <input
                id="bulk-width"
                type="number"
                min={0.005}
                max={0.5}
                step={0.005}
                onChange={handleBulkWidthChange}
                className={styles['seat-properties__input']}
                placeholder="W"
              />
            </div>
            <div className={styles['seat-properties__field']}>
              <label htmlFor="bulk-height" className={styles['seat-properties__label']}>
                Height
              </label>
              <input
                id="bulk-height"
                type="number"
                min={0.005}
                max={0.5}
                step={0.005}
                onChange={handleBulkHeightChange}
                className={styles['seat-properties__input']}
                placeholder="H"
              />
            </div>
          </div>
        </div>

        <button className={styles['seat-properties__delete']} onClick={handleDelete} type="button">
          Delete Selected ({selectedSeats.length})
        </button>
      </div>
    )
  }

  if (!selectedSeat) {
    return null
  }

  const currentCategory = categories.find((c) => c.id === selectedSeat.categoryId)

  return (
    <div className={styles['seat-properties']}>
      <h3 className={styles['seat-properties__title']}>Seat Properties</h3>

      <div className={styles['seat-properties__field']}>
        <label htmlFor="seat-label" className={styles['seat-properties__label']}>
          Label
        </label>
        <input
          id="seat-label"
          type="text"
          value={selectedSeat.label}
          onChange={handleLabelChange}
          className={styles['seat-properties__input']}
          maxLength={20}
        />
      </div>

      <div className={styles['seat-properties__field']}>
        <label htmlFor="seat-status" className={styles['seat-properties__label']}>
          Status
        </label>
        <select
          id="seat-status"
          value={selectedSeat.status || 'available'}
          onChange={handleStatusChange}
          className={styles['seat-properties__select']}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {categories.length > 0 && (
        <div className={styles['seat-properties__field']}>
          <label htmlFor="seat-category" className={styles['seat-properties__label']}>
            Category
          </label>
          <div className={styles['seat-properties__category-field']}>
            <select
              id="seat-category"
              value={selectedSeat.categoryId || ''}
              onChange={handleCategoryChange}
              className={styles['seat-properties__select']}
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {currentCategory && (
              <span
                className={styles['seat-properties__category-swatch']}
                style={{
                  backgroundColor: currentCategory.color,
                  borderColor: currentCategory.borderColor || currentCategory.color,
                }}
              />
            )}
          </div>
        </div>
      )}

      <div className={styles['seat-properties__field']}>
        <span className={styles['seat-properties__label']}>Position</span>
        <span className={styles['seat-properties__value']}>
          x: {selectedSeat.x.toFixed(4)}, y: {selectedSeat.y.toFixed(4)}
        </span>
      </div>

      {selectedSeat.row !== undefined && (
        <div className={styles['seat-properties__field']}>
          <span className={styles['seat-properties__label']}>Row / Column</span>
          <span className={styles['seat-properties__value']}>
            Row {selectedSeat.row}, Col {selectedSeat.column ?? '-'}
          </span>
        </div>
      )}

      <div className={styles['seat-properties__row']}>
        <div className={styles['seat-properties__field']}>
          <label htmlFor="seat-width" className={styles['seat-properties__label']}>
            Width
          </label>
          <input
            id="seat-width"
            type="number"
            min={0.005}
            max={0.5}
            step={0.005}
            value={selectedSeat.w}
            onChange={handleWidthChange}
            className={styles['seat-properties__input']}
          />
        </div>
        <div className={styles['seat-properties__field']}>
          <label htmlFor="seat-height" className={styles['seat-properties__label']}>
            Height
          </label>
          <input
            id="seat-height"
            type="number"
            min={0.005}
            max={0.5}
            step={0.005}
            value={selectedSeat.h}
            onChange={handleHeightChange}
            className={styles['seat-properties__input']}
          />
        </div>
      </div>

      <button className={styles['seat-properties__delete']} onClick={handleDelete} type="button">
        Delete Seat
      </button>
    </div>
  )
}

export default SeatProperties
