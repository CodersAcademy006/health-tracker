import type { HealthMetric, HealthMetricFilter } from '@/types/health'
import type { PaginationParams } from '@/types/api'
import { delay, failure, paginate } from '@/lib/api/client'
import { useAuthStore } from '@/store/auth-store'

const STORAGE_KEY = 'health-tracker:metrics'

function currentUserId(): string {
  return useAuthStore.getState().user?.id ?? 'guest'
}

function loadAll(): HealthMetric[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as HealthMetric[]) : []
}

function saveAll(metrics: HealthMetric[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics))
}

function mine(metrics: HealthMetric[]): HealthMetric[] {
  const userId = currentUserId()
  return metrics.filter((m) => m.userId === userId)
}

export const healthApi = {
  async list(filter: HealthMetricFilter = {}, params: PaginationParams = {}): Promise<ReturnType<typeof paginate<HealthMetric>>> {
    await delay()
    let items = mine(loadAll())
    if (filter.type) items = items.filter((m) => m.type === filter.type)
    if (filter.startDate) items = items.filter((m) => m.recordedAt >= filter.startDate!)
    if (filter.endDate) items = items.filter((m) => m.recordedAt <= filter.endDate!)
    items.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
    if (filter.limit) items = items.slice(0, filter.limit)
    return paginate(items, params)
  },

  async getById(id: string): Promise<HealthMetric> {
    await delay()
    const metric = loadAll().find((m) => m.id === id && m.userId === currentUserId())
    if (!metric) failure(404, 'NOT_FOUND', 'Health metric not found')
    return metric
  },

  async create(input: Omit<HealthMetric, 'id' | 'userId'>): Promise<HealthMetric> {
    await delay()
    const metric: HealthMetric = {
      ...input,
      id: crypto.randomUUID(),
      userId: currentUserId(),
    }
    const all = loadAll()
    all.push(metric)
    saveAll(all)
    return metric
  },

  async update(id: string, input: Partial<Omit<HealthMetric, 'id' | 'userId'>>): Promise<HealthMetric> {
    await delay()
    const all = loadAll()
    const index = all.findIndex((m) => m.id === id && m.userId === currentUserId())
    if (index === -1) failure(404, 'NOT_FOUND', 'Health metric not found')
    all[index] = { ...all[index], ...input }
    saveAll(all)
    return all[index]
  },

  async delete(id: string): Promise<void> {
    await delay()
    const all = loadAll().filter((m) => !(m.id === id && m.userId === currentUserId()))
    saveAll(all)
  },

  async clear(): Promise<void> {
    await delay()
    const all = loadAll().filter((m) => m.userId !== currentUserId())
    saveAll(all)
  },
}

export type HealthApi = typeof healthApi
