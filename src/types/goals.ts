import type { ID } from './user'

export type GoalType = 'weight' | 'activity' | 'sleep' | 'nutrition' | 'habit'

export type GoalStatus = 'active' | 'completed' | 'archived'

export interface HealthGoal {
  id: ID
  userId: ID
  type: GoalType
  title: string
  description?: string
  targetValue: number
  currentValue: number
  unit: string
  startDate: string
  endDate?: string
  status: GoalStatus
  progress: number
  createdAt: string
  updatedAt: string
}

export interface GoalProgress {
  goal: HealthGoal
  percentComplete: number
  onTrack: boolean
  remaining: number
  daysRemaining?: number
}
