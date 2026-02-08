import { useCallback, useEffect } from 'react'

import { useEditorState } from './useEditorState'

export const OPEN_CATEGORIES_EVENT = 'editor:openCategories'
export const OPEN_HELP_EVENT = 'editor:openHelp'

export const useKeyboardShortcuts = () => {
  const undo = useEditorState((state) => state.undo)
  const redo = useEditorState((state) => state.redo)
  const seatMap = useEditorState((state) => state.seatMap)
  const deleteSeats = useEditorState((state) => state.deleteSeats)
  const addSeats = useEditorState((state) => state.addSeats)
  const moveSeats = useEditorState((state) => state.moveSeats)
  const selectedSeats = useEditorState((state) => state.selectedSeats)
  const selectSeats = useEditorState((state) => state.selectSeats)
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

      if (isCtrlOrMeta && e.key === 'a') {
        e.preventDefault()
        if (seatMap) {
          selectSeats(seatMap.seats.map((s) => s.id))
        }
        return
      }

      if (isCtrlOrMeta && e.key === 'd') {
        e.preventDefault()
        if (seatMap && selectedSeats.length > 0) {
          const selectedSet = new Set(selectedSeats)
          const seatsToDuplicate = seatMap.seats.filter((s) => selectedSet.has(s.id))
          const duplicated = seatsToDuplicate.map((s) => ({
            ...s,
            id: crypto.randomUUID(),
            x: s.x + 0.02,
            label: `${s.label}_copy`,
          }))
          addSeats(duplicated)
          selectSeats(duplicated.map((s) => s.id))
        }
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteSeats(selectedSeats)
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

      if (e.key === '?') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent(OPEN_HELP_EVENT))
      }

      if (selectedSeats.length > 0) {
        const NUDGE_STEP = 0.002
        const NUDGE_STEP_LARGE = 0.01
        const step = e.shiftKey ? NUDGE_STEP_LARGE : NUDGE_STEP

        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault()
            moveSeats(selectedSeats, 0, -step)
            break
          case 'ArrowDown':
            e.preventDefault()
            moveSeats(selectedSeats, 0, step)
            break
          case 'ArrowLeft':
            e.preventDefault()
            moveSeats(selectedSeats, -step, 0)
            break
          case 'ArrowRight':
            e.preventDefault()
            moveSeats(selectedSeats, step, 0)
            break
        }
      }
    },
    [undo, redo, seatMap, deleteSeats, addSeats, moveSeats, selectedSeats, selectSeats, clearSelection, setActiveTool],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
