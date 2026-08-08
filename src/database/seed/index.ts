import type { HealthMetric } from '@/types/health'
import type { ActivityRecord } from '@/types/activity'
import type { SleepRecord } from '@/types/sleep'
import type { HealthGoal } from '@/types/goals'

const now = Date.now()
const DAY = 24 * 60 * 60 * 1000
const HOUR = 60 * 60 * 1000

export function generateHealthMetrics(userId = 'demo-user'): HealthMetric[] {
  const metrics: HealthMetric[] = []

  for (let i = 60; i >= 0; i--) {
    const date = new Date(now - i * DAY).toISOString()
    metrics.push({
      id: `metric-weight-${i}`,
      userId,
      type: 'weight',
      value: Math.round((78.5 - i * 0.08 + Math.sin(i) * 0.3) * 10) / 10,
      unit: 'kg',
      recordedAt: date,
      source: 'manual',
    })
    metrics.push({
      id: `metric-heart-${i}`,
      userId,
      type: 'heart_rate',
      value: Math.round(72 + Math.sin(i / 3) * 6 + (i % 4) * 2),
      unit: 'bpm',
      recordedAt: date,
      source: 'device',
    })
  }

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now - i * DAY).toISOString()
    metrics.push({
      id: `metric-bp-sys-${i}`,
      userId,
      type: 'blood_pressure_systolic',
      value: Math.round(120 + Math.sin(i / 2) * 8 - i * 0.1),
      unit: 'mmHg',
      recordedAt: date,
      source: 'device',
    })
    metrics.push({
      id: `metric-bp-dia-${i}`,
      userId,
      type: 'blood_pressure_diastolic',
      value: Math.round(78 + Math.cos(i / 2) * 5),
      unit: 'mmHg',
      recordedAt: date,
      source: 'device',
    })
    metrics.push({
      id: `metric-glucose-${i}`,
      userId,
      type: 'blood_glucose',
      value: Math.round(92 + Math.sin(i / 4) * 8),
      unit: 'mg/dL',
      recordedAt: date,
      source: 'manual',
    })
    metrics.push({
      id: `metric-temp-${i}`,
      userId,
      type: 'body_temperature',
      value: Math.round((36.8 + Math.sin(i / 6) * 0.2) * 10) / 10,
      unit: '°C',
      recordedAt: date,
      source: 'device',
    })
    metrics.push({
      id: `metric-spo2-${i}`,
      userId,
      type: 'blood_oxygen',
      value: Math.round(97.5 + Math.cos(i / 5) * 0.5),
      unit: '%',
      recordedAt: date,
      source: 'device',
    })
  }

  return metrics
}

export function generateActivity(userId = 'demo-user'): ActivityRecord[] {
  const activities: ActivityRecord[] = []
  const types = ['walking', 'running', 'cycling', 'gym', 'yoga', 'swimming'] as const

  for (let i = 45; i >= 0; i--) {
    if (i % 3 === 0) continue
    const type = types[i % types.length]
    const startedAt = new Date(now - i * DAY).toISOString()
    const durationMinutes = type === 'running' ? 30 + (i % 20) : type === 'yoga' ? 45 + (i % 30) : 40 + (i % 60)

    activities.push({
      id: `activity-${i}`,
      userId,
      type,
      startedAt,
      durationMinutes,
      distanceKm: ['running', 'cycling', 'walking'].includes(type)
        ? Math.round((durationMinutes * (type === 'cycling' ? 0.35 : 0.12)) * 10) / 10
        : undefined,
      caloriesBurned: Math.round(durationMinutes * (type === 'gym' ? 7 : type === 'yoga' ? 3 : 6)),
      avgHeartRate: 120 + (i % 40),
    })
  }
  return activities
}

export function generateSleep(userId = 'demo-user'): SleepRecord[] {
  const records: SleepRecord[] = []

  for (let i = 60; i >= 0; i--) {
    const date = new Date(now - i * DAY).toISOString().slice(0, 10)
    const sleepStart = new Date(now - i * DAY)
    sleepStart.setHours(22 + (i % 3), (i * 7) % 60, 0, 0)
    const durationHours = Math.round((7 + Math.sin(i / 4) * 1.2 + (i % 3) * 0.3) * 10) / 10
    const sleepEnd = new Date(sleepStart.getTime() + durationHours * HOUR)

    records.push({
      id: `sleep-${i}`,
      userId,
      date,
      sleepStart: sleepStart.toISOString(),
      sleepEnd: sleepEnd.toISOString(),
      durationHours,
      quality: (1 + ((i % 4) + 1)) as SleepRecord['quality'],
      deepSleepHours: Math.round(durationHours * 0.2 * 10) / 10,
      remSleepHours: Math.round(durationHours * 0.25 * 10) / 10,
      awakeTimeMinutes: 5 + (i % 30),
      heartRateAvg: 58 + (i % 8),
    })
  }
  return records
}

export function generateGoals(userId = 'demo-user'): HealthGoal[] {
  const nowIso = new Date().toISOString()
  return [
    {
      id: 'goal-1',
      userId,
      type: 'weight',
      title: 'Reach 75 kg',
      description: 'Steady weight loss through consistent nutrition and activity.',
      targetValue: 75,
      currentValue: 76.2,
      unit: 'kg',
      startDate: nowIso.slice(0, 10),
      endDate: new Date(now + 90 * DAY).toISOString().slice(0, 10),
      status: 'active',
      progress: 60,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'goal-2',
      userId,
      type: 'activity',
      title: 'Exercise 3× per week',
      description: 'Maintain at least three exercise sessions per week.',
      targetValue: 12,
      currentValue: 9,
      unit: 'sessions/month',
      startDate: nowIso.slice(0, 10),
      endDate: new Date(now + 30 * DAY).toISOString().slice(0, 10),
      status: 'active',
      progress: 75,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'goal-3',
      userId,
      type: 'sleep',
      title: 'Average 7.5 hours sleep',
      description: 'Improve sleep duration to a healthy average.',
      targetValue: 7.5,
      currentValue: 7.1,
      unit: 'hours/night',
      startDate: nowIso.slice(0, 10),
      endDate: new Date(now + 60 * DAY).toISOString().slice(0, 10),
      status: 'active',
      progress: 95,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ]
}

export function seedDatabase(userId = 'demo-user'): void {
  localStorage.setItem('health-tracker:metrics', JSON.stringify(generateHealthMetrics(userId)))
  localStorage.setItem('health-tracker:activity', JSON.stringify(generateActivity(userId)))
  localStorage.setItem('health-tracker:sleep', JSON.stringify(generateSleep(userId)))
  localStorage.setItem('health-tracker:goals', JSON.stringify(generateGoals(userId)))
}

export function isDatabaseSeeded(): boolean {
  return localStorage.getItem('health-tracker:metrics') !== null
}

export function seedDatabaseForUser(userId: string): void {
  const key = `seeded:${userId}`
  if (localStorage.getItem(key)) return
  const current = localStorage.getItem('health-tracker:metrics')
  const existing = current ? (JSON.parse(current) as HealthMetric[]) : []
  existing.push(...generateHealthMetrics(userId))
  localStorage.setItem('health-tracker:metrics', JSON.stringify(existing))
  const activity = localStorage.getItem('health-tracker:activity')
  const existingActivity = activity ? (JSON.parse(activity) as ActivityRecord[]) : []
  existingActivity.push(...generateActivity(userId))
  localStorage.setItem('health-tracker:activity', JSON.stringify(existingActivity))
  const sleep = localStorage.getItem('health-tracker:sleep')
  const existingSleep = sleep ? (JSON.parse(sleep) as SleepRecord[]) : []
  existingSleep.push(...generateSleep(userId))
  localStorage.setItem('health-tracker:sleep', JSON.stringify(existingSleep))
  const goals = localStorage.getItem('health-tracker:goals')
  const existingGoals = goals ? (JSON.parse(goals) as HealthGoal[]) : []
  existingGoals.push(...generateGoals(userId))
  localStorage.setItem('health-tracker:goals', JSON.stringify(existingGoals))
  localStorage.setItem(key, 'true')
}
