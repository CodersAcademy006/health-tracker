import type { ID } from './user'

export type ActivityType = 'walking' | 'running' | 'cycling' | 'swimming' | 'gym' | 'yoga' | 'other'

export interface ActivityRecord {
  id: ID
  userId: ID
  type: ActivityType
  startedAt: string
  durationMinutes: number
  distanceKm?: number
  caloriesBurned?: number
  avgHeartRate?: number
  notes?: string
}

export interface ActivitySummary {
  totalMinutes: number
  totalActivities: number
  caloriesBurned: number
  averageDurationMinutes: number
  mostFrequentType?: ActivityType
}
