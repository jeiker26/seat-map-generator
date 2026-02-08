import { useCallback, useMemo, useState } from 'react'

import { DEFAULT_CATEGORIES } from '../../../core/constants'
import { SeatCategory } from '../../../core/types'
import { useEditorState } from '../../hooks/useEditorState'
import styles from './CategoryManager.module.scss'

interface CategoryManagerProps {
  isOpen: boolean
  onClose: () => void
}

const CategoryManager = ({ isOpen, onClose }: CategoryManagerProps) => {
  const seatMap = useEditorState((s) => s.seatMap)
  const addCategory = useEditorState((s) => s.addCategory)
  const updateCategory = useEditorState((s) => s.updateCategory)
  const deleteCategory = useEditorState((s) => s.deleteCategory)
  const setSeatMap = useEditorState((s) => s.setSeatMap)

  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#E8E8E8')
  const [newBorderColor, setNewBorderColor] = useState('#BDBDBD')
  const [newTextColor, setNewTextColor] = useState('#424242')
  const [editingId, setEditingId] = useState<string | null>(null)

  const seatMapCategories = seatMap?.categories
  const categories = useMemo(() => seatMapCategories || [], [seatMapCategories])

  const handleAddCategory = useCallback(() => {
    if (!newName.trim()) {
      return
    }

    const category: SeatCategory = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      color: newColor,
      borderColor: newBorderColor,
      textColor: newTextColor,
      order: categories.length,
    }

    addCategory(category)
    setNewName('')
    setNewColor('#E8E8E8')
    setNewBorderColor('#BDBDBD')
    setNewTextColor('#424242')
  }, [newName, newColor, newBorderColor, newTextColor, categories.length, addCategory])

  const handleLoadDefaults = useCallback(() => {
    if (!seatMap) {
      return
    }
    const existingIds = new Set(categories.map((c) => c.id))
    const newCategories = DEFAULT_CATEGORIES.filter((c) => !existingIds.has(c.id))
    if (newCategories.length > 0) {
      const updatedMap = {
        ...seatMap,
        categories: [...categories, ...newCategories],
        updatedAt: new Date().toISOString(),
      }
      setSeatMap(updatedMap)
    }
  }, [seatMap, categories, setSeatMap])

  const handleUpdateName = useCallback(
    (id: string, name: string) => {
      updateCategory(id, { name })
    },
    [updateCategory],
  )

  const handleUpdateColor = useCallback(
    (id: string, color: string) => {
      updateCategory(id, { color })
    },
    [updateCategory],
  )

  const handleUpdateBorderColor = useCallback(
    (id: string, borderColor: string) => {
      updateCategory(id, { borderColor })
    },
    [updateCategory],
  )

  const handleDelete = useCallback(
    (id: string) => {
      const seatsUsingCategory = seatMap?.seats.filter((s) => s.categoryId === id).length || 0
      if (seatsUsingCategory > 0) {
        const confirmed = window.confirm(
          `${seatsUsingCategory} seat(s) use this category. They will be unassigned. Continue?`,
        )
        if (!confirmed) {
          return
        }
      }
      deleteCategory(id)
      if (editingId === id) {
        setEditingId(null)
      }
    },
    [seatMap, deleteCategory, editingId],
  )

  if (!isOpen) {
    return null
  }

  return (
    <div className={styles['category-manager__overlay']} onClick={onClose} role="presentation">
      <div
        className={styles['category-manager']}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Category Manager"
      >
        <h3 className={styles['category-manager__title']}>Seat Categories</h3>

        <div className={styles['category-manager__list']}>
          {categories.length === 0 && <p className={styles['category-manager__empty']}>No categories defined yet.</p>}
          {categories.map((cat) => (
            <div key={cat.id} className={styles['category-manager__item']}>
              <span
                className={styles['category-manager__swatch']}
                style={{ backgroundColor: cat.color, borderColor: cat.borderColor || cat.color }}
              />
              {editingId === cat.id ? (
                <div className={styles['category-manager__edit-fields']}>
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => handleUpdateName(cat.id, e.target.value)}
                    className={styles['category-manager__input']}
                  />
                  <input
                    type="color"
                    value={cat.color}
                    onChange={(e) => handleUpdateColor(cat.id, e.target.value)}
                    className={styles['category-manager__color-input']}
                    title="Fill color"
                  />
                  <input
                    type="color"
                    value={cat.borderColor || cat.color}
                    onChange={(e) => handleUpdateBorderColor(cat.id, e.target.value)}
                    className={styles['category-manager__color-input']}
                    title="Border color"
                  />
                  <button
                    className={styles['category-manager__btn--small']}
                    onClick={() => setEditingId(null)}
                    type="button"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <span className={styles['category-manager__name']}>{cat.name}</span>
                  <div className={styles['category-manager__item-actions']}>
                    <button
                      className={styles['category-manager__btn--small']}
                      onClick={() => setEditingId(cat.id)}
                      type="button"
                      title="Edit category"
                    >
                      Edit
                    </button>
                    <button
                      className={`${styles['category-manager__btn--small']} ${styles['category-manager__btn--danger']}`}
                      onClick={() => handleDelete(cat.id)}
                      type="button"
                      title="Delete category"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className={styles['category-manager__add']}>
          <h4 className={styles['category-manager__subtitle']}>Add New Category</h4>
          <div className={styles['category-manager__add-row']}>
            <input
              type="text"
              placeholder="Category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={styles['category-manager__input']}
            />
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className={styles['category-manager__color-input']}
              title="Fill color"
            />
            <input
              type="color"
              value={newBorderColor}
              onChange={(e) => setNewBorderColor(e.target.value)}
              className={styles['category-manager__color-input']}
              title="Border color"
            />
            <input
              type="color"
              value={newTextColor}
              onChange={(e) => setNewTextColor(e.target.value)}
              className={styles['category-manager__color-input']}
              title="Text color"
            />
            <button
              className={styles['category-manager__btn--add']}
              onClick={handleAddCategory}
              disabled={!newName.trim()}
              type="button"
            >
              Add
            </button>
          </div>
        </div>

        <div className={styles['category-manager__actions']}>
          <button className={styles['category-manager__btn--secondary']} onClick={handleLoadDefaults} type="button">
            Load Defaults
          </button>
          <button className={styles['category-manager__btn--primary']} onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default CategoryManager
