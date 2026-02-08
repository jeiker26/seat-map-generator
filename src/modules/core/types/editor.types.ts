import { MapElement, Seat, SeatCategory, SeatMap, SeatMapBackground } from './seatmap.types'

export type EditorTool = 'select' | 'add' | 'pan' | 'grid' | 'element'

export interface EditorState {
  seatMap: SeatMap | null
  selectedSeats: string[]
  activeTool: EditorTool
  history: SeatMap[]
  historyIndex: number
  isDirty: boolean
}

export interface EditorActions {
  setSeatMap: (_map: SeatMap) => void
  addSeat: (_seat: Seat) => void
  addSeats: (_seats: Seat[]) => void
  updateSeat: (_id: string, _updates: Partial<Seat>) => void
  updateSeats: (_ids: string[], _updates: Partial<Seat>) => void
  moveSeats: (_ids: string[], _deltaX: number, _deltaY: number) => void
  batchUpdateSeats: (_updates: Array<{ id: string; updates: Partial<Seat> }>) => void
  deleteSeat: (_id: string) => void
  deleteSeats: (_ids: string[]) => void
  selectSeat: (_id: string) => void
  selectSeats: (_ids: string[]) => void
  deselectSeat: (_id: string) => void
  clearSelection: () => void
  setActiveTool: (_tool: EditorTool) => void
  addCategory: (_category: SeatCategory) => void
  updateCategory: (_id: string, _updates: Partial<SeatCategory>) => void
  deleteCategory: (_id: string) => void
  addElement: (_element: MapElement) => void
  updateElement: (_id: string, _updates: Partial<MapElement>) => void
  deleteElement: (_id: string) => void
  updateGridConfig: (_config: Partial<SeatMap['gridConfig']>) => void
  updateSettings: (_settings: Partial<NonNullable<SeatMap['settings']>>) => void
  updateBackground: (_updates: Partial<SeatMapBackground>) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

export type EditorStore = EditorState & EditorActions
