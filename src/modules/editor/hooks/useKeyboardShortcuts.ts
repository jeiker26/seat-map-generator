import { useCallback, useEffect } from 'react'

import { useEditorState } from './useEditorState'

export const OPEN_CATEGORIES_EVENT = 'editor:openCategories'

export const useKeyboardShortcuts = () => {
  const undo = useEditorState((state) => state.undo)
  const redo = useEditorState((state) => state.redo)
  const deleteSeat = useEditorState((state) => state.deleteSeat)
  const selectedSeats = useEditorState((state) => state.selectedSeats)
  const clearSelection = useEditorState((state) => state.clearSelection)
  const setActiveTool = useEditorState((state) => state.setActiveTool)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey
      const target = e.target as HTMLElement

      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      if (isCtrlOrMeta && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        redo()
        return
      }

      if (isCtrlOrMeta && e.key === 'z') {
        e.preventDefault()
        undo()
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        selectedSeats.forEach((id) => deleteSeat(id))
        return
      }

      if (e.key === 'Escape') {
        clearSelection()
        setActiveTool('select')
        return
      }

      if (!isCtrlOrMeta) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault()
            setActiveTool('select')
            break
          case 'a':
            e.preventDefault()
            setActiveTool('add')
            break
          case 'p':
            e.preventDefault()
            setActiveTool('pan')
            break
          case 'g':
            e.preventDefault()
            setActiveTool('grid')
            break
          case 'c':
            e.preventDefault()
            window.dispatchEvent(new CustomEvent(OPEN_CATEGORIES_EVENT))
            break
        }
      }
    },
    [undo, redo, deleteSeat, selectedSeats, clearSelection, setActiveTool],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
