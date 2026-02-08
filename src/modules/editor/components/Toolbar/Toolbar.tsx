import { useCallback, useRef } from 'react'

import { EditorTool } from '../../../core/types'
import { useEditorState } from '../../hooks/useEditorState'
import { useUndoRedo } from '../../hooks/useUndoRedo'
import styles from './Toolbar.module.scss'

const TOOLS: { id: EditorTool; label: string; shortcut: string; icon: string }[] = [
  { id: 'select', label: 'Select', shortcut: 'S', icon: 'cursor' },
  { id: 'add', label: 'Add Seat', shortcut: 'A', icon: 'plus-square' },
  { id: 'pan', label: 'Pan', shortcut: 'P', icon: 'hand' },
  { id: 'grid', label: 'Grid', shortcut: 'G', icon: 'grid' },
]

const ToolIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case 'cursor':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
        </svg>
      )
    case 'plus-square':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      )
    case 'hand':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 11V6a2 2 0 0 0-4 0v1M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8" />
          <path d="M18 11a2 2 0 0 1 4 0v5a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 17" />
        </svg>
      )
    case 'grid':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    default:
      return null
  }
}

interface ToolbarProps {
  onExport?: () => void
  onImport?: (_data: string) => void
  onUploadBackground?: (_file: File) => void
  onRemoveBackground?: () => void
  onOpenCategories?: () => void
  onToggleBackgroundLock?: () => void
  onOpenHelp?: () => void
  hasBackground?: boolean
  isBackgroundLocked?: boolean
}

const Toolbar = ({
  onExport,
  onImport,
  onUploadBackground,
  onRemoveBackground,
  onOpenCategories,
  onToggleBackgroundLock,
  onOpenHelp,
  hasBackground = false,
  isBackgroundLocked = true,
}: ToolbarProps) => {
  const activeTool = useEditorState((s) => s.activeTool)
  const setActiveTool = useEditorState((s) => s.setActiveTool)
  const { undo, redo, canUndo, canRedo } = useUndoRedo()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bgInputRef = useRef<HTMLInputElement>(null)

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleUploadBgClick = useCallback(() => {
    bgInputRef.current?.click()
  }, [])

  const handleBgFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) {
        return
      }
      if (onUploadBackground) {
        onUploadBackground(file)
      }
      e.target.value = ''
    },
    [onUploadBackground],
  )

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
      <div className={styles.toolbar__group}>
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            className={`${styles.toolbar__btn} ${activeTool === tool.id ? styles['toolbar__btn--active'] : ''}`}
            onClick={() => setActiveTool(tool.id)}
            title={`${tool.label} (${tool.shortcut})`}
            type="button"
          >
            <ToolIcon icon={tool.icon} />
          </button>
        ))}
      </div>

      <div className={styles.toolbar__divider} />

      <div className={styles.toolbar__group}>
        <button className={styles.toolbar__btn} onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
        <button
          className={styles.toolbar__btn}
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
          </svg>
        </button>
      </div>

      <div className={styles.toolbar__divider} />

      <div className={styles.toolbar__group}>
        <button className={styles.toolbar__btn} onClick={onOpenCategories} title="Manage Categories (C)" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>
      </div>

      <div className={styles.toolbar__divider} />

      <div className={styles.toolbar__group}>
        <button className={styles.toolbar__btn} onClick={onExport} title="Export JSON" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
        <button className={styles.toolbar__btn} onClick={handleImportClick} title="Import JSON" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} />
      </div>

      <div className={styles.toolbar__divider} />

      <div className={styles.toolbar__group}>
        <button
          className={styles.toolbar__btn}
          onClick={handleUploadBgClick}
          title="Upload Background Image"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
        {hasBackground && (
          <button
            className={`${styles.toolbar__btn} ${styles['toolbar__btn--danger']}`}
            onClick={onRemoveBackground}
            title="Remove Background Image"
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        )}
        {hasBackground && (
          <button
            className={`${styles.toolbar__btn} ${!isBackgroundLocked ? styles['toolbar__btn--active'] : ''}`}
            onClick={onToggleBackgroundLock}
            title={
              isBackgroundLocked
                ? 'Unlock Background (make movable/resizable)'
                : 'Lock Background (prevent moving/resizing)'
            }
            type="button"
          >
            {isBackgroundLocked ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
            )}
          </button>
        )}
        <input
          ref={bgInputRef}
          type="file"
          accept="image/*"
          onChange={handleBgFileChange}
          style={{ display: 'none' }}
        />
      </div>

      <div className={styles.toolbar__divider} />

      <div className={styles.toolbar__group}>
        <button className={styles.toolbar__btn} onClick={onOpenHelp} title="Keyboard Shortcuts (?)" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Toolbar
