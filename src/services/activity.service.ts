import type { ActivityRecord, ActivitySummary } from '@/types/activity'
import { activityApi } from '@/lib/api/activity-api'
import { round } from '@/lib/utils/format-number'

export interface ActivityPeriodSummary {
  summary: ActivitySummary
  records: ActivityRecord[]
  dailyMinutes: Array<{ date: string; minutes: number }>
}

export const activityService = {
  async getSummary(days = 30): Promise<ActivityPeriodSummary | null> {
    const { data } = await activityApi.list({ pageSize: 1000 })
    if (data.length === 0) return null
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const recent = data.filter((r) => new Date(r.startedAt) >= cutoff)
    const totalMinutes = recent.reduce((sum, r) => sum + r.durationMinutes, 0)
    const caloriesBurned = recent.reduce((sum, r) => sum + (r.caloriesBurned ?? 0), 0)

    const freq = new Map<string, number>()
    recent.forEach((r) => freq.set(r.type, (freq.get(r.type) ?? 0) + 1))
    const mostFrequentType = [...freq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] as ActivitySummary['mostFrequentType']

    const daily = new Map<string, number>()
    recent.forEach((r) => {
      const date = r.startedAt.slice(0, 10)
      daily.set(date, (daily.get(date) ?? 0) + r.durationMinutes)
    })

    return {
      summary: {
        totalMinutes,
        totalActivities: recent.length,
        caloriesBurned,
        averageDurationMinutes: recent.length ? round(totalMinutes / recent.length) : 0,
        mostFrequentType,
      },
      records: recent,
      dailyMinutes: [...daily.entries()]
        .map(([date, minutes]) => ({ date, minutes }))
        .sort((a, b) => b.date.localeCompare(a.date)),
    }
  },

  async getRecords(limit = 100) {
    const { data } = await activityApi.list({ pageSize: limit })
    return data
  },
}
