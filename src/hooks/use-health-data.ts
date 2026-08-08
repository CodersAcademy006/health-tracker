import { useCallback, useEffect, useState } from 'react'
import { healthApi } from '@/lib/api/health-api'
import type { HealthMetric, HealthMetricType } from '@/types/health'
import { healthService, type MetricSeries } from '@/services/health.service'

export function useHealthData(type?: HealthMetricType) {
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [series, setSeries] = useState<MetricSeries | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (type) {
        const filter = { type, limit: 90 }
        const { data } = await healthApi.list(filter)
        const seriesResult = await healthService.getMetricSeries(type)
        setMetrics(data)
        setSeries(seriesResult)
      } else {
        const { data } = await healthApi.list({}, { pageSize: 50 })
        setMetrics(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load health data')
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    load()
  }, [load])

  const createMetric = useCallback(async (input: Omit<HealthMetric, 'id' | 'userId'>) => {
    const created = await healthApi.create(input)
    setMetrics((prev) => [created, ...prev])
    await load()
    return created
  }, [load])

  const updateMetric = useCallback(
    async (id: string, input: Omit<HealthMetric, 'id' | 'userId'>) => {
      const updated = await healthApi.update(id, input)
      await load()
      return updated
    },
    [load]
  )

  const deleteMetric = useCallback(
    async (id: string) => {
      await healthApi.delete(id)
      await load()
    },
    [load]
  )

  return { metrics, series, loading, error, refresh: load, createMetric, updateMetric, deleteMetric }
}
