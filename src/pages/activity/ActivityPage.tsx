import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { activityService, type ActivityPeriodSummary } from '@/services/activity.service'
import { activityApi } from '@/lib/api/activity-api'
import { activityRecordSchema } from '@/lib/validation/activity'
import { formatDateTime } from '@/lib/utils/date'
import type { ActivityRecord, ActivityType } from '@/types/activity'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils/cn'

const TYPE_LABELS: Record<ActivityType, string> = {
  walking: 'Walking',
  running: 'Running',
  cycling: 'Cycling',
  swimming: 'Swimming',
  gym: 'Gym',
  yoga: 'Yoga',
  other: 'Other',
}

export default function ActivityPage() {
  const [summary, setSummary] = useState<ActivityPeriodSummary | null>(null)
  const [records, setRecords] = useState<ActivityRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ActivityRecord | null>(null)
  const toast = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const [s, r] = await Promise.all([activityService.getSummary(30), activityApi.list({ pageSize: 50 })])
      setSummary(s)
      setRecords(r.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (record: ActivityRecord) => {
    if (!window.confirm('Delete this activity record?')) return
    try {
      await activityApi.delete(record.id)
      toast.success('Activity deleted', 'The record was removed.')
      await load()
    } catch (err) {
      toast.error('Failed to delete', err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (record: ActivityRecord) => {
    setEditing(record)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Activity</h1>
          <p className="mt-1 text-sm text-surface-500">Track your workouts and daily movement.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Log activity
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <SummaryStat label="Total minutes" value={summary?.summary.totalMinutes ?? 0} unit="min" />
            <SummaryStat label="Sessions" value={summary?.summary.totalActivities ?? 0} unit="" />
            <SummaryStat label="Calories" value={summary?.summary.caloriesBurned ?? 0} unit="kcal" />
            <SummaryStat
              label="Avg duration"
              value={summary?.summary.averageDurationMinutes ?? 0}
              unit="min"
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <EmptyState
              icon={<Activity className="h-10 w-10" />}
              title="Log your first activity"
              description="Record a run, a cycling session, a swim, or a gym workout. Your activity summary and history will appear here after your first entry."
              action={<Button onClick={openCreate}>Log activity</Button>}
            />
          ) : (
            <ul className="divide-y divide-surface-100">
              {records.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold uppercase',
                        'bg-primary-50 text-primary-700'
                      )}
                    >
                      {r.type.slice(0, 2)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-surface-900">
                        {TYPE_LABELS[r.type]}
                        <span className="ml-2 text-xs font-normal text-surface-500">
                          {r.distanceKm !== undefined && `${r.distanceKm} km`}
                        </span>
                      </p>
                      <p className="truncate text-xs text-surface-400">
                        {formatDateTime(r.startedAt)} · {r.durationMinutes} min
                        {r.caloriesBurned !== undefined && ` · ${r.caloriesBurned} kcal`}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="neutral">{r.type}</Badge>
                    <button
                      onClick={() => openEdit(r)}
                      className="rounded p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors"
                      aria-label={`Edit ${r.type} record`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(r)}
                      className="rounded p-1.5 text-surface-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      aria-label={`Delete ${r.type} record`}
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

      <ActivityFormModal
        open={modalOpen}
        record={editing}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />
    </div>
  )
}

function SummaryStat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-surface-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-surface-900">
        {value.toLocaleString()} <span className="text-sm font-normal text-surface-500">{unit}</span>
      </p>
    </Card>
  )
}

function ActivityFormModal({
  open,
  record,
  onClose,
  onSaved,
}: {
  open: boolean
  record: ActivityRecord | null
  onClose: () => void
  onSaved: () => void
}) {
  const [type, setType] = useState<ActivityType>('walking')
  const [duration, setDuration] = useState(30)
  const [calories, setCalories] = useState(150)
  const [distance, setDistance] = useState('')
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (open) {
      setType(record?.type ?? 'walking')
      setDuration(record?.durationMinutes ?? 30)
      setCalories(record?.caloriesBurned ?? 150)
      setDistance(record?.distanceKm !== undefined ? String(record.distanceKm) : '')
    }
  }, [open, record])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      type,
      startedAt: record?.startedAt ?? new Date().toISOString(),
      durationMinutes: Number(duration),
      caloriesBurned: Number(calories),
      distanceKm: distance ? Number(distance) : undefined,
    }
    const parsed = activityRecordSchema.safeParse(payload)
    if (!parsed.success) {
      toast.error('Invalid activity', parsed.error.issues[0]?.message ?? 'Check the form values.')
      return
    }
    setSaving(true)
    try {
      if (record) {
        await activityApi.update(record.id, payload)
        toast.success('Activity updated', 'The record was saved.')
      } else {
        await activityApi.create(payload)
        toast.success('Activity logged', 'Your session was recorded.')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error('Failed to save', err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={record ? 'Edit activity' : 'Log activity'}
      description={record ? 'Update this workout session' : 'Record a new workout session'}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Activity type</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.keys(TYPE_LABELS) as ActivityType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  type === t
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-surface-300 text-surface-600 hover:bg-surface-50'
                )}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="duration">Duration (min)</label>
            <input
              id="duration"
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="calories">Calories burned</label>
            <input
              id="calories"
              type="number"
              min={0}
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              className="input"
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="distance">Distance (km, optional)</label>
          <input
            id="distance"
            type="number"
            min={0}
            step={0.1}
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="input"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{record ? 'Update activity' : 'Save activity'}</Button>
        </div>
      </form>
    </Modal>
  )
}
