import type { ID } from './user'

export interface SleepRecord {
  id: ID
  userId: ID
  date: string
  sleepStart: string
  sleepEnd: string
  durationHours: number
  quality: 1 | 2 | 3 | 4 | 5
  deepSleepHours?: number
  remSleepHours?: number
  awakeTimeMinutes?: number
  heartRateAvg?: number
  notes?: string
}

export interface SleepSummary {
  averageDurationHours: number
  averageQuality: number
  totalSleepHours: number
  sleepDebtHours: number
  bestDay: string
}
