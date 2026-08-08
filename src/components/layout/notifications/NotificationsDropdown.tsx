import { useEffect, useRef, useState } from 'react'
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Activity,
  Target,
  Moon,
  Flame,
  AlarmClock,
  Info,
} from 'lucide-react'
import type { AppNotification, NotificationType } from '@/types/notification'
import { useNotificationStore } from '@/store/notification-store'
import { formatRelativeTime } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'

const ICON_MAP: Record<NotificationType, { icon: typeof Info; className: string }> = {
  tracker_alert: { icon: Activity, className: 'bg-orange-50 text-orange-600' },
  goal_alert: { icon: Target, className: 'bg-blue-50 text-blue-600' },
  sleep_alert: { icon: Moon, className: 'bg-indigo-50 text-indigo-600' },
  activity_alert: { icon: Flame, className: 'bg-green-50 text-green-600' },
  habit_reminder: { icon: AlarmClock, className: 'bg-yellow-50 text-yellow-600' },
  system: { icon: Info, className: 'bg-surface-100 text-surface-600' },
}

function NotificationRow({
  notification,
  onMarkRead,
  onRemove,
}: {
  notification: AppNotification
  onMarkRead: (id: string) => void
  onRemove: (id: string) => void
}) {
  const config = ICON_MAP[notification.type]
  const Icon = config.icon
  return (
    <li
      className={cn(
        'group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-50',
        !notification.read && 'bg-primary-50/40'
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          config.className
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <button
        className="min-w-0 flex-1 text-left"
        onClick={() => !notification.read && onMarkRead(notification.id)}
      >
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-surface-900">{notification.title}</p>
          {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary-500" />}
        </div>
        {notification.message && (
          <p className="mt-0.5 line-clamp-2 text-xs text-surface-500">{notification.message}</p>
        )}
        <p className="mt-1 text-[11px] text-surface-400">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </button>
      <button
        onClick={() => onRemove(notification.id)}
        className="rounded p-1 text-surface-300 opacity-0 transition-opacity hover:bg-surface-100 hover:text-surface-600 group-hover:opacity-100"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </li>
  )
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, loading, initialize, refresh, markAsRead, markAllAsRead, remove, clearAll } =
    useNotificationStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-surface-500 hover:bg-surface-100 transition-colors"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-[26rem] max-w-[90vw] overflow-hidden rounded-xl border border-surface-200 bg-white shadow-xl animate-slide-down">
          <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-surface-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={() => markAllAsRead()}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-surface-500 hover:bg-surface-100 hover:text-surface-800"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                  <button
                    onClick={() => clearAll()}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-surface-500 hover:bg-red-50 hover:text-red-600"
                    aria-label="Clear all notifications"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-surface-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-surface-200" />
                    <div className="h-2.5 w-1/2 animate-pulse rounded bg-surface-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Bell className="mx-auto h-10 w-10 text-surface-300" />
              <p className="mt-3 text-sm font-medium text-surface-700">You are all caught up</p>
              <p className="mt-1 text-xs text-surface-500">
                Alerts about your trackers, goals, sleep, and activity will appear here.
              </p>
            </div>
          ) : (
            <ul className="max-h-[24rem] divide-y divide-surface-100 overflow-y-auto scrollbar-thin">
              {notifications.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onMarkRead={markAsRead}
                  onRemove={remove}
                />
              ))}
            </ul>
          )}

          {notifications.length > 0 && (
            <div className="border-t border-surface-200 bg-surface-50 px-4 py-2">
              <button
                onClick={() => refresh()}
                className="w-full rounded py-1 text-center text-xs font-medium text-surface-500 hover:text-surface-800"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
