# Editor Module

## Purpose
Admin interface for creating and editing seat maps. Provides tools for placing seats, generating grids, importing/exporting JSON, and managing seat properties.

## Public API
- Components: Editor (main entry point)
- Hooks: useEditorState, useUndoRedo, useKeyboardShortcuts
- Services: editorService

## Routes Owned
- /editor - New map creation
- /editor/:id - Edit existing map

## i18n Key Root
`editor`
