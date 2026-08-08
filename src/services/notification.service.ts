import type { AppNotification, NotificationType } from '@/types/notification'
import { notificationApi } from '@/lib/api/notification-api'
import { healthApi } from '@/lib/api/health-api'
import { goalsApi } from '@/lib/api/goals-api'
import { sleepApi } from '@/lib/api/sleep-api'
import { activityApi } from '@/lib/api/activity-api'
import { goalsService } from '@/services/goals.service'
import { HEALTH_METRIC_DEFINITIONS, isInNormalRange } from '@/lib/health/metric-definitions'
import { daysBetween } from '@/lib/utils/date'
import { formatDecimal } from '@/lib/utils/format-number'
import type { HealthMetricType } from '@/types/health'

export interface StatusNotificationInput {
  type: NotificationType
  title: string
  message?: string
  sourceKey: string
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export const notificationService = {
  async generateStatusNotifications(): Promise<AppNotification[]> {
    const [metricsRes, goalsRes, sleepRes, activityRes] = await Promise.all([
      healthApi.list({}, { pageSize: 500 }),
      goalsApi.list({ pageSize: 100 }),
      sleepApi.list({ pageSize: 500 }),
      activityApi.list({ pageSize: 500 }),
    ])

    const today = todayKey()
    const generated: StatusNotificationInput[] = []

    const metricTypes = Object.keys(HEALTH_METRIC_DEFINITIONS) as HealthMetricType[]
    for (const type of metricTypes) {
      const records = metricsRes.data.filter((m) => m.type === type)
      if (records.length === 0) continue
      const latest = records[0]
      if (!isInNormalRange(type, latest.value)) {
        const def = HEALTH_METRIC_DEFINITIONS[type]
        generated.push({
          type: 'tracker_alert',
          title: `${def.label} outside normal range`,
          message: `Your latest reading is ${latest.value} ${def.unit}. The normal range is ${def.normalRange[0]}-${def.normalRange[1]}.`,
          sourceKey: `tracker:${type}:${today}`,
        })
      }
    }

    for (const goal of goalsRes.data.filter((g) => g.status === 'active')) {
      const progress = await goalsService.getGoalProgress(goal)
      if (!progress.onTrack) {
        generated.push({
          type: 'goal_alert',
          title: `Goal on hold: ${goal.title}`,
          message: `You are at ${progress.percentComplete}% toward a target of ${goal.targetValue} ${goal.unit}.`,
          sourceKey: `goal:${goal.id}:${today}`,
        })
      }
    }

    const lastWeek = sleepRes.data.slice(0, 7)
    if (lastWeek.length > 0) {
      const total = lastWeek.reduce((sum, r) => sum + r.durationHours, 0)
      const debt = Math.max(0, lastWeek.length * 7.5 - total)
      if (debt >= 2) {
        generated.push({
          type: 'sleep_alert',
          title: 'Sleep debt is building',
          message: `You are about ${formatDecimal(debt, 1)} hours behind on sleep over the last ${lastWeek.length} nights.`,
          sourceKey: `sleep:debt:${today}`,
        })
      }
    }

    const latestActivity = activityRes.data[0]
    if (latestActivity) {
      const daysSince = daysBetween(latestActivity.startedAt, new Date().toISOString())
      if (daysSince >= 3) {
        generated.push({
          type: 'activity_alert',
          title: 'Time to move',
          message: `No activity has been recorded in ${daysSince} days. Schedule a session to stay on track.`,
          sourceKey: `activity:inactive:${today}`,
        })
      }
    }

    const existing = await notificationApi.list(500)
    const existingKeys = new Set(existing.map((n) => n.sourceKey).filter(Boolean))
    const created: AppNotification[] = []
    for (const item of generated) {
      if (existingKeys.has(item.sourceKey)) continue
      const notification = await notificationApi.create(item)
      created.push(notification)
    }
    return created
  },

  async getNotifications(limit = 50): Promise<AppNotification[]> {
    return notificationApi.list(limit)
  },

  async getUnreadCount(): Promise<number> {
    return notificationApi.unreadCount()
  },
}
