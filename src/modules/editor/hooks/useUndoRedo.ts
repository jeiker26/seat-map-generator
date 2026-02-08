import { useCallback } from 'react'

import { useEditorState } from './useEditorState'

export const useUndoRedo = () => {
  const undo = useEditorState((state) => state.undo)
  const redo = useEditorState((state) => state.redo)
  const canUndo = useEditorState((state) => state.canUndo)
  const canRedo = useEditorState((state) => state.canRedo)

  return {
    undo: useCallback(() => undo(), [undo]),
    redo: useCallback(() => redo(), [redo]),
    canUndo: canUndo(),
    canRedo: canRedo(),
  }
}
