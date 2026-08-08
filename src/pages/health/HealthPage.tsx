import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { HealthMetricForm } from '@/components/health/metric-form/HealthMetricForm'
import { LineChart } from '@/components/ui/LineChart'
import { useHealthData } from '@/hooks/use-health-data'
import { getMetricDefinition, isInNormalRange } from '@/lib/health/metric-definitions'
import { formatDateTime } from '@/lib/utils/date'
import type { HealthMetric, HealthMetricType } from '@/types/health'
import { cn } from '@/lib/utils/cn'

const METRIC_TABS = [
  'weight',
  'heart_rate',
  'blood_pressure_systolic',
  'blood_glucose',
  'body_temperature',
  'blood_oxygen',
  'respiratory_rate',
  'cholesterol_total',
] as HealthMetricType[]

export default function HealthPage() {
  const [selectedType, setSelectedType] = useState<HealthMetricType>('weight')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<HealthMetric | null>(null)
  const { metrics, series, loading, createMetric, updateMetric, deleteMetric } = useHealthData(selectedType)

  const currentSeries = series
  const def = getMetricDefinition(selectedType)
  const chartData = useMemo(
    () => (currentSeries?.history ?? []).map((m) => ({ x: m.recordedAt, y: m.value })),
    [currentSeries]
  )

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (record: HealthMetric) => {
    setEditing(record)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Health Metrics</h1>
          <p className="mt-1 text-sm text-surface-500">Track and monitor your health measurements.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Log measurement
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {METRIC_TABS.map((type) => {
          const isActive = type === selectedType
          const tabDef = getMetricDefinition(type)
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary-600 bg-primary-600 text-white'
                  : 'border-surface-300 bg-white text-surface-600 hover:bg-surface-50'
              )}
            >
              {tabDef.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{def.label} Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : currentSeries ? (
              <>
                <div className="mb-4 flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-surface-900">
                    {currentSeries.metric.value} <span className="text-base font-normal text-surface-500">{def.unit}</span>
                  </span>
                  <Badge variant={isInNormalRange(selectedType, currentSeries.metric.value) ? 'success' : 'warning'}>
                    {isInNormalRange(selectedType, currentSeries.metric.value) ? 'Normal range' : 'Outside range'}
                  </Badge>
                </div>
                <LineChart data={chartData} color={isInNormalRange(selectedType, currentSeries.metric.value) ? '#16a34a' : '#d97706'} />
              </>
            ) : (
              <EmptyState
                icon={<Activity className="h-10 w-10" />}
                title={`Add your first ${def.label.toLowerCase()} reading`}
                description={`No ${def.label.toLowerCase()} data yet. Your trend chart and history will appear here after your first entry.`}
                action={<Button onClick={openCreate}>Log measurement</Button>}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : metrics.length === 0 ? (
              <p className="p-5 text-sm text-surface-500">No records yet.</p>
            ) : (
              <ul className="max-h-96 divide-y divide-surface-100 overflow-y-auto scrollbar-thin">
                {metrics.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-2 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-surface-900">
                        {m.value} {m.unit}
                      </p>
                      <p className="text-xs text-surface-400">{formatDateTime(m.recordedAt)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={isInNormalRange(m.type, m.value) ? 'success' : 'warning'}>
                        {isInNormalRange(m.type, m.value) ? 'OK' : 'Flag'}
                      </Badge>
                      <button
                        onClick={() => openEdit(m)}
                        className="rounded p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors"
                        aria-label={`Edit ${def.label.toLowerCase()} record`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteMetric(m.id)}
                        className="rounded p-1.5 text-surface-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        aria-label={`Delete ${def.label.toLowerCase()} record`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit measurement' : 'Log measurement'}
        description={`${editing ? 'Update the' : 'Record a'} ${def.label.toLowerCase()} measurement`}
      >
        <HealthMetricForm
          onSubmit={async (input) => {
            if (editing) {
              await updateMetric(editing.id, input)
            } else {
              await createMetric(input)
            }
          }}
          record={editing ?? undefined}
          initialType={selectedType}
          onSuccess={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
