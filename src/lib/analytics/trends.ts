import type { HealthMetric } from '@/types/health'

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable'
  average: number
  min: number
  max: number
  change: number
  trend: 'improving' | 'worsening' | 'neutral'
}

export interface HealthMetricStats {
  count: number
  average: number
  min: number
  max: number
  latest: number
  standardDeviation: number
  firstRecordedAt: string
  lastRecordedAt: string
}

export function calculateTrend(metrics: HealthMetric[]): TrendAnalysis {
  if (metrics.length < 2) {
    return {
      direction: 'stable',
      average: metrics[0]?.value ?? 0,
      min: metrics[0]?.value ?? 0,
      max: metrics[0]?.value ?? 0,
      change: 0,
      trend: 'neutral',
    }
  }

  const values = metrics.map((m) => m.value)
  const first = values[0]
  const last = values[values.length - 1]
  const average = values.reduce((a, b) => a + b, 0) / values.length
  const min = Math.min(...values)
  const max = Math.max(...values)
  const change = last - first

  const direction = change > 0.01 ? 'increasing' : change < -0.01 ? 'decreasing' : 'stable'

  return { direction, average, min, max, change, trend: 'neutral' }
}

export function calculateStats(metrics: HealthMetric[]): HealthMetricStats | null {
  if (metrics.length === 0) return null
  const values = metrics.map((m) => m.value)
  const average = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((a, b) => a + (b - average) ** 2, 0) / values.length

  return {
    count: metrics.length,
    average,
    min: Math.min(...values),
    max: Math.max(...values),
    latest: values[values.length - 1],
    standardDeviation: Math.sqrt(variance),
    firstRecordedAt: metrics[0].recordedAt,
    lastRecordedAt: metrics[metrics.length - 1].recordedAt,
  }
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}
