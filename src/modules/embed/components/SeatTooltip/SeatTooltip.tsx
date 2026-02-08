import { useMemo } from 'react'

import { Seat } from '../../../core/types'
import styles from './SeatTooltip.module.scss'

interface SeatTooltipProps {
  seat: Seat | null
  position: { x: number; y: number }
  visible: boolean
}

const SeatTooltip = ({ seat, position, visible }: SeatTooltipProps) => {
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

  return (
    <div className={styles['seat-tooltip']} style={style}>
      <span className={styles['seat-tooltip__label']}>{seat.label}</span>
      <span className={styles['seat-tooltip__status']}>{seat.status || 'available'}</span>
    </div>
  )
}

export default SeatTooltip
