import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { HEALTH_METRIC_DEFINITIONS, getMetricDefinition } from '@/lib/health/metric-definitions'
import { healthMetricSchema } from '@/lib/validation/health'
import type { HealthMetric, HealthMetricType } from '@/types/health'
import { useToast } from '@/hooks/use-toast'

type FormValues = z.input<typeof healthMetricSchema>
type FormOutput = z.output<typeof healthMetricSchema>

interface HealthMetricFormProps {
  onSubmit: (input: FormOutput) => Promise<void>
  initialType?: HealthMetricType
  record?: HealthMetric
  onSuccess?: () => void
}

function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function HealthMetricForm({ onSubmit, initialType, record, onSuccess }: HealthMetricFormProps) {
  const toast = useToast()
  const defaultValues: FormValues = record
    ? {
        type: record.type,
        value: record.value,
        unit: record.unit,
        recordedAt: isoToDatetimeLocal(record.recordedAt),
        notes: record.notes ?? '',
        source: record.source,
      }
    : {
        type: initialType ?? 'weight',
        value: 70,
        unit: getMetricDefinition(initialType ?? 'weight').unit,
        recordedAt: isoToDatetimeLocal(new Date().toISOString()),
        notes: '',
        source: 'manual',
      }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(healthMetricSchema),
    defaultValues,
  })

  const type = watch('type')
  const def = getMetricDefinition(type)

  useEffect(() => {
    if (def && !record) {
      setValue('unit', def.unit, { shouldValidate: false })
    }
  }, [type, def, setValue, record])

  const handleFormSubmit = handleSubmit(async (values) => {
    try {
      await onSubmit(values as FormOutput)
      toast.success(record ? 'Measurement updated' : 'Measurement logged', `Your ${def.label.toLowerCase()} was saved successfully.`)
      onSuccess?.()
    } catch (err) {
      toast.error(record ? 'Failed to update' : 'Failed to save', err instanceof Error ? err.message : 'Something went wrong')
    }
  })

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <Select label="Metric type" {...register('type')}>
        {(Object.keys(HEALTH_METRIC_DEFINITIONS) as HealthMetricType[]).map((key) => (
          <option key={key} value={key}>
            {getMetricDefinition(key).label}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Value"
          type="number"
          step={def?.step ?? 1}
          min={def?.min}
          max={def?.max}
          error={errors.value?.message}
          {...register('value', { valueAsNumber: true })}
        />
        <Input label="Unit" disabled value={def?.unit ?? ''} />
      </div>

      <Input
        label="Recorded at"
        type="datetime-local"
        error={errors.recordedAt?.message}
        {...register('recordedAt')}
      />

      <div>
        <label className="label" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          className="input resize-none"
          placeholder="Optional notes about this measurement..."
          {...register('notes')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {record ? 'Update measurement' : 'Save measurement'}
        </Button>
      </div>
    </form>
  )
}
