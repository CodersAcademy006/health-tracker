import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/dashboard/StatCard'
import { ActivitySummaryCard } from '@/components/dashboard/activity-summary/ActivitySummaryCard'
import { SleepSummaryCard } from '@/components/dashboard/sleep-summary/SleepSummaryCard'
import { GoalsOverview } from '@/components/dashboard/goals-overview/GoalsOverview'
import { RecentRecords } from '@/components/dashboard/recent-records/RecentRecords'
import { HealthSummaryCard } from '@/components/dashboard/health-summary/HealthSummaryCard'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { useAuth } from '@/hooks/use-auth'
import { formatDecimal } from '@/lib/utils/format-number'
import { Heart, Activity, Moon, Weight } from 'lucide-react'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { series, recent, activity, sleep, goals, loading } = useDashboardData()

  const latestSeries = series.slice(0, 4)

  const weightSeries = series.find((s) => s.metric.type === 'weight')
  const heartSeries = series.find((s) => s.metric.type === 'heart_rate')

  const primaryMetrics = [
    {
      title: 'Weight',
      value: weightSeries ? formatDecimal(weightSeries.metric.value) : '—',
      unit: 'kg',
      icon: <Weight className="h-5 w-5" />,
      change: weightSeries ? weightSeries.percentageChange : undefined,
      trend: weightSeries
        ? weightSeries.percentageChange > 0
          ? ('down' as const)
          : weightSeries.percentageChange < 0
            ? ('up' as const)
            : ('neutral' as const)
        : ('neutral' as const),
    },
    {
      title: 'Heart Rate',
      value: heartSeries ? heartSeries.metric.value : '—',
      unit: 'bpm',
      icon: <Heart className="h-5 w-5" />,
      change: heartSeries ? heartSeries.percentageChange : undefined,
      trend: heartSeries
        ? heartSeries.percentageChange > 0
          ? ('down' as const)
          : heartSeries.percentageChange < 0
            ? ('up' as const)
            : ('neutral' as const)
        : ('neutral' as const),
    },
    {
      title: 'Activity',
      value: activity ? activity.summary.totalActivities : 0,
      unit: 'sessions',
      icon: <Activity className="h-5 w-5" />,
      change: activity ? Math.min(activity.summary.averageDurationMinutes, 100) : undefined,
      changeLabel: 'avg minutes',
      trend: 'up' as const,
    },
    {
      title: 'Sleep',
      value: sleep ? sleep.summary.averageDurationHours : '—',
      unit: 'hrs',
      icon: <Moon className="h-5 w-5" />,
      change: sleep ? sleep.summary.sleepDebtHours : undefined,
      changeLabel: 'hrs debt',
      trend: 'neutral' as const,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            Welcome back, {user?.firstName ?? 'there'}
          </h1>
          <p className="mt-1 text-sm text-surface-500">Here's your health overview for today.</p>
        </div>
        <Button onClick={() => navigate('/health')}>
          <Plus className="h-4 w-4" />
          Log measurement
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primaryMetrics.map((m) => (
          <StatCard key={m.title} {...m} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {latestSeries.slice(0, 2).map((s) => (
              <HealthSummaryCard key={s.metric.type} series={s} loading={loading} />
            ))}
          </div>
          <RecentRecords records={recent} loading={loading} />
        </div>
        <div className="space-y-6">
          <ActivitySummaryCard summary={activity} loading={loading} />
          <SleepSummaryCard summary={sleep} loading={loading} />
          <GoalsOverview goals={goals} loading={loading} />
        </div>
      </div>
    </div>
  )
}
