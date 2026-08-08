import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Activity, Flame, Timer, Trophy } from 'lucide-react'
import type { ActivityPeriodSummary } from '@/services/activity.service'
import { formatNumber } from '@/lib/utils/format-number'

interface ActivitySummaryCardProps {
  summary: ActivityPeriodSummary | null
  loading?: boolean
}

export function ActivitySummaryCard({ summary, loading = false }: ActivitySummaryCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>No activity recorded yet.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const stats = summary.summary

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Overview</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
            <Timer className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold text-surface-900">{formatNumber(stats.totalMinutes)} min</p>
            <p className="text-xs text-surface-500">Total time</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <Flame className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold text-surface-900">{formatNumber(stats.caloriesBurned)}</p>
            <p className="text-xs text-surface-500">Calories</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Activity className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold text-surface-900">{formatNumber(stats.totalActivities)}</p>
            <p className="text-xs text-surface-500">Sessions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600">
            <Trophy className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold text-surface-900 capitalize">{stats.mostFrequentType ?? '—'}</p>
            <p className="text-xs text-surface-500">Most frequent</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
