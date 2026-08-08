import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import type { HealthMetric } from '@/types/health'
import { getMetricDefinition, isInNormalRange } from '@/lib/health/metric-definitions'
import { formatDateTime } from '@/lib/utils/date'

interface RecentRecordsProps {
  records: HealthMetric[]
  loading?: boolean
}

export function RecentRecords({ records, loading = false }: RecentRecordsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Measurements</CardTitle>
        <CardDescription>Your latest health entries</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <p className="p-5 text-sm text-surface-500">No measurements recorded yet.</p>
        ) : (
          <ul className="divide-y divide-surface-100">
            {records.map((record) => {
              const def = getMetricDefinition(record.type)
              const inRange = isInNormalRange(record.type, record.value)
              return (
                <li key={record.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-surface-800">{def.label}</p>
                    <p className="text-xs text-surface-400">{formatDateTime(record.recordedAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-surface-900">
                      {record.value} {def.unit}
                    </span>
                    <Badge variant={inRange ? 'success' : 'warning'}>
                      {inRange ? 'Normal' : 'Check'}
                    </Badge>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
