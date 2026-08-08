import type { SleepRecord, SleepSummary } from '@/types/sleep'
import { sleepApi } from '@/lib/api/sleep-api'
import { round } from '@/lib/utils/format-number'

export interface SleepPeriodSummary {
  summary: SleepSummary
  records: SleepRecord[]
}

export const sleepService = {
  async getSummary(days = 30): Promise<SleepPeriodSummary | null> {
    const { data } = await sleepApi.list({ pageSize: 1000 })
    if (data.length === 0) return null
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const recent = data.filter((r) => new Date(r.date) >= cutoff)
    if (recent.length === 0) return null

    const averageDuration = recent.reduce((sum, r) => sum + r.durationHours, 0) / recent.length
    const averageQuality = recent.reduce((sum, r) => sum + r.quality, 0) / recent.length
    const totalSleepHours = recent.reduce((sum, r) => sum + r.durationHours, 0)
    const sleepDebt = Math.max(0, days * 7.5 - totalSleepHours)
    const bestDay = recent.reduce((best, r) => (r.quality > best.quality ? r : best), recent[0]).date

    return {
      summary: {
        averageDurationHours: round(averageDuration, 2),
        averageQuality: round(averageQuality, 1),
        totalSleepHours: round(totalSleepHours, 1),
        sleepDebtHours: round(sleepDebt, 1),
        bestDay,
      },
      records: recent,
    }
  },

  async getRecords(limit = 100) {
    const { data } = await sleepApi.list({ pageSize: limit })
    return data
  },
}
