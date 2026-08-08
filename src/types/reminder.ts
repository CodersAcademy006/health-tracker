import type { ID } from './user'

export type ReminderCategory = 'habit' | 'tracker' | 'activity' | 'sleep' | 'goal'

export type ReminderFrequency = 'daily' | 'weekdays' | 'weekends'

export interface Reminder {
  id: ID
  userId: ID
  title: string
  message?: string
  category: ReminderCategory
  time: string
  frequency: ReminderFrequency
  browserNotification: boolean
  enabled: boolean
  createdAt: string
  updatedAt: string
  lastFiredAt?: string
}
