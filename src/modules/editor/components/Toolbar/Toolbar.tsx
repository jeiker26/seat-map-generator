import { useCallback, useRef } from 'react'

import { EditorTool } from '../../../core/types'
import { useEditorState } from '../../hooks/useEditorState'
import { useUndoRedo } from '../../hooks/useUndoRedo'
import styles from './Toolbar.module.scss'

const TOOLS: { id: EditorTool; label: string; shortcut: string }[] = [
  { id: 'select', label: 'Select', shortcut: 'S' },
  { id: 'add', label: 'Add Seat', shortcut: 'A' },
  { id: 'pan', label: 'Pan', shortcut: 'P' },
  { id: 'grid', label: 'Grid', shortcut: 'G' },
]

interface ToolbarProps {
  onExport?: () => void
  onImport?: (data: string) => void
}

const Toolbar = ({ onExport, onImport }: ToolbarProps) => {
  const activeTool = useEditorState((s) => s.activeTool)
  const setActiveTool = useEditorState((s) => s.setActiveTool)
  const { undo, redo, canUndo, canRedo } = useUndoRedo()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) {
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        if (onImport) {
          onImport(content)
        }
      }
      reader.readAsText(file)
      e.target.value = ''
    },
    [onImport],
  )

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbar__tools}>
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            className={`${styles.toolbar__btn} ${activeTool === tool.id ? styles['toolbar__btn--active'] : ''}`}
            onClick={() => setActiveTool(tool.id)}
            title={`${tool.label} (${tool.shortcut})`}
            type="button"
          >
            {tool.label}
          </button>
        ))}
      </div>

      <div className={styles.toolbar__separator} />

      <div className={styles.toolbar__actions}>
        <button
          className={styles.toolbar__btn}
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          type="button"
        >
          Undo
        </button>
        <button
          className={styles.toolbar__btn}
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          type="button"
        >
          Redo
        </button>
      </div>

      <div className={styles.toolbar__separator} />

      <div className={styles.toolbar__actions}>
        <button className={styles.toolbar__btn} onClick={onExport} title="Export JSON" type="button">
          Export
        </button>
        <button className={styles.toolbar__btn} onClick={handleImportClick} title="Import JSON" type="button">
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )
}

export default Toolbar
