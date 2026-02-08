import { SeatMap } from '../../core/types'
import { seatMapSchema } from '../../core/utils/schema'

export const exportToJson = (seatMap: SeatMap): string => {
  return JSON.stringify(seatMap, null, 2)
}

export interface ImportResult {
  success: true
  data: SeatMap
}

export interface ImportError {
  success: false
  errors: string[]
}

export const importFromJson = (json: string): ImportResult | ImportError => {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (error) {
    console.error('Failed to parse JSON:', error)
    return { success: false, errors: ['Invalid JSON: failed to parse the file content.'] }
  }

  const result = seatMapSchema.safeParse(parsed)

  if (!result.success) {
    const errors = result.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'root'
      return `${path}: ${issue.message}`
    })
    console.error('Seat map validation failed:', errors)
    return { success: false, errors }
  }

  return { success: true, data: result.data as SeatMap }
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
    categories: [],
    elements: [],
    settings: { allowMultiSelect: true, showLabels: true, theme: 'light' },
  }
}
