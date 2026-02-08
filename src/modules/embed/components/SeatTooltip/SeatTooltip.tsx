import { useMemo } from 'react'

import { Seat, SeatCategory, Zone } from '../../../core/types'
import styles from './SeatTooltip.module.scss'

interface SeatTooltipProps {
  seat: Seat | null
  position: { x: number; y: number }
  visible: boolean
  category?: SeatCategory | null
  zone?: Zone | null
}

const SeatTooltip = ({ seat, position, visible, category, zone }: SeatTooltipProps) => {
  const style = useMemo(
    () => ({
      left: position.x + 10,
      top: position.y - 40,
      opacity: visible && seat ? 1 : 0,
      pointerEvents: 'none' as const,
    }),
    [position, visible, seat],
  )

  if (!seat) {
    return null
  }

  const status = seat.status || 'available'

  return (
    <div className={styles['seat-tooltip']} style={style}>
      <div className={styles['seat-tooltip__header']}>
        {category && <span className={styles['seat-tooltip__swatch']} style={{ backgroundColor: category.color }} />}
        <span className={styles['seat-tooltip__label']}>{seat.label}</span>
        <span className={`${styles['seat-tooltip__status']} ${styles[`seat-tooltip__status--${status}`]}`}>
          {status}
        </span>
      </div>
      {(category || zone || seat.row !== undefined) && (
        <div className={styles['seat-tooltip__details']}>
          {category && <span className={styles['seat-tooltip__detail']}>{category.name}</span>}
          {zone && <span className={styles['seat-tooltip__detail']}>{zone.name}</span>}
          {seat.row !== undefined && <span className={styles['seat-tooltip__detail']}>Row {seat.row}</span>}
          {(category?.price !== undefined || zone?.price !== undefined) && (
            <span className={styles['seat-tooltip__price']}>${category?.price ?? zone?.price}</span>
          )}
        </div>
      )}
    </div>
  )
}

export default SeatTooltip
