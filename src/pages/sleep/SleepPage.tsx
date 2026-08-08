import { useEffect, useState } from 'react'
import { Moon, Star, Timer, CalendarCheck, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { sleepService, type SleepPeriodSummary } from '@/services/sleep.service'
import { sleepApi } from '@/lib/api/sleep-api'
import { formatDate } from '@/lib/utils/date'
import type { SleepRecord } from '@/types/sleep'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils/cn'

export default function SleepPage() {
  const [summary, setSummary] = useState<SleepPeriodSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SleepRecord | null>(null)
  const toast = useToast()

  const load = async () => {
    setLoading(true)
    const s = await sleepService.getSummary(30)
    setSummary(s)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (record: SleepRecord) => {
    if (!window.confirm('Delete this sleep record?')) return
    try {
      await sleepApi.delete(record.id)
      toast.success('Sleep record deleted', 'The record was removed.')
      await load()
    } catch (err) {
      toast.error('Failed to delete', err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (record: SleepRecord) => {
    setEditing(record)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Sleep</h1>
          <p className="mt-1 text-sm text-surface-500">Monitor your sleep quality and patterns.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Log sleep
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)
        ) : summary ? (
          <>
            <SleepStat icon={<Moon className="h-5 w-5" />} label="Avg duration" value={`${summary.summary.averageDurationHours} hrs`} color="bg-indigo-50 text-indigo-600" />
            <SleepStat icon={<Star className="h-5 w-5" />} label="Avg quality" value={`${summary.summary.averageQuality}/5`} color="bg-yellow-50 text-yellow-600" />
            <SleepStat icon={<Timer className="h-5 w-5" />} label="Sleep debt" value={`${summary.summary.sleepDebtHours} hrs`} color="bg-red-50 text-red-600" />
            <SleepStat icon={<CalendarCheck className="h-5 w-5" />} label="Best night" value={formatDate(summary.summary.bestDay, 'MMM d')} color="bg-green-50 text-green-600" />
          </>
        ) : (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nightly Sleep Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : summary && summary.records.length > 0 ? (
            <ul className="divide-y divide-surface-100">
              {summary.records.slice(0, 14).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-surface-900">{formatDate(r.date)}</p>
                    <p className="truncate text-xs text-surface-400">
                      {r.durationHours} hrs · Deep {r.deepSleepHours} · REM {r.remSleepHours}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden sm:flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={cn(
                            'h-2 w-2 rounded-full',
                            i < r.quality ? 'bg-yellow-400' : 'bg-surface-200'
                          )}
                        />
                      ))}
                    </span>
                    <Badge variant={r.durationHours >= 7 ? 'success' : r.durationHours >= 6 ? 'warning' : 'danger'}>
                      {r.durationHours >= 7 ? 'Good' : r.durationHours >= 6 ? 'Okay' : 'Short'}
                    </Badge>
                    <button
                      onClick={() => openEdit(r)}
                      className="rounded p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors"
                      aria-label={`Edit sleep record for ${r.date}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(r)}
                      className="rounded p-1.5 text-surface-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      aria-label={`Delete sleep record for ${r.date}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-sm text-surface-500">No sleep data recorded yet.</p>
          )}
        </CardContent>
      </Card>

      <SleepFormModal
        open={modalOpen}
        record={editing}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />
    </div>
  )
}

function SleepStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg', color)}>{icon}</span>
        <div>
          <p className="text-sm text-surface-500">{label}</p>
          <p className="text-xl font-bold text-surface-900">{value}</p>
        </div>
      </div>
    </Card>
  )
}

function SleepFormModal({
  open,
  record,
  onClose,
  onSaved,
}: {
  open: boolean
  record: SleepRecord | null
  onClose: () => void
  onSaved: () => void
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [duration, setDuration] = useState(7.5)
  const [quality, setQuality] = useState(4)
  const [deepSleep, setDeepSleep] = useState(1.5)
  const [remSleep, setRemSleep] = useState(1.8)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (open) {
      setDate(record?.date ?? new Date().toISOString().slice(0, 10))
      setDuration(record?.durationHours ?? 7.5)
      setQuality(record?.quality ?? 4)
      setDeepSleep(record?.deepSleepHours ?? 1.5)
      setRemSleep(record?.remSleepHours ?? 1.8)
    }
  }, [open, record])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const start = new Date(`${date}T22:00:00`)
      const end = new Date(start.getTime() + duration * 3600 * 1000)
      const payload = {
        date,
        sleepStart: start.toISOString(),
        sleepEnd: end.toISOString(),
        durationHours: Number(duration),
        quality: Number(quality) as SleepRecord['quality'],
        deepSleepHours: Number(deepSleep),
        remSleepHours: Number(remSleep),
        awakeTimeMinutes: 10,
      }
      if (record) {
        await sleepApi.update(record.id, payload)
        toast.success('Sleep record updated', 'The record was saved.')
      } else {
        await sleepApi.create(payload)
        toast.success('Sleep logged', 'Your night was recorded.')
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
      title={record ? 'Edit sleep record' : 'Log sleep'}
      description={record ? 'Update this night of sleep' : 'Record last night of sleep'}
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="sleep-duration">Duration (hours)</label>
            <input
              id="sleep-duration"
              type="number"
              min={1}
              max={24}
              step={0.1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="input"
              required
            />
          </div>
          <Select label="Quality" value={quality} onChange={(e) => setQuality(Number(e.target.value))}>
            <option value={1}>1 · Poor</option>
            <option value={2}>2 · Fair</option>
            <option value={3}>3 · Average</option>
            <option value={4}>4 · Good</option>
            <option value={5}>5 · Excellent</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="deep-sleep">Deep sleep (hours)</label>
            <input
              id="deep-sleep"
              type="number"
              min={0}
              max={12}
              step={0.1}
              value={deepSleep}
              onChange={(e) => setDeepSleep(Number(e.target.value))}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="rem-sleep">REM sleep (hours)</label>
            <input
              id="rem-sleep"
              type="number"
              min={0}
              max={12}
              step={0.1}
              value={remSleep}
              onChange={(e) => setRemSleep(Number(e.target.value))}
              className="input"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{record ? 'Update record' : 'Save sleep'}</Button>
        </div>
      </form>
    </Modal>
  )
}
