import { useCallback, useMemo } from 'react'

import { SeatStatus } from '../../../core/types'
import { useEditorState } from '../../hooks/useEditorState'
import styles from './SeatProperties.module.scss'

const STATUS_OPTIONS: SeatStatus[] = ['available', 'reserved', 'sold', 'blocked']

const SeatProperties = () => {
  const seatMap = useEditorState((s) => s.seatMap)
  const selectedSeats = useEditorState((s) => s.selectedSeats)
  const updateSeat = useEditorState((s) => s.updateSeat)
  const deleteSeat = useEditorState((s) => s.deleteSeat)
  const clearSelection = useEditorState((s) => s.clearSelection)

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
    selectedSeats.forEach((id) => deleteSeat(id))
    clearSelection()
  }, [selectedSeats, deleteSeat, clearSelection])

  if (!selectedSeat) {
    return (
      <div className={styles['seat-properties']}>
        <p className={styles['seat-properties__empty']}>
          {selectedSeats.length > 1 ? `${selectedSeats.length} seats selected` : 'No seat selected'}
        </p>
        {selectedSeats.length > 1 && (
          <button className={styles['seat-properties__delete']} onClick={handleDelete} type="button">
            Delete Selected ({selectedSeats.length})
          </button>
        )}
      </div>
    )
  }

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

      <div className={styles['seat-properties__field']}>
        <span className={styles['seat-properties__label']}>Position</span>
        <span className={styles['seat-properties__value']}>
          x: {selectedSeat.x.toFixed(4)}, y: {selectedSeat.y.toFixed(4)}
        </span>
      </div>

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
