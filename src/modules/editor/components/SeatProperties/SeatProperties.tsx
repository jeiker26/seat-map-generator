import { useCallback, useMemo } from 'react'

import { SeatStatus } from '../../../core/types'
import { useEditorState } from '../../hooks/useEditorState'
import styles from './SeatProperties.module.scss'

const STATUS_OPTIONS: SeatStatus[] = ['available', 'reserved', 'sold', 'blocked']

const SeatProperties = () => {
  const seatMap = useEditorState((s) => s.seatMap)
  const selectedSeats = useEditorState((s) => s.selectedSeats)
  const updateSeat = useEditorState((s) => s.updateSeat)
  const updateSeats = useEditorState((s) => s.updateSeats)
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
      <div className={styles['seat-properties']}>
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
