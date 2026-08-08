import { useEffect } from 'react'
import { reminderService } from '@/services/reminder.service'
import { useNotificationStore } from '@/store/notification-store'

export function useReminderEngine() {
  const refresh = useNotificationStore((state) => state.refresh)

  useEffect(() => {
    let cancelled = false

    const tick = async () => {
      if (cancelled) return
      try {
        const due = await reminderService.checkDue()
        if (due.length > 0) {
          for (const reminder of due) {
            await reminderService.fire(reminder)
          }
          await refresh()
        }
      } catch {
        // Reminder checks are best effort and must never crash the app
      }
    }

    const interval = setInterval(tick, 30_000)
    tick()

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [refresh])
}
