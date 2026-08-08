import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Select } from '@/components/ui/Select'
import { goalsService } from '@/services/goals.service'
import { goalsApi } from '@/lib/api/goals-api'
import { goalSchema } from '@/lib/validation/goals'
import type { GoalProgress, HealthGoal, GoalType } from '@/types/goals'
import { formatDate } from '@/lib/utils/date'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils/cn'

const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  weight: 'Weight',
  activity: 'Activity',
  sleep: 'Sleep',
  nutrition: 'Nutrition',
  habit: 'Habit',
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalProgress[]>([])
  const [allGoals, setAllGoals] = useState<HealthGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<HealthGoal | null>(null)
  const toast = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const [progress, all] = await Promise.all([goalsService.getAllProgress(), goalsApi.list({ pageSize: 100 })])
      setGoals(progress)
      setAllGoals(all.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (goal: HealthGoal) => {
    if (!window.confirm(`Delete the goal "${goal.title}"?`)) return
    try {
      await goalsApi.delete(goal.id)
      toast.success('Goal deleted', 'The goal was removed.')
      await load()
    } catch (err) {
      toast.error('Failed to delete', err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (goal: HealthGoal) => {
    setEditing(goal)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Health Goals</h1>
          <p className="mt-1 text-sm text-surface-500">Set targets and track your progress.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New goal
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="p-5 space-y-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-full" />
            </Card>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card className="py-12 text-center">
          <CardDescription className="text-base">No active goals yet.</CardDescription>
          <div className="mt-6">
            <Button onClick={openCreate}>Create your first goal</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {goals.map(({ goal, percentComplete, onTrack, daysRemaining }) => (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="primary">{GOAL_TYPE_LABELS[goal.type]}</Badge>
                  <div className="flex items-center gap-1">
                    <Badge variant={onTrack ? 'success' : 'warning'}>{onTrack ? 'On track' : 'Off track'}</Badge>
                    <button
                      onClick={() => openEdit(goal)}
                      className="rounded p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors"
                      aria-label={`Edit goal ${goal.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal)}
                      className="rounded p-1.5 text-surface-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      aria-label={`Delete goal ${goal.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <CardTitle className="mt-3">{goal.title}</CardTitle>
                <CardDescription>{goal.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ProgressBar value={percentComplete} variant={onTrack ? 'primary' : 'warning'} showLabel />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">
                    {goal.currentValue} / {goal.targetValue} {goal.unit}
                  </span>
                  <span className="text-surface-400">
                    {daysRemaining !== undefined && daysRemaining >= 0
                      ? `${daysRemaining} days left`
                      : goal.endDate
                        ? 'Past due'
                        : formatDate(goal.startDate)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {allGoals.some((g) => g.status !== 'active') && (
        <Card>
          <CardHeader>
            <CardTitle>Archived Goals</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-surface-100">
              {allGoals
                .filter((g) => g.status !== 'active')
                .map((g) => (
                  <li key={g.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-surface-700">{g.title}</p>
                      <p className="text-xs text-surface-400">
                        {formatDate(g.startDate)} · {g.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">{g.status}</Badge>
                      <button
                        onClick={() => openEdit(g)}
                        className="rounded p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors"
                        aria-label={`Edit goal ${g.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <GoalFormModal
        open={modalOpen}
        goal={editing}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />
    </div>
  )
}

function GoalFormModal({
  open,
  goal,
  onClose,
  onSaved,
}: {
  open: boolean
  goal: HealthGoal | null
  onClose: () => void
  onSaved: () => void
}) {
  const [type, setType] = useState<GoalType>('weight')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [currentValue, setCurrentValue] = useState('')
  const [unit, setUnit] = useState('kg')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<HealthGoal['status']>('active')
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (open) {
      setType(goal?.type ?? 'weight')
      setTitle(goal?.title ?? '')
      setDescription(goal?.description ?? '')
      setTargetValue(goal ? String(goal.targetValue) : '')
      setCurrentValue(goal ? String(goal.currentValue) : '')
      setUnit(goal?.unit ?? 'kg')
      setEndDate(goal?.endDate ?? '')
      setStatus(goal?.status ?? 'active')
    }
  }, [open, goal])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const target = Number(targetValue)
    if (!targetValue || target <= 0) {
      toast.warning('Invalid target', 'The target value must be greater than zero.')
      return
    }
    const payload = {
      type,
      title,
      description: description || undefined,
      targetValue: target,
      currentValue: Number(currentValue || 0),
      unit,
      startDate: goal?.startDate ?? new Date().toISOString().slice(0, 10),
      endDate: endDate || undefined,
      status,
    }
    const parsed = goalSchema.safeParse(payload)
    if (!parsed.success) {
      toast.error('Invalid goal', parsed.error.issues[0]?.message ?? 'Check the form values.')
      return
    }
    setSaving(true)
    try {
      if (goal) {
        await goalsApi.update(goal.id, payload)
        toast.success('Goal updated', 'Your goal was saved.')
      } else {
        await goalsApi.create(payload)
        toast.success('Goal created', 'Your new target is set.')
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
      title={goal ? 'Edit goal' : 'Create a goal'}
      description={goal ? 'Update this health target' : 'Set a new health target'}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Goal type</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {(Object.keys(GOAL_TYPE_LABELS) as GoalType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t)
                  setUnit(t === 'weight' ? 'kg' : t === 'activity' ? 'sessions' : t === 'sleep' ? 'hrs/night' : 'units')
                }}
                className={cn(
                  'rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
                  type === t
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-surface-300 text-surface-600 hover:bg-surface-50'
                )}
              >
                {GOAL_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="goal-title">Title</label>
          <input
            id="goal-title"
            className="input"
            placeholder="e.g. Reach 75 kg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="goal-description">Description (optional)</label>
          <textarea
            id="goal-description"
            rows={2}
            className="input resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="goal-target">Target value</label>
            <input
              id="goal-target"
              type="number"
              min={1}
              step={0.1}
              className="input"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="goal-current">Current value</label>
            <input
              id="goal-current"
              type="number"
              min={0}
              step={0.1}
              className="input"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="goal-unit">Unit</label>
            <input id="goal-unit" className="input" value={unit} onChange={(e) => setUnit(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="goal-end">Target date (optional)</label>
            <input
              id="goal-end"
              type="date"
              className="input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        {goal && (
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as HealthGoal['status'])}>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </Select>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{goal ? 'Update goal' : 'Create goal'}</Button>
        </div>
      </form>
    </Modal>
  )
}
