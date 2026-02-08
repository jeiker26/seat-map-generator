import { create } from 'zustand'

import { EditorStore, EditorTool } from '../../core/types'
import { MapElement, Seat, SeatCategory, SeatMap } from '../../core/types'

const MAX_HISTORY_ENTRIES = 50

const pushToHistory = (
  history: SeatMap[],
  historyIndex: number,
  seatMap: SeatMap,
): { history: SeatMap[]; historyIndex: number } => {
  const newHistory = history.slice(0, historyIndex + 1)
  newHistory.push(JSON.parse(JSON.stringify(seatMap)))
  if (newHistory.length > MAX_HISTORY_ENTRIES) {
    newHistory.shift()
  }
  return { history: newHistory, historyIndex: newHistory.length - 1 }
}

export const useEditorState = create<EditorStore>((set, get) => ({
  seatMap: null,
  selectedSeats: [],
  activeTool: 'select',
  history: [],
  historyIndex: -1,
  isDirty: false,

  setSeatMap: (map: SeatMap) => {
    const historyData = pushToHistory([], -1, map)
    set({
      seatMap: JSON.parse(JSON.stringify(map)),
      ...historyData,
      isDirty: false,
      selectedSeats: [],
    })
  },

  addSeat: (seat: Seat) => {
    const { seatMap, history, historyIndex } = get()
    if (!seatMap) {
      return
    }
    const updatedMap = { ...seatMap, seats: [...seatMap.seats, seat], updatedAt: new Date().toISOString() }
    const historyData = pushToHistory(history, historyIndex, updatedMap)
    set({ seatMap: updatedMap, ...historyData, isDirty: true })
  },

  addSeats: (seats: Seat[]) => {
    const { seatMap, history, historyIndex } = get()
    if (!seatMap || seats.length === 0) {
      return
    }
    const updatedMap = { ...seatMap, seats: [...seatMap.seats, ...seats], updatedAt: new Date().toISOString() }
    const historyData = pushToHistory(history, historyIndex, updatedMap)
    set({ seatMap: updatedMap, ...historyData, isDirty: true })
  },

  updateSeat: (id: string, updates: Partial<Seat>) => {
    const { seatMap, history, historyIndex } = get()
    if (!seatMap) {
      return
    }
    const updatedSeats = seatMap.seats.map((s) => (s.id === id ? { ...s, ...updates } : s))
    const updatedMap = { ...seatMap, seats: updatedSeats, updatedAt: new Date().toISOString() }
    const historyData = pushToHistory(history, historyIndex, updatedMap)
    set({ seatMap: updatedMap, ...historyData, isDirty: true })
  },

  updateSeats: (ids: string[], updates: Partial<Seat>) => {
    const { seatMap, history, historyIndex } = get()
    if (!seatMap || ids.length === 0) {
      return
    }
    const idSet = new Set(ids)
    const updatedSeats = seatMap.seats.map((s) => (idSet.has(s.id) ? { ...s, ...updates } : s))
    const updatedMap = { ...seatMap, seats: updatedSeats, updatedAt: new Date().toISOString() }
    const historyData = pushToHistory(history, historyIndex, updatedMap)
    set({ seatMap: updatedMap, ...historyData, isDirty: true })
  },

  deleteSeat: (id: string) => {
    const { seatMap, history, historyIndex, selectedSeats } = get()
    if (!seatMap) {
      return
    }
    const updatedSeats = seatMap.seats.filter((s) => s.id !== id)
    const updatedMap = { ...seatMap, seats: updatedSeats, updatedAt: new Date().toISOString() }
    const historyData = pushToHistory(history, historyIndex, updatedMap)
    set({
      seatMap: updatedMap,
      ...historyData,
      isDirty: true,
      selectedSeats: selectedSeats.filter((sId) => sId !== id),
    })
  },

  deleteSeats: (ids: string[]) => {
    const { seatMap, history, historyIndex, selectedSeats } = get()
    if (!seatMap || ids.length === 0) {
      return
    }
    const idSet = new Set(ids)
    const updatedSeats = seatMap.seats.filter((s) => !idSet.has(s.id))
    const updatedMap = { ...seatMap, seats: updatedSeats, updatedAt: new Date().toISOString() }
    const historyData = pushToHistory(history, historyIndex, updatedMap)
    set({
      seatMap: updatedMap,
      ...historyData,
      isDirty: true,
      selectedSeats: selectedSeats.filter((sId) => !idSet.has(sId)),
    })
  },

  selectSeat: (id: string) => {
    const { selectedSeats } = get()
    if (!selectedSeats.includes(id)) {
      set({ selectedSeats: [...selectedSeats, id] })
    }
  },

  deselectSeat: (id: string) => {
    set((state) => ({ selectedSeats: state.selectedSeats.filter((sId) => sId !== id) }))
  },

  clearSelection: () => set({ selectedSeats: [] }),

  setActiveTool: (tool: EditorTool) => set({ activeTool: tool }),

  addCategory: (category: SeatCategory) => {
    const { seatMap, history, historyIndex } = get()
    if (!seatMap) {
      return
    }
    const categories = [...(seatMap.categories || []), category]
    const updatedMap = { ...seatMap, categories, updatedAt: new Date().toISOString() }
    const historyData = pushToHistory(history, historyIndex, updatedMap)
    set({ seatMap: updatedMap, ...historyData, isDirty: true })
  },

  updateCategory: (id: string, updates: Partial<SeatCategory>) => {
    const { seatMap, history, historyIndex } = get()
    if (!seatMap || !seatMap.categories) {
      return
    }
    const categories = seatMap.categories.map((c) => (c.id === id ? { ...c, ...updates } : c))
    const updatedMap = { ...seatMap, categories, updatedAt: new Date().toISOString() }
    const historyData = pushToHistory(history, historyIndex, updatedMap)
    set({ seatMap: updatedMap, ...historyData, isDirty: true })
  },

  deleteCategory: (id: string) => {
    const { seatMap, history, historyIndex } = get()
    if (!seatMap || !seatMap.categories) {
      return
    }
    const categories = seatMap.categories.filter((c) => c.id !== id)
    const seats = seatMap.seats.map((s) => (s.categoryId === id ? { ...s, categoryId: undefined } : s))
    const updatedMap = { ...seatMap, categories, seats, updatedAt: new Date().toISOString() }
    const historyData = pushToHistory(history, historyIndex, updatedMap)
    set({ seatMap: updatedMap, ...historyData, isDirty: true })
  },

  addElement: (element: MapElement) => {
    const { seatMap, history, historyIndex } = get()
    if (!seatMap) {
      return
    }
    const elements = [...(seatMap.elements || []), element]
    const updatedMap = { ...seatMap, elements, updatedAt: new Date().toISOString() }
    const historyData = pushToHistory(history, historyIndex, updatedMap)
    set({ seatMap: updatedMap, ...historyData, isDirty: true })
  },

  updateElement: (id: string, updates: Partial<MapElement>) => {
    const { seatMap, history, historyIndex } = get()
    if (!seatMap || !seatMap.elements) {
      return
    }
    const elements = seatMap.elements.map((e) => (e.id === id ? { ...e, ...updates } : e))
    const updatedMap = { ...seatMap, elements, updatedAt: new Date().toISOString() }
    const historyData = pushToHistory(history, historyIndex, updatedMap)
    set({ seatMap: updatedMap, ...historyData, isDirty: true })
  },

  deleteElement: (id: string) => {
    const { seatMap, history, historyIndex } = get()
    if (!seatMap || !seatMap.elements) {
      return
    }
    const elements = seatMap.elements.filter((e) => e.id !== id)
    const updatedMap = { ...seatMap, elements, updatedAt: new Date().toISOString() }
    const historyData = pushToHistory(history, historyIndex, updatedMap)
    set({ seatMap: updatedMap, ...historyData, isDirty: true })
  },

  updateGridConfig: (config) => {
    const { seatMap, history, historyIndex } = get()
    if (!seatMap) {
      return
    }
    const gridConfig = { ...(seatMap.gridConfig || {}), ...config }
    const updatedMap = { ...seatMap, gridConfig, updatedAt: new Date().toISOString() }
    const historyData = pushToHistory(history, historyIndex, updatedMap)
    set({ seatMap: updatedMap, ...historyData, isDirty: true })
  },

  updateSettings: (settings) => {
    const { seatMap, history, historyIndex } = get()
    if (!seatMap) {
      return
    }
    const updatedSettings = { ...(seatMap.settings || { allowMultiSelect: true, showLabels: true }), ...settings }
    const updatedMap = { ...seatMap, settings: updatedSettings, updatedAt: new Date().toISOString() }
    const historyData = pushToHistory(history, historyIndex, updatedMap)
    set({ seatMap: updatedMap, ...historyData, isDirty: true })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) {
      return
    }
    const newIndex = historyIndex - 1
    set({
      seatMap: JSON.parse(JSON.stringify(history[newIndex])),
      historyIndex: newIndex,
      isDirty: true,
      selectedSeats: [],
    })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) {
      return
    }
    const newIndex = historyIndex + 1
    set({
      seatMap: JSON.parse(JSON.stringify(history[newIndex])),
      historyIndex: newIndex,
      isDirty: true,
      selectedSeats: [],
    })
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}))
