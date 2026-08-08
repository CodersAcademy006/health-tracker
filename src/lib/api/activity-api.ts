import type { ActivityRecord } from '@/types/activity'
import type { ApiPaginationParams } from '@/types/api'
import { delay, failure, paginate, sortItems } from '@/lib/api/client'
import { useAuthStore } from '@/store/auth-store'

const STORAGE_KEY = 'health-tracker:activity'

function currentUserId(): string {
  return useAuthStore.getState().user?.id ?? 'guest'
}

function loadAll(): ActivityRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as ActivityRecord[]) : []
}

function saveAll(records: ActivityRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

function mine(records: ActivityRecord[]): ActivityRecord[] {
  const userId = currentUserId()
  return records.filter((r) => r.userId === userId)
}

export const activityApi = {
  async list(params: ApiPaginationParams = {}): Promise<ReturnType<typeof paginate<ActivityRecord>>> {
    await delay()
    const all = sortItems(mine(loadAll()), params)
    return paginate(all, params)
  },

  async getById(id: string): Promise<ActivityRecord> {
    await delay()
    const record = loadAll().find((r) => r.id === id && r.userId === currentUserId())
    if (!record) failure(404, 'NOT_FOUND', 'Activity record not found')
    return record
  },

  async create(input: Omit<ActivityRecord, 'id' | 'userId'>): Promise<ActivityRecord> {
    await delay()
    const record: ActivityRecord = {
      ...input,
      id: crypto.randomUUID(),
      userId: currentUserId(),
    }
    const all = loadAll()
    all.push(record)
    saveAll(all)
    return record
  },

  async update(id: string, input: Partial<Omit<ActivityRecord, 'id' | 'userId'>>): Promise<ActivityRecord> {
    await delay()
    const all = loadAll()
    const index = all.findIndex((r) => r.id === id && r.userId === currentUserId())
    if (index === -1) failure(404, 'NOT_FOUND', 'Activity record not found')
    all[index] = { ...all[index], ...input }
    saveAll(all)
    return all[index]
  },

  async delete(id: string): Promise<void> {
    await delay()
    const all = loadAll().filter((r) => !(r.id === id && r.userId === currentUserId()))
    saveAll(all)
  },
}

export type ActivityApi = typeof activityApi
