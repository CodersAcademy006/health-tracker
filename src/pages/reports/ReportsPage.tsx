import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { healthService } from '@/services/health.service'
import { LineChart } from '@/components/ui/LineChart'
import { getMetricDefinition, isInNormalRange } from '@/lib/health/metric-definitions'
import { formatDecimal } from '@/lib/utils/format-number'

export default function ReportsPage() {
  const [series, setSeries] = useState<Awaited<ReturnType<typeof healthService.getOverview>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    healthService
      .getOverview()
      .then((s) => setSeries(s))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-48 mt-4" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Reports & Trends</h1>
        <p className="mt-1 text-sm text-surface-500">Your health data over the last 30 days.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {series.map((s) => {
          const def = getMetricDefinition(s.metric.type)
          const inRange = isInNormalRange(s.metric.type, s.metric.value)
          return (
            <Card key={s.metric.type}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{def.label}</CardTitle>
                  <Badge variant={inRange ? 'success' : 'warning'}>
                    {inRange ? 'Normal' : 'Attention'}
                  </Badge>
                </div>
                <CardDescription>
                  Avg {formatDecimal(s.stats?.average ?? 0)} {def.unit} · Min {formatDecimal(s.stats?.min ?? 0)} · Max{' '}
                  {formatDecimal(s.stats?.max ?? 0)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={s.history.map((m) => ({ x: m.recordedAt, y: m.value }))}
                  color={inRange ? '#16a34a' : '#d97706'}
                  unit={def.unit}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
