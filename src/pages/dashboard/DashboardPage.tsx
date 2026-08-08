import { useNavigate } from 'react-router-dom'
import { Plus, Activity, HeartPulse } from 'lucide-react'
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
import { Heart, Moon, Weight } from 'lucide-react'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { series, recent, activity, sleep, goals, loading } = useDashboardData()

  const latestSeries = series.slice(0, 4)
  const hasNoData = !loading && series.length === 0 && recent.length === 0 && !activity && !sleep && goals.length === 0

  const weightSeries = series.find((s) => s.metric.type === 'weight')
  const heartSeries = series.find((s) => s.metric.type === 'heart_rate')

  const primaryMetrics = [
    {
      title: 'Weight',
      value: weightSeries ? formatDecimal(weightSeries.metric.value) : '—',
      unit: 'kg',
      icon: <Weight className="h-5 w-5" />,
      change: weightSeries ? weightSeries.percentageChange : undefined,
      isPercent: true,
      trend: weightSeries
        ? weightSeries.percentageChange > 0
          ? ('up' as const)
          : weightSeries.percentageChange < 0
            ? ('down' as const)
            : ('neutral' as const)
        : ('neutral' as const),
      tone: weightSeries
        ? weightSeries.percentageChange > 0
          ? ('bad' as const)
          : weightSeries.percentageChange < 0
            ? ('good' as const)
            : ('neutral' as const)
        : ('neutral' as const),
    },
    {
      title: 'Heart Rate',
      value: heartSeries ? heartSeries.metric.value : '—',
      unit: 'bpm',
      icon: <Heart className="h-5 w-5" />,
      change: heartSeries ? heartSeries.percentageChange : undefined,
      isPercent: true,
      trend: heartSeries
        ? heartSeries.percentageChange > 0
          ? ('up' as const)
          : heartSeries.percentageChange < 0
            ? ('down' as const)
            : ('neutral' as const)
        : ('neutral' as const),
      tone: heartSeries
        ? heartSeries.percentageChange > 0
          ? ('bad' as const)
          : heartSeries.percentageChange < 0
            ? ('good' as const)
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
      tone: 'good' as const,
    },
    {
      title: 'Sleep',
      value: sleep ? sleep.summary.averageDurationHours : '—',
      unit: 'hrs',
      icon: <Moon className="h-5 w-5" />,
      change: sleep ? sleep.summary.sleepDebtHours : undefined,
      changeLabel: 'hrs debt',
      tone: 'neutral' as const,
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

      {hasNoData && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white">
              <HeartPulse className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-surface-900">
                Welcome to Vitalis, {user?.firstName ?? 'there'}
              </h2>
              <p className="mt-1 text-sm text-surface-600">
                Your account is ready. Add your first health measurement, activity, or sleep record and
                Vitalis will build your trends and summaries from your own data.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => navigate('/health')}>Log a measurement</Button>
                <Button size="sm" variant="outline" onClick={() => navigate('/activity')}>Log an activity</Button>
                <Button size="sm" variant="outline" onClick={() => navigate('/sleep')}>Log sleep</Button>
                <Button size="sm" variant="outline" onClick={() => navigate('/goals')}>Set a goal</Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
