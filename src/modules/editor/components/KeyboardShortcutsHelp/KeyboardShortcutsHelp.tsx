import styles from './KeyboardShortcutsHelp.module.scss'

interface ShortcutItem {
  keys: string[]
  description: string
}

interface ShortcutGroup {
  title: string
  shortcuts: ShortcutItem[]
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Tools',
    shortcuts: [
      { keys: ['S'], description: 'Select tool' },
      { keys: ['A'], description: 'Add seat tool' },
      { keys: ['P'], description: 'Pan tool' },
      { keys: ['G'], description: 'Grid generator' },
      { keys: ['C'], description: 'Open categories' },
    ],
  },
  {
    title: 'Selection',
    shortcuts: [
      { keys: ['Click'], description: 'Select seat' },
      { keys: ['Shift', 'Click'], description: 'Toggle seat in selection' },
      { keys: ['Drag'], description: 'Lasso select (Select tool)' },
      { keys: ['Shift', 'Drag'], description: 'Additive lasso select' },
      { keys: ['Ctrl', 'A'], description: 'Select all seats' },
      { keys: ['Escape'], description: 'Deselect all' },
    ],
  },
  {
    title: 'Editing',
    shortcuts: [
      { keys: ['Delete'], description: 'Delete selected seats' },
      { keys: ['Backspace'], description: 'Delete selected seats' },
      { keys: ['Ctrl', 'D'], description: 'Duplicate selected seats' },
      { keys: ['Arrow Keys'], description: 'Nudge selected seats' },
      { keys: ['Shift', 'Arrow Keys'], description: 'Nudge seats (large step)' },
    ],
  },
  {
    title: 'History',
    shortcuts: [
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
    ],
  },
  {
    title: 'General',
    shortcuts: [{ keys: ['?'], description: 'Show this help' }],
  },
]

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

const KeyboardShortcutsHelp = ({ isOpen, onClose }: KeyboardShortcutsHelpProps) => {
  if (!isOpen) {
    return null
  }

  return (
    <div className={styles['shortcuts-help__overlay']} onClick={onClose} role="presentation">
      <div
        className={styles['shortcuts-help']}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Keyboard Shortcuts"
      >
        <h3 className={styles['shortcuts-help__title']}>Keyboard Shortcuts</h3>

        <div className={styles['shortcuts-help__groups']}>
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title} className={styles['shortcuts-help__group']}>
              <h4 className={styles['shortcuts-help__group-title']}>{group.title}</h4>
              <div className={styles['shortcuts-help__list']}>
                {group.shortcuts.map((shortcut) => (
                  <div key={shortcut.description} className={styles['shortcuts-help__item']}>
                    <div className={styles['shortcuts-help__keys']}>
                      {shortcut.keys.map((key, i) => (
                        <span key={key}>
                          <kbd className={styles['shortcuts-help__kbd']}>{key}</kbd>
                          {i < shortcut.keys.length - 1 && <span className={styles['shortcuts-help__plus']}>+</span>}
                        </span>
                      ))}
                    </div>
                    <span className={styles['shortcuts-help__description']}>{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles['shortcuts-help__actions']}>
          <button className={styles['shortcuts-help__btn--primary']} onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default KeyboardShortcutsHelp
