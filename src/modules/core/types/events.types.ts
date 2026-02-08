import { Seat, SeatStatus } from './seatmap.types'

export type EmbedEvent =
  | { type: 'seatmap:ready' }
  | { type: 'seatmap:selected'; payload: { seats: Seat[] } }
  | { type: 'seatmap:deselected'; payload: { seatId: string } }
  | { type: 'seatmap:error'; payload: { code: string; message: string } }

export type HostCommand =
  | { type: 'seatmap:setStatus'; payload: { seatId: string; status: SeatStatus }[] }
  | { type: 'seatmap:clearSelection' }
  | { type: 'seatmap:selectSeats'; payload: { seatIds: string[] } }
  | { type: 'seatmap:setTheme'; payload: { theme: 'light' | 'dark' } }
