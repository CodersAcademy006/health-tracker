import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { healthService, type MetricSeries } from '@/services/health.service'
import { activityService, type ActivityPeriodSummary } from '@/services/activity.service'
import { sleepService, type SleepPeriodSummary } from '@/services/sleep.service'
import type { GoalProgress } from '@/types/goals'
import { goalsService } from '@/services/goals.service'
import { healthApi } from '@/lib/api/health-api'
import type { HealthMetric } from '@/types/health'

export interface DashboardData {
  series: MetricSeries[]
  recent: HealthMetric[]
  activity: ActivityPeriodSummary | null
  sleep: SleepPeriodSummary | null
  goals: GoalProgress[]
}

export function useDashboardData() {
  const user = useAuthStore((state) => state.user)
  const [data, setData] = useState<DashboardData>({
    series: [],
    recent: [],
    activity: null,
    sleep: null,
    goals: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [overview, recentResult, activity, sleep, goals] = await Promise.all([
          healthService.getOverview(),
          healthApi.list({}, { pageSize: 5 }),
          activityService.getSummary(30),
          sleepService.getSummary(30),
          goalsService.getAllProgress(),
        ])

        if (cancelled) return
        setData({
          series: overview,
          recent: recentResult.data,
          activity,
          sleep,
          goals,
        })
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user])

  return { ...data, loading, error }
}
