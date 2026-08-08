import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Moon, Star, Timer, CalendarCheck } from 'lucide-react'
import type { SleepPeriodSummary } from '@/services/sleep.service'
import { formatDecimal } from '@/lib/utils/format-number'
import { formatDate } from '@/lib/utils/date'

interface SleepSummaryCardProps {
  summary: SleepPeriodSummary | null
  loading?: boolean
}

export function SleepSummaryCard({ summary, loading = false }: SleepSummaryCardProps) {
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
          <CardTitle>Sleep</CardTitle>
          <CardDescription>No sleep data recorded yet.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const s = summary.summary

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sleep Overview</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Moon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold text-surface-900">{formatDecimal(s.averageDurationHours, 1)} hrs</p>
            <p className="text-xs text-surface-500">Avg duration</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600">
            <Star className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold text-surface-900">{s.averageQuality}/5</p>
            <p className="text-xs text-surface-500">Avg quality</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <Timer className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold text-surface-900">{formatDecimal(s.sleepDebtHours, 1)} hrs</p>
            <p className="text-xs text-surface-500">Sleep debt</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
            <CalendarCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold text-surface-900">{formatDate(s.bestDay, 'MMM d')}</p>
            <p className="text-xs text-surface-500">Best night</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
