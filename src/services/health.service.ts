import type { HealthMetric, HealthMetricFilter } from '@/types/health'
import { healthApi } from '@/lib/api/health-api'
import { calculateStats, calculateTrend, calculatePercentageChange } from '@/lib/analytics/trends'
import { HEALTH_METRIC_DEFINITIONS } from '@/lib/health/metric-definitions'

export interface MetricSeries {
  metric: HealthMetric
  stats: ReturnType<typeof calculateStats>
  trend: ReturnType<typeof calculateTrend>
  percentageChange: number
  history: HealthMetric[]
}

export const healthService = {
  async getMetricSeries(type: string, limit = 30): Promise<MetricSeries | null> {
    const filter: HealthMetricFilter = { type: type as HealthMetric['type'], limit }
    const { data } = await healthApi.list(filter)
    if (data.length === 0) return null
    const sorted = [...data].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    )
    const stats = calculateStats(sorted)
    const trend = calculateTrend(sorted)
    const prev = sorted[Math.max(0, sorted.length - 2)]
    const percentageChange = prev ? calculatePercentageChange(sorted[sorted.length - 1].value, prev.value) : 0
    return { metric: sorted[sorted.length - 1], stats, trend, percentageChange, history: sorted }
  },

  async getOverview() {
    const types = Object.keys(HEALTH_METRIC_DEFINITIONS) as Array<keyof typeof HEALTH_METRIC_DEFINITIONS>
    const series = await Promise.all(types.map((t) => this.getMetricSeries(t, 30)))
    return series.filter((s): s is MetricSeries => s !== null)
  },

  async getHistory(type: string, limit = 90) {
    const filter: HealthMetricFilter = { type: type as HealthMetric['type'], limit }
    const { data } = await healthApi.list(filter)
    return data
  },
}
