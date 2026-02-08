import { ApiResponse, SeatMap } from '../types'
import { apiService } from './api.service'

const MAPS_ENDPOINT = '/api/maps'

export const mapsService = {
  async getMaps(): Promise<ApiResponse<SeatMap[]>> {
    return apiService.get<ApiResponse<SeatMap[]>>(MAPS_ENDPOINT)
  },

  async getMap(id: string): Promise<ApiResponse<SeatMap>> {
    return apiService.get<ApiResponse<SeatMap>>(`${MAPS_ENDPOINT}/${id}`)
  },

  async createMap(data: Partial<SeatMap>): Promise<ApiResponse<SeatMap>> {
    return apiService.post<ApiResponse<SeatMap>>(MAPS_ENDPOINT, data)
  },

  async updateMap(id: string, data: Partial<SeatMap>): Promise<ApiResponse<SeatMap>> {
    return apiService.put<ApiResponse<SeatMap>>(`${MAPS_ENDPOINT}/${id}`, data)
  },

  async deleteMap(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<ApiResponse<void>>(`${MAPS_ENDPOINT}/${id}`)
  },

  async uploadBackground(file: File): Promise<ApiResponse<{ url: string; width: number; height: number }>> {
    return apiService.uploadFile<ApiResponse<{ url: string; width: number; height: number }>>(
      `${MAPS_ENDPOINT}/background`,
      file
    )
  },
}
