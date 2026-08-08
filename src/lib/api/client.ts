import type { ApiError, ApiResponse, ApiPaginationParams, PaginationMeta, PaginationParams } from '@/types/api'

const BASE_DELAY = 200

export class ApiErrorImpl extends Error implements ApiError {
  status: number
  code: string
  details?: Record<string, unknown>

  constructor(status: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'ApiErrorImpl'
    this.status = status
    this.code = code
    this.details = details
  }
}

export async function delay(ms = BASE_DELAY): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function success<T>(data: T, meta?: PaginationMeta): ApiResponse<T> {
  return { data, meta }
}

export function failure(status: number, code: string, message: string, details?: Record<string, unknown>): never {
  throw new ApiErrorImpl(status, code, message, details)
}

export function paginate<T>(items: T[], params: PaginationParams = {}): { data: T[]; meta: PaginationMeta } {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize
  const data = items.slice(start, start + pageSize)
  return { data, meta: { page, pageSize, total, totalPages } }
}

export function sortItems<T>(items: T[], params: ApiPaginationParams): T[] {
  if (!params.sortBy) return items
  const { sortBy, sortOrder = 'asc' } = params
  const direction = sortOrder === 'asc' ? 1 : -1
  return [...items].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[sortBy]
    const bVal = (b as Record<string, unknown>)[sortBy]
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * direction
    }
    return ((aVal as number) - (bVal as number)) * direction
  })
}
