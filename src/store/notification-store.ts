import { create } from 'zustand'
import type { AppNotification } from '@/types/notification'
import { notificationApi } from '@/lib/api/notification-api'
import { notificationService } from '@/services/notification.service'
import { useAuthStore } from '@/store/auth-store'

interface NotificationState {
  notifications: AppNotification[]
  unreadCount: number
  loading: boolean
  initialized: boolean
  initialize: () => Promise<void>
  refresh: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  remove: (id: string) => Promise<void>
  clearAll: () => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return
    if (!useAuthStore.getState().isAuthenticated) return
    set({ loading: true, initialized: true })
    try {
      await notificationService.generateStatusNotifications()
      const [notifications, unreadCount] = await Promise.all([
        notificationService.getNotifications(50),
        notificationService.getUnreadCount(),
      ])
      set({ notifications, unreadCount })
    } finally {
      set({ loading: false })
    }
  },

  refresh: async () => {
    const [notifications, unreadCount] = await Promise.all([
      notificationService.getNotifications(50),
      notificationService.getUnreadCount(),
    ])
    set({ notifications, unreadCount })
  },

  markAsRead: async (id: string) => {
    await notificationApi.markAsRead(id)
    set({
      notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, get().unreadCount - 1),
    })
  },

  markAllAsRead: async () => {
    await notificationApi.markAllAsRead()
    set({
      notifications: get().notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })
  },

  remove: async (id: string) => {
    await notificationApi.remove(id)
    const remaining = get().notifications.filter((n) => n.id !== id)
    set({
      notifications: remaining,
      unreadCount: remaining.filter((n) => !n.read).length,
    })
  },

  clearAll: async () => {
    await notificationApi.clearAll()
    set({ notifications: [], unreadCount: 0 })
  },
}))
