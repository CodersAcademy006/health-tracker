import type { SleepRecord } from '@/types/sleep'
import type { ApiPaginationParams } from '@/types/api'
import { delay, failure, paginate, sortItems } from '@/lib/api/client'
import { useAuthStore } from '@/store/auth-store'

const STORAGE_KEY = 'health-tracker:sleep'

function currentUserId(): string {
  return useAuthStore.getState().user?.id ?? 'guest'
}

function loadAll(): SleepRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as SleepRecord[]) : []
}

function saveAll(records: SleepRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

function mine(records: SleepRecord[]): SleepRecord[] {
  const userId = currentUserId()
  return records.filter((r) => r.userId === userId)
}

export const sleepApi = {
  async list(params: ApiPaginationParams = {}): Promise<ReturnType<typeof paginate<SleepRecord>>> {
    await delay()
    const all = sortItems(mine(loadAll()), params).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return paginate(all, params)
  },

  async getById(id: string): Promise<SleepRecord> {
    await delay()
    const record = loadAll().find((r) => r.id === id && r.userId === currentUserId())
    if (!record) failure(404, 'NOT_FOUND', 'Sleep record not found')
    return record
  },

  async create(input: Omit<SleepRecord, 'id' | 'userId'>): Promise<SleepRecord> {
    await delay()
    const record: SleepRecord = {
      ...input,
      id: crypto.randomUUID(),
      userId: currentUserId(),
    }
    const all = loadAll()
    all.push(record)
    saveAll(all)
    return record
  },

  async update(id: string, input: Partial<Omit<SleepRecord, 'id' | 'userId'>>): Promise<SleepRecord> {
    await delay()
    const all = loadAll()
    const index = all.findIndex((r) => r.id === id && r.userId === currentUserId())
    if (index === -1) failure(404, 'NOT_FOUND', 'Sleep record not found')
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

export type SleepApi = typeof sleepApi
