export interface ApiError {
  status: number
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface ApiResponse<T> {
  data: T
  meta?: PaginationMeta
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface ApiPaginationParams extends PaginationParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
