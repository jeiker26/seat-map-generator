import { useCallback, useState } from 'react'

import { Seat } from '../../../core/types'
import { useEditorState } from '../../hooks/useEditorState'
import styles from './GridGenerator.module.scss'

interface GridGeneratorProps {
  isOpen: boolean
  onClose: () => void
}

const GridGenerator = ({ isOpen, onClose }: GridGeneratorProps) => {
  const addSeat = useEditorState((s) => s.addSeat)

  const [rows, setRows] = useState(5)
  const [cols, setCols] = useState(10)
  const [startX, setStartX] = useState(0.1)
  const [startY, setStartY] = useState(0.1)
  const [spacingX, setSpacingX] = useState(0.03)
  const [spacingY, setSpacingY] = useState(0.04)
  const [rowPrefix, setRowPrefix] = useState('A')

  const generateRowLabel = useCallback((index: number, prefix: string): string => {
    const charCode = prefix.charCodeAt(0) + index
    return String.fromCharCode(charCode)
  }, [])

  const handleGenerate = useCallback(() => {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const rowLabel = generateRowLabel(row, rowPrefix)
        const seat: Seat = {
          id: crypto.randomUUID(),
          label: `${rowLabel}${col + 1}`,
          x: startX + col * spacingX,
          y: startY + row * spacingY,
          w: 0.02,
          h: 0.02,
          status: 'available',
        }
        addSeat(seat)
      }
    }
    onClose()
  }, [rows, cols, startX, startY, spacingX, spacingY, rowPrefix, addSeat, onClose, generateRowLabel])

  if (!isOpen) {
    return null
  }

  return (
    <div className={styles['grid-generator__overlay']} onClick={onClose} role="presentation">
      <div
        className={styles['grid-generator']}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Grid Generator"
      >
        <h3 className={styles['grid-generator__title']}>Grid Generator</h3>

        <div className={styles['grid-generator__row']}>
          <div className={styles['grid-generator__field']}>
            <label htmlFor="grid-rows">Rows</label>
            <input
              id="grid-rows"
              type="number"
              min={1}
              max={50}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
            />
          </div>
          <div className={styles['grid-generator__field']}>
            <label htmlFor="grid-cols">Columns</label>
            <input
              id="grid-cols"
              type="number"
              min={1}
              max={100}
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
            />
          </div>
        </div>

        <div className={styles['grid-generator__row']}>
          <div className={styles['grid-generator__field']}>
            <label htmlFor="grid-prefix">Row Prefix</label>
            <input
              id="grid-prefix"
              type="text"
              maxLength={1}
              value={rowPrefix}
              onChange={(e) => setRowPrefix(e.target.value.toUpperCase())}
            />
          </div>
          <div className={styles['grid-generator__field']}>
            <label htmlFor="grid-total">Total Seats</label>
            <input id="grid-total" type="text" value={rows * cols} disabled />
          </div>
        </div>

        <div className={styles['grid-generator__row']}>
          <div className={styles['grid-generator__field']}>
            <label htmlFor="grid-start-x">Start X</label>
            <input
              id="grid-start-x"
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={startX}
              onChange={(e) => setStartX(Number(e.target.value))}
            />
          </div>
          <div className={styles['grid-generator__field']}>
            <label htmlFor="grid-start-y">Start Y</label>
            <input
              id="grid-start-y"
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={startY}
              onChange={(e) => setStartY(Number(e.target.value))}
            />
          </div>
        </div>

        <div className={styles['grid-generator__row']}>
          <div className={styles['grid-generator__field']}>
            <label htmlFor="grid-spacing-x">Spacing X</label>
            <input
              id="grid-spacing-x"
              type="number"
              min={0.01}
              max={0.2}
              step={0.005}
              value={spacingX}
              onChange={(e) => setSpacingX(Number(e.target.value))}
            />
          </div>
          <div className={styles['grid-generator__field']}>
            <label htmlFor="grid-spacing-y">Spacing Y</label>
            <input
              id="grid-spacing-y"
              type="number"
              min={0.01}
              max={0.2}
              step={0.005}
              value={spacingY}
              onChange={(e) => setSpacingY(Number(e.target.value))}
            />
          </div>
        </div>

        <div className={styles['grid-generator__actions']}>
          <button className={styles['grid-generator__btn--cancel']} onClick={onClose} type="button">
            Cancel
          </button>
          <button className={styles['grid-generator__btn--generate']} onClick={handleGenerate} type="button">
            Generate {rows * cols} Seats
          </button>
        </div>
      </div>
    </div>
  )
}

export default GridGenerator
