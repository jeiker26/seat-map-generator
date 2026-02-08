import { SeatMap } from '../../core/types'

export const exportToJson = (seatMap: SeatMap): string => {
  return JSON.stringify(seatMap, null, 2)
}

export const importFromJson = (json: string): SeatMap | null => {
  try {
    const parsed = JSON.parse(json) as SeatMap

    if (!parsed.id || !parsed.version || !Array.isArray(parsed.seats)) {
      console.error('Invalid seat map JSON: missing required fields')
      return null
    }

    return parsed
  } catch (error) {
    console.error('Failed to parse seat map JSON:', error)
    return null
  }
}

export const downloadJson = (seatMap: SeatMap, filename?: string): void => {
  const json = exportToJson(seatMap)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename || `${seatMap.name || 'seatmap'}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export const createEmptySeatMap = (name?: string): SeatMap => {
  return {
    id: crypto.randomUUID(),
    version: '1.0',
    name: name || 'Untitled Map',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    background: { url: '', width: 800, height: 600 },
    seats: [],
    zones: [],
    settings: { allowMultiSelect: true, showLabels: true, theme: 'light' },
  }
}
