import { z } from 'zod'

export const sleepRecordSchema = z.object({
  date: z.string().date('Sleep date must be valid'),
  sleepStart: z.string().datetime('Sleep start time must be valid'),
  sleepEnd: z.string().datetime('Sleep end time must be valid'),
  durationHours: z.coerce.number().min(1).max(24, 'Duration must be under 24 hours'),
  quality: z.coerce.number().int().min(1).max(5),
  deepSleepHours: z.coerce.number().min(0).max(12).optional(),
  remSleepHours: z.coerce.number().min(0).max(12).optional(),
  awakeTimeMinutes: z.coerce.number().int().min(0).max(600).optional(),
  heartRateAvg: z.coerce.number().min(30).max(200).optional(),
  notes: z.string().max(500).optional(),
})

export type SleepRecordInput = z.infer<typeof sleepRecordSchema>
