import type { ID } from './user'

export type NotificationType =
  | 'tracker_alert'
  | 'goal_alert'
  | 'sleep_alert'
  | 'activity_alert'
  | 'habit_reminder'
  | 'system'

export interface AppNotification {
  id: ID
  userId: ID
  type: NotificationType
  title: string
  message?: string
  sourceKey?: string
  read: boolean
  createdAt: string
}
