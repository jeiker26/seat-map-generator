export interface ApiResponse<T> {
  success: boolean
  data: T
  meta: ApiMeta
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  meta: ApiMeta
}

export interface ApiMeta {
  timestamp: string
  pagination?: PaginationMeta
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}
