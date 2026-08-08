import { z } from 'zod'
import { HEALTH_METRIC_DEFINITIONS } from '@/lib/health/metric-definitions'
import type { HealthMetricType } from '@/types/health'

const metricTypes = Object.keys(HEALTH_METRIC_DEFINITIONS) as HealthMetricType[]

export const healthMetricSchema = z
  .object({
    type: z.enum(metricTypes as [HealthMetricType, ...HealthMetricType[]]),
    value: z.number('Value must be a number').positive('Value must be positive'),
    unit: z.string().min(1, 'Unit is required'),
    recordedAt: z.string().min(1, 'Recorded date is required'),
    notes: z.string().max(500, 'Notes must be under 500 characters').optional(),
    source: z.enum(['manual', 'device', 'imported']).default('manual'),
  })
  .refine((data) => {
    const def = HEALTH_METRIC_DEFINITIONS[data.type]
    return def ? data.value >= def.min && data.value <= def.max : true
  }, 'Value is outside the valid range for this metric')

export const healthMetricFilterSchema = z.object({
  type: z.enum(metricTypes as [HealthMetricType, ...HealthMetricType[]]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(500).optional(),
})

export type HealthMetricInput = z.infer<typeof healthMetricSchema>
export type HealthMetricFilterInput = z.infer<typeof healthMetricFilterSchema>
