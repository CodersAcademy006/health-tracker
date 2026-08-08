import type { HealthGoal, GoalProgress } from '@/types/goals'
import { goalsApi } from '@/lib/api/goals-api'
import { daysBetween } from '@/lib/utils/date'

export const goalsService = {
  async getActiveGoals(): Promise<HealthGoal[]> {
    const { data } = await goalsApi.list({ pageSize: 100 })
    return data.filter((g) => g.status === 'active')
  },

  async getGoalProgress(goal: HealthGoal): Promise<GoalProgress> {
    const target = goal.targetValue
    const current = goal.currentValue
    const percentComplete = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
    const remaining = Math.max(0, target - current)
    const daysRemaining = goal.endDate ? daysBetween(new Date().toISOString(), goal.endDate) : undefined
    const onTrack = daysRemaining !== undefined ? percentComplete >= 50 && daysRemaining > 0 : true

    return { goal, percentComplete, onTrack, remaining, daysRemaining }
  },

  async getAllProgress(): Promise<GoalProgress[]> {
    const goals = await this.getActiveGoals()
    return Promise.all(goals.map((g) => this.getGoalProgress(g)))
  },
}
