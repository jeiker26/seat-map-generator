import { useCallback, useMemo, useState } from 'react'

import {
  DEFAULT_AISLE_WIDTH,
  DEFAULT_CATEGORIES,
  DEFAULT_COLUMN_LABELS,
  DEFAULT_SEAT_SIZE,
} from '../../../core/constants'
import { Seat, SeatCategory } from '../../../core/types'
import { useEditorState } from '../../hooks/useEditorState'
import styles from './GridGenerator.module.scss'

interface GridGeneratorProps {
  isOpen: boolean
  onClose: () => void
}

const LAYOUT_PRESETS = [
  { label: 'Custom', value: '' },
  { label: '2-2 (Small aircraft)', value: '2-2' },
  { label: '3-3 (Narrow body)', value: '3-3' },
  { label: '2-4-2 (Wide body)', value: '2-4-2' },
  { label: '3-4-3 (Wide body)', value: '3-4-3' },
  { label: '2-2 (Theater)', value: '2-2' },
  { label: '4-4 (Stadium)', value: '4-4' },
  { label: '3-6-3 (Large venue)', value: '3-6-3' },
]

const parseLayoutPattern = (pattern: string): number[] => {
  if (!pattern.trim()) {
    return []
  }
  return pattern
    .split('-')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0)
}

const GridGenerator = ({ isOpen, onClose }: GridGeneratorProps) => {
  const addSeats = useEditorState((s) => s.addSeats)
  const seatMap = useEditorState((s) => s.seatMap)
  const setSeatMap = useEditorState((s) => s.setSeatMap)
  const seatMapCategories = seatMap?.categories

  const [rows, setRows] = useState(10)
  const [layoutPattern, setLayoutPattern] = useState('3-3')
  const [_customCols, _setCustomCols] = useState(6)
  const [startX, setStartX] = useState(0.1)
  const [startY, setStartY] = useState(0.1)
  const [spacingX, setSpacingX] = useState(0.03)
  const [spacingY, setSpacingY] = useState(0.04)
  const [startRowNumber, setStartRowNumber] = useState(1)
  const [skipRow13, setSkipRow13] = useState(false)
  const [seatWidth, setSeatWidth] = useState(DEFAULT_SEAT_SIZE.w)
  const [seatHeight, setSeatHeight] = useState(DEFAULT_SEAT_SIZE.h)
  const [aisleWidth, setAisleWidth] = useState(DEFAULT_AISLE_WIDTH)
  const [selectedCategoryId, setSelectedCategoryId] = useState('standard')
  const [firstRowCategoryId, setFirstRowCategoryId] = useState('')
  const [addRowNumbers, setAddRowNumbers] = useState(true)
  const [addColumnHeaders, setAddColumnHeaders] = useState(true)

  const groups = useMemo(() => {
    const parsed = parseLayoutPattern(layoutPattern)
    return parsed.length > 0 ? parsed : [_customCols]
  }, [layoutPattern, _customCols])

  const totalCols = useMemo(() => groups.reduce((sum, g) => sum + g, 0), [groups])

  const columnLabels = useMemo(() => {
    return DEFAULT_COLUMN_LABELS.slice(0, totalCols)
  }, [totalCols])

  const totalSeats = rows * totalCols

  const categories: SeatCategory[] = useMemo(() => {
    return seatMapCategories && seatMapCategories.length > 0 ? seatMapCategories : DEFAULT_CATEGORIES
  }, [seatMapCategories])

  const handlePresetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setLayoutPattern(value)
  }, [])

  const handleGenerate = useCallback(() => {
    const seats: Seat[] = []
    let currentRowNumber = startRowNumber

    for (let row = 0; row < rows; row++) {
      if (skipRow13 && currentRowNumber === 13) {
        currentRowNumber++
      }

      let colIndex = 0
      let currentX = startX

      for (let groupIdx = 0; groupIdx < groups.length; groupIdx++) {
        if (groupIdx > 0) {
          currentX += aisleWidth
        }

        const groupSize = groups[groupIdx]
        for (let col = 0; col < groupSize; col++) {
          const colLabel = columnLabels[colIndex] || String(colIndex + 1)
          const isFirstRow = row === 0
          const categoryId = isFirstRow && firstRowCategoryId ? firstRowCategoryId : selectedCategoryId

          const seat: Seat = {
            id: crypto.randomUUID(),
            label: `${colLabel}${currentRowNumber}`,
            x: currentX + col * spacingX,
            y: startY + row * spacingY,
            w: seatWidth,
            h: seatHeight,
            row: currentRowNumber,
            column: colIndex,
            categoryId: categoryId || undefined,
            status: 'available',
          }
          seats.push(seat)
          colIndex++
        }

        currentX += groupSize * spacingX
      }

      currentRowNumber++
    }

    if (seatMap && (!seatMap.categories || seatMap.categories.length === 0)) {
      const usedCategoryIds = new Set<string>()
      if (selectedCategoryId) {
        usedCategoryIds.add(selectedCategoryId)
      }
      if (firstRowCategoryId) {
        usedCategoryIds.add(firstRowCategoryId)
      }
      const categoriesToAdd = DEFAULT_CATEGORIES.filter((c) => usedCategoryIds.has(c.id))
      if (categoriesToAdd.length > 0) {
        const updatedMap = {
          ...seatMap,
          categories: categoriesToAdd,
          gridConfig: {
            ...seatMap.gridConfig,
            columnLabels: columnLabels,
            aisleAfterColumns: groups.slice(0, -1).reduce<number[]>((acc, groupSize, idx) => {
              const prevTotal = groups.slice(0, idx + 1).reduce((s, g) => s + g, 0)
              acc.push(prevTotal - 1)
              return acc
            }, []),
            aisleWidth,
            rowNumbersVisible: addRowNumbers,
            columnHeadersVisible: addColumnHeaders,
          },
          settings: {
            ...(seatMap.settings || { allowMultiSelect: true, showLabels: true }),
            showRowNumbers: addRowNumbers,
            showColumnHeaders: addColumnHeaders,
            showLegend: true,
          },
          updatedAt: new Date().toISOString(),
        }
        setSeatMap({ ...updatedMap, seats: [...updatedMap.seats, ...seats] })
        onClose()
        return
      }
    }

    addSeats(seats)
    onClose()
  }, [
    rows,
    groups,
    startX,
    startY,
    spacingX,
    spacingY,
    startRowNumber,
    skipRow13,
    seatWidth,
    seatHeight,
    aisleWidth,
    selectedCategoryId,
    firstRowCategoryId,
    columnLabels,
    addRowNumbers,
    addColumnHeaders,
    addSeats,
    seatMap,
    setSeatMap,
    onClose,
  ])

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

        <div className={styles['grid-generator__section']}>
          <h4 className={styles['grid-generator__subtitle']}>Layout</h4>

          <div className={styles['grid-generator__row']}>
            <div className={styles['grid-generator__field']}>
              <label htmlFor="grid-preset">Layout Preset</label>
              <select
                id="grid-preset"
                value={layoutPattern}
                onChange={handlePresetChange}
                className={styles['grid-generator__select']}
              >
                {LAYOUT_PRESETS.map((preset) => (
                  <option key={`${preset.label}-${preset.value}`} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles['grid-generator__field']}>
              <label htmlFor="grid-pattern">Column Pattern</label>
              <input
                id="grid-pattern"
                type="text"
                value={layoutPattern}
                onChange={(e) => setLayoutPattern(e.target.value)}
                placeholder="e.g. 3-3 or 2-4-2"
              />
            </div>
          </div>

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
              <label htmlFor="grid-total">Total Seats</label>
              <input id="grid-total" type="text" value={totalSeats} disabled />
            </div>
          </div>

          <div className={styles['grid-generator__row']}>
            <div className={styles['grid-generator__field']}>
              <label htmlFor="grid-start-row">Start Row Number</label>
              <input
                id="grid-start-row"
                type="number"
                min={1}
                max={100}
                value={startRowNumber}
                onChange={(e) => setStartRowNumber(Number(e.target.value))}
              />
            </div>
            <div className={styles['grid-generator__field']}>
              <label htmlFor="grid-skip-13" className={styles['grid-generator__checkbox-label']}>
                <input
                  id="grid-skip-13"
                  type="checkbox"
                  checked={skipRow13}
                  onChange={(e) => setSkipRow13(e.target.checked)}
                />
                Skip row 13
              </label>
            </div>
          </div>
        </div>

        <div className={styles['grid-generator__section']}>
          <h4 className={styles['grid-generator__subtitle']}>Position & Spacing</h4>

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

          <div className={styles['grid-generator__row']}>
            <div className={styles['grid-generator__field']}>
              <label htmlFor="grid-seat-width">Seat Width</label>
              <input
                id="grid-seat-width"
                type="number"
                min={0.005}
                max={0.5}
                step={0.005}
                value={seatWidth}
                onChange={(e) => setSeatWidth(Number(e.target.value))}
              />
            </div>
            <div className={styles['grid-generator__field']}>
              <label htmlFor="grid-seat-height">Seat Height</label>
              <input
                id="grid-seat-height"
                type="number"
                min={0.005}
                max={0.5}
                step={0.005}
                value={seatHeight}
                onChange={(e) => setSeatHeight(Number(e.target.value))}
              />
            </div>
          </div>

          <div className={styles['grid-generator__row']}>
            <div className={styles['grid-generator__field']}>
              <label htmlFor="grid-aisle-width">Aisle Width</label>
              <input
                id="grid-aisle-width"
                type="number"
                min={0.01}
                max={0.2}
                step={0.005}
                value={aisleWidth}
                onChange={(e) => setAisleWidth(Number(e.target.value))}
              />
            </div>
            <div className={styles['grid-generator__field']} />
          </div>
        </div>

        <div className={styles['grid-generator__section']}>
          <h4 className={styles['grid-generator__subtitle']}>Categories</h4>

          <div className={styles['grid-generator__row']}>
            <div className={styles['grid-generator__field']}>
              <label htmlFor="grid-category">Default Category</label>
              <select
                id="grid-category"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className={styles['grid-generator__select']}
              >
                <option value="">None</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles['grid-generator__field']}>
              <label htmlFor="grid-first-row-category">First Row Category</label>
              <select
                id="grid-first-row-category"
                value={firstRowCategoryId}
                onChange={(e) => setFirstRowCategoryId(e.target.value)}
                className={styles['grid-generator__select']}
              >
                <option value="">Same as default</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles['grid-generator__section']}>
          <h4 className={styles['grid-generator__subtitle']}>Labels</h4>

          <div className={styles['grid-generator__row']}>
            <div className={styles['grid-generator__field']}>
              <label htmlFor="grid-row-numbers" className={styles['grid-generator__checkbox-label']}>
                <input
                  id="grid-row-numbers"
                  type="checkbox"
                  checked={addRowNumbers}
                  onChange={(e) => setAddRowNumbers(e.target.checked)}
                />
                Show row numbers
              </label>
            </div>
            <div className={styles['grid-generator__field']}>
              <label htmlFor="grid-col-headers" className={styles['grid-generator__checkbox-label']}>
                <input
                  id="grid-col-headers"
                  type="checkbox"
                  checked={addColumnHeaders}
                  onChange={(e) => setAddColumnHeaders(e.target.checked)}
                />
                Show column headers
              </label>
            </div>
          </div>
        </div>

        <div className={styles['grid-generator__preview']}>
          <span className={styles['grid-generator__preview-label']}>Layout Preview:</span>
          <span className={styles['grid-generator__preview-pattern']}>
            {groups.join(' - ')} ({totalCols} columns x {rows} rows = {totalSeats} seats)
          </span>
        </div>

        <div className={styles['grid-generator__actions']}>
          <button className={styles['grid-generator__btn--cancel']} onClick={onClose} type="button">
            Cancel
          </button>
          <button className={styles['grid-generator__btn--generate']} onClick={handleGenerate} type="button">
            Generate {totalSeats} Seats
          </button>
        </div>
      </div>
    </div>
  )
}

export default GridGenerator
