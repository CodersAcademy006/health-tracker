import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/use-toast'
import { reminderApi, type CreateReminderInput } from '@/lib/api/reminder-api'
import type { Reminder, ReminderCategory, ReminderFrequency } from '@/types/reminder'
import { cn } from '@/lib/utils/cn'

const CATEGORY_LABELS: Record<ReminderCategory, string> = {
  habit: 'Habit',
  tracker: 'Tracker',
  activity: 'Activity',
  sleep: 'Sleep',
  goal: 'Goal',
}

const FREQUENCY_LABELS: Record<ReminderFrequency, string> = {
  daily: 'Every day',
  weekdays: 'Weekdays',
  weekends: 'Weekends',
}

const DEFAULT_REMINDERS: CreateReminderInput[] = [
  {
    title: 'Log today weight',
    message: 'Keep your weight tracker up to date.',
    category: 'tracker',
    time: '08:00',
    frequency: 'daily',
    browserNotification: false,
    enabled: true,
  },
  {
    title: 'Morning walk',
    message: 'A 20 minute walk keeps your activity goal moving.',
    category: 'activity',
    time: '12:30',
    frequency: 'daily',
    browserNotification: false,
    enabled: true,
  },
  {
    title: 'Wind down for sleep',
    message: 'Aim for 7.5 hours tonight. Switch off screens soon.',
    category: 'sleep',
    time: '21:30',
    frequency: 'daily',
    browserNotification: false,
    enabled: true,
  },
]

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const toast = useToast()
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [height, setHeight] = useState('178')
  const [weight, setWeight] = useState('76')
  const [activityLevel, setActivityLevel] = useState('moderate')

  const [reminders, setReminders] = useState<Reminder[]>([])
  const [remindersLoaded, setRemindersLoaded] = useState(false)
  const [form, setForm] = useState<CreateReminderInput>({
    title: '',
    message: '',
    category: 'habit',
    time: '08:00',
    frequency: 'daily',
    browserNotification: false,
    enabled: true,
  })

  const loadReminders = async () => {
    setReminders(await reminderApi.list())
    setRemindersLoaded(true)
  }

  useEffect(() => {
    loadReminders()
  }, [])

  const saveProfile = (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    updateProfile({
      firstName: firstName.trim() || user.firstName,
      lastName: lastName.trim() || user.lastName,
      email: email.trim() || user.email,
    })
    toast.success('Profile updated', 'Your profile was saved successfully.')
  }

  const saveUnits = (e: FormEvent) => {
    e.preventDefault()
    toast.success('Settings saved', 'Unit preferences updated.')
  }

  const updateForm = (field: keyof CreateReminderInput) => (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = field === 'browserNotification' ? (e.target as HTMLInputElement).checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const addReminder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.warning('Title required', 'Give the reminder a short title.')
      return
    }
    const created = await reminderApi.create({
      ...form,
      title: form.title.trim(),
      message: form.message?.trim() || undefined,
    })
    setReminders((prev) => [...prev, created].sort((a, b) => a.time.localeCompare(b.time)))
    setForm((prev) => ({ ...prev, title: '', message: '' }))
    toast.success('Reminder created', `"${created.title}" is scheduled for ${created.time}.`)
  }

  const toggleReminder = async (reminder: Reminder) => {
    const updated = await reminderApi.update(reminder.id, { enabled: !reminder.enabled })
    setReminders((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    toast.info(updated.enabled ? 'Reminder enabled' : 'Reminder paused', `"${updated.title}" was ${updated.enabled ? 'turned on' : 'turned off'}.`)
  }

  const deleteReminder = async (reminder: Reminder) => {
    if (!window.confirm(`Delete the reminder "${reminder.title}"?`)) return
    await reminderApi.delete(reminder.id)
    setReminders((prev) => prev.filter((r) => r.id !== reminder.id))
    toast.success('Reminder deleted', 'The reminder was removed.')
  }

  const addDemoReminders = async () => {
    for (const r of DEFAULT_REMINDERS) {
      await reminderApi.create(r)
    }
    await loadReminders()
    toast.success('Reminders added', 'Sample reminders were added for you.')
  }

  const requestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (window.Notification.permission === 'default') {
        await window.Notification.requestPermission()
      }
      if (window.Notification.permission === 'granted') {
        toast.success('Browser notifications on', 'Reminders can show even when the tab is in the background.')
      } else {
        toast.info('Permission not granted', 'Reminders will still appear inside the app.')
      }
    } else {
      toast.info('Not supported', 'This browser does not support desktop notifications.')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
        <p className="mt-1 text-sm text-surface-500">Manage your profile, reminders, and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Height (cm)" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
              <Input label="Weight (kg)" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <Select label="Activity level" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
              <option value="sedentary">Sedentary</option>
              <option value="light">Lightly active</option>
              <option value="moderate">Moderately active</option>
              <option value="active">Active</option>
              <option value="very_active">Very active</option>
            </Select>
            <div className="flex justify-end">
              <Button type="submit">Save profile</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          action={
            remindersLoaded && reminders.length === 0 ? (
              <Button variant="outline" size="sm" onClick={addDemoReminders}>
                Add sample reminders
              </Button>
            ) : undefined
          }
        >
          <CardTitle>Reminders and Alarms</CardTitle>
          <CardDescription>
            Schedule alarms for your habits and trackers. They appear in your notification bell and can also
            pop up as desktop notifications when the app is open.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {!remindersLoaded ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-surface-200 p-3">
                  <div className="space-y-2">
                    <div className="h-3 w-32 animate-pulse rounded bg-surface-200" />
                    <div className="h-2.5 w-20 animate-pulse rounded bg-surface-200" />
                  </div>
                  <div className="h-5 w-10 animate-pulse rounded bg-surface-200" />
                </div>
              ))}
            </div>
          ) : reminders.length === 0 ? (
            <p className="rounded-lg border border-dashed border-surface-300 p-4 text-center text-sm text-surface-500">
              No reminders yet. Create one below to get started.
            </p>
          ) : (
            <ul className="divide-y divide-surface-100 rounded-lg border border-surface-200">
              {reminders.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn('truncate text-sm font-medium text-surface-900', !r.enabled && 'text-surface-400 line-through')}>
                        {r.title}
                      </p>
                      <Badge variant="neutral">{CATEGORY_LABELS[r.category]}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-surface-500">
                      {r.time} · {FREQUENCY_LABELS[r.frequency]}
                      {r.browserNotification && ' · desktop'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => toggleReminder(r)}
                      role="switch"
                      aria-checked={r.enabled}
                      aria-label={`Toggle reminder ${r.title}`}
                      className={cn(
                        'relative h-5 w-9 rounded-full transition-colors',
                        r.enabled ? 'bg-primary-600' : 'bg-surface-300'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
                          r.enabled ? 'left-[18px]' : 'left-0.5'
                        )}
                      />
                    </button>
                    <button
                      onClick={() => deleteReminder(r)}
                      className="rounded p-1.5 text-surface-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      aria-label={`Delete reminder ${r.title}`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={addReminder} className="space-y-4 rounded-lg border border-surface-200 bg-surface-50 p-4">
            <p className="text-sm font-semibold text-surface-800">New reminder</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Title"
                placeholder="e.g. Drink water"
                value={form.title}
                onChange={updateForm('title')}
              />
              <Input
                label="Message (optional)"
                placeholder="A short note"
                value={form.message ?? ''}
                onChange={updateForm('message')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Select label="Category" value={form.category} onChange={updateForm('category')}>
                {(Object.keys(CATEGORY_LABELS) as ReminderCategory[]).map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </Select>
              <div>
                <label className="label" htmlFor="reminder-time">Time</label>
                <input
                  id="reminder-time"
                  type="time"
                  className="input"
                  value={form.time}
                  onChange={updateForm('time')}
                  required
                />
              </div>
              <Select label="Frequency" value={form.frequency} onChange={updateForm('frequency')}>
                {(Object.keys(FREQUENCY_LABELS) as ReminderFrequency[]).map((f) => (
                  <option key={f} value={f}>
                    {FREQUENCY_LABELS[f]}
                  </option>
                ))}
              </Select>
              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-surface-700">
                  <input
                    type="checkbox"
                    checked={form.browserNotification}
                    onChange={updateForm('browserNotification')}
                    className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                  />
                  Desktop alert
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={requestBrowserPermission}
                className="text-xs font-medium text-primary-600 hover:text-primary-700"
              >
                Enable desktop notifications
              </button>
              <Button type="submit" size="sm">
                Add reminder
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Display and unit preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveUnits} className="space-y-4">
            <Select label="Weight unit" defaultValue="metric">
              <option value="metric">Kilograms (kg)</option>
              <option value="imperial">Pounds (lbs)</option>
            </Select>
            <Select label="Distance unit" defaultValue="km">
              <option value="km">Kilometers</option>
              <option value="mi">Miles</option>
            </Select>
            <div className="flex justify-end">
              <Button type="submit">Save preferences</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
