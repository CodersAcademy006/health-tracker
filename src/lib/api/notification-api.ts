import type { AppNotification, NotificationType } from '@/types/notification'
import { delay, failure } from '@/lib/api/client'
import { useAuthStore } from '@/store/auth-store'

const STORAGE_KEY = 'health-tracker:notifications'

function currentUserId(): string {
  return useAuthStore.getState().user?.id ?? 'guest'
}

function loadAll(): AppNotification[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as AppNotification[]) : []
}

function saveAll(notifications: AppNotification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
}

function mine(notifications: AppNotification[]): AppNotification[] {
  const userId = currentUserId()
  return notifications.filter((n) => n.userId === userId)
}

function sorted(notifications: AppNotification[]): AppNotification[] {
  return [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export interface CreateNotificationInput {
  type: NotificationType
  title: string
  message?: string
  sourceKey?: string
}

export const notificationApi = {
  async list(limit = 50): Promise<AppNotification[]> {
    await delay()
    return sorted(mine(loadAll())).slice(0, limit)
  },

  async unreadCount(): Promise<number> {
    await delay()
    return mine(loadAll()).filter((n) => !n.read).length
  },

  async create(input: CreateNotificationInput): Promise<AppNotification> {
    await delay()
    if (input.sourceKey) {
      const existing = mine(loadAll()).some((n) => n.sourceKey === input.sourceKey)
      if (existing) return mine(loadAll()).find((n) => n.sourceKey === input.sourceKey)!
    }
    const notification: AppNotification = {
      id: crypto.randomUUID(),
      userId: currentUserId(),
      type: input.type,
      title: input.title,
      message: input.message,
      sourceKey: input.sourceKey,
      read: false,
      createdAt: new Date().toISOString(),
    }
    const all = loadAll()
    all.push(notification)
    saveAll(all)
    return notification
  },

  async markAsRead(id: string): Promise<void> {
    await delay()
    const all = loadAll()
    const index = all.findIndex((n) => n.id === id && n.userId === currentUserId())
    if (index === -1) failure(404, 'NOT_FOUND', 'Notification not found')
    all[index] = { ...all[index], read: true }
    saveAll(all)
  },

  async markAllAsRead(): Promise<void> {
    await delay()
    const all = loadAll()
    saveAll(all.map((n) => (n.userId === currentUserId() ? { ...n, read: true } : n)))
  },

  async remove(id: string): Promise<void> {
    await delay()
    const all = loadAll().filter((n) => !(n.id === id && n.userId === currentUserId()))
    saveAll(all)
  },

  async clearAll(): Promise<void> {
    await delay()
    const all = loadAll().filter((n) => n.userId !== currentUserId())
    saveAll(all)
  },
}

export type NotificationApi = typeof notificationApi
