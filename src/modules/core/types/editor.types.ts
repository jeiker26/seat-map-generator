import { Seat, SeatMap } from './seatmap.types'

export type EditorTool = 'select' | 'add' | 'pan' | 'grid'

export interface EditorState {
  seatMap: SeatMap | null
  selectedSeats: string[]
  activeTool: EditorTool
  history: SeatMap[]
  historyIndex: number
  isDirty: boolean
}

export interface EditorActions {
  setSeatMap: (map: SeatMap) => void
  addSeat: (seat: Seat) => void
  updateSeat: (id: string, updates: Partial<Seat>) => void
  deleteSeat: (id: string) => void
  selectSeat: (id: string) => void
  deselectSeat: (id: string) => void
  clearSelection: () => void
  setActiveTool: (tool: EditorTool) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

export type EditorStore = EditorState & EditorActions
