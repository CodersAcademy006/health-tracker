import type { Reminder, ReminderCategory, ReminderFrequency } from '@/types/reminder'
import { delay, failure } from '@/lib/api/client'
import { useAuthStore } from '@/store/auth-store'

const STORAGE_KEY = 'health-tracker:reminders'

function currentUserId(): string {
  return useAuthStore.getState().user?.id ?? 'guest'
}

function loadAll(): Reminder[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as Reminder[]) : []
}

function saveAll(reminders: Reminder[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
}

function mine(reminders: Reminder[]): Reminder[] {
  const userId = currentUserId()
  return reminders.filter((r) => r.userId === userId)
}

export interface CreateReminderInput {
  title: string
  message?: string
  category: ReminderCategory
  time: string
  frequency: ReminderFrequency
  browserNotification: boolean
  enabled: boolean
}

export const reminderApi = {
  async list(): Promise<Reminder[]> {
    await delay()
    return [...mine(loadAll())].sort(
      (a, b) => a.time.localeCompare(b.time)
    )
  },

  async getById(id: string): Promise<Reminder> {
    await delay()
    const reminder = loadAll().find((r) => r.id === id && r.userId === currentUserId())
    if (!reminder) failure(404, 'NOT_FOUND', 'Reminder not found')
    return reminder
  },

  async create(input: CreateReminderInput): Promise<Reminder> {
    await delay()
    const now = new Date().toISOString()
    const reminder: Reminder = {
      ...input,
      id: crypto.randomUUID(),
      userId: currentUserId(),
      createdAt: now,
      updatedAt: now,
    }
    const all = loadAll()
    all.push(reminder)
    saveAll(all)
    return reminder
  },

  async update(id: string, input: Partial<Omit<Reminder, 'id' | 'userId' | 'createdAt'>>): Promise<Reminder> {
    await delay()
    const all = loadAll()
    const index = all.findIndex((r) => r.id === id && r.userId === currentUserId())
    if (index === -1) failure(404, 'NOT_FOUND', 'Reminder not found')
    all[index] = { ...all[index], ...input, updatedAt: new Date().toISOString() }
    saveAll(all)
    return all[index]
  },

  async delete(id: string): Promise<void> {
    await delay()
    const all = loadAll().filter((r) => !(r.id === id && r.userId === currentUserId()))
    saveAll(all)
  },
}

export type ReminderApi = typeof reminderApi
