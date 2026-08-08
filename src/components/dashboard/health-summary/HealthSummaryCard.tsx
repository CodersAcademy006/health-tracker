import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { LineChart } from '@/components/ui/LineChart'
import type { MetricSeries } from '@/services/health.service'
import { getMetricDefinition, isInNormalRange } from '@/lib/health/metric-definitions'
import { formatDecimal } from '@/lib/utils/format-number'

interface HealthSummaryCardProps {
  series: MetricSeries | null
  loading?: boolean
}

export function HealthSummaryCard({ series, loading = false }: HealthSummaryCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!series) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No data</CardTitle>
          <CardDescription>Record your first health metric to see trends.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const def = getMetricDefinition(series.metric.type)
  const inRange = isInNormalRange(series.metric.type, series.metric.value)

  const chartData = series.history.map((m) => ({ x: m.recordedAt, y: m.value }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{def.label}</CardTitle>
        <CardDescription>
          <span className={inRange ? 'text-green-600' : 'text-yellow-600'}>
            {inRange ? 'In normal range' : 'Outside normal range'}
          </span>
          {' · '}Last {series.stats?.count ?? 0} records
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-surface-900">
            {formatDecimal(series.metric.value)}
          </span>
          <span className="text-sm text-surface-500">{def.unit}</span>
          {series.percentageChange !== 0 && (
            <span
              className={`text-sm font-medium ${
                series.percentageChange > 0 ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {series.percentageChange > 0 ? '+' : ''}
              {formatDecimal(series.percentageChange)}%
            </span>
          )}
        </div>
        <LineChart data={chartData} color={inRange ? '#16a34a' : '#d97706'} unit={def.unit} />
      </CardContent>
    </Card>
  )
}
