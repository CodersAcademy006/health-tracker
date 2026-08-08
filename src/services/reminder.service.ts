import type { Reminder, ReminderFrequency } from '@/types/reminder'
import { reminderApi } from '@/lib/api/reminder-api'
import { notificationApi } from '@/lib/api/notification-api'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function localDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function localTimeString(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function matchesFrequency(frequency: ReminderFrequency, day: number): boolean {
  const isWeekend = day === 0 || day === 6
  if (frequency === 'weekdays') return !isWeekend
  if (frequency === 'weekends') return isWeekend
  return true
}

export const reminderService = {
  async checkDue(): Promise<Reminder[]> {
    const reminders = await reminderApi.list()
    const now = new Date()
    const today = localDateString(now)
    const currentTime = localTimeString(now)

    return reminders.filter((r) => {
      if (!r.enabled) return false
      if (!matchesFrequency(r.frequency, now.getDay())) return false
      const lastFiredLocal = r.lastFiredAt ? localDateString(new Date(r.lastFiredAt)) : null
      if (lastFiredLocal === today) return false
      // ponytail: catch-up comparison instead of exact minute so a throttled tab still fires once a day
      return r.time <= currentTime
    })
  },

  async fire(reminder: Reminder): Promise<void> {
    const today = localDateString(new Date())
    await notificationApi.create({
      type: 'habit_reminder',
      title: reminder.title,
      message: reminder.message,
      sourceKey: `reminder:${reminder.id}:${today}`,
    })
    await reminderApi.update(reminder.id, { lastFiredAt: new Date().toISOString() })

    if (
      reminder.browserNotification &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      window.Notification.permission === 'granted'
    ) {
      try {
        new window.Notification(reminder.title, {
          body: reminder.message ?? reminder.title,
        })
      } catch {
        // Browser notifications are best effort only
      }
    }
  },
}
