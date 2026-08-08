import { create } from 'zustand'
import type { AppNotification } from '@/types/notification'
import { notificationApi } from '@/lib/api/notification-api'
import { notificationService } from '@/services/notification.service'
import { useAuthStore } from '@/store/auth-store'

interface NotificationState {
  notifications: AppNotification[]
  unreadCount: number
  loading: boolean
  initializedUserId: string | null
  initialize: () => Promise<void>
  refresh: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  remove: (id: string) => Promise<void>
  clearAll: () => Promise<void>
}

async function syncCount(set: (partial: Partial<NotificationState>) => void): Promise<void> {
  const [notifications, unreadCount] = await Promise.all([
    notificationService.getNotifications(50),
    notificationApi.unreadCount(),
  ])
  set({ notifications, unreadCount })
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  initializedUserId: null,

  initialize: async () => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return
    if (get().initializedUserId === userId) return
    set({ loading: true, initializedUserId: userId, notifications: [], unreadCount: 0 })
    try {
      await get().refresh()
    } finally {
      set({ loading: false })
    }
  },

  refresh: async () => {
    await notificationService.generateStatusNotifications()
    await syncCount(set)
  },

  markAsRead: async (id: string) => {
    await notificationApi.markAsRead(id)
    await syncCount(set)
  },

  markAllAsRead: async () => {
    await notificationApi.markAllAsRead()
    await syncCount(set)
  },

  remove: async (id: string) => {
    await notificationApi.remove(id)
    await syncCount(set)
  },

  clearAll: async () => {
    await notificationApi.clearAll()
    await syncCount(set)
  },
}))
