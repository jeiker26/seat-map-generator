import { useMemo } from 'react'

import { SeatCategory } from '../../../core/types'
import styles from './Legend.module.scss'

interface LegendProps {
  categories: SeatCategory[]
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

const Legend = ({ categories, position = 'top-right' }: LegendProps) => {
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [categories])

  if (sortedCategories.length === 0) {
    return null
  }

  return (
    <div className={`${styles.legend} ${styles[`legend--${position}`]}`}>
      {sortedCategories.map((category) => (
        <div key={category.id} className={styles.legend__item}>
          <span
            className={styles.legend__swatch}
            style={{
              backgroundColor: category.color,
              borderColor: category.borderColor || category.color,
            }}
          />
          <span className={styles.legend__label}>{category.name}</span>
        </div>
      ))}
    </div>
  )
}

export default Legend
