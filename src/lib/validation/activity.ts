import { z } from 'zod'

export const activityRecordSchema = z.object({
  type: z.enum(['walking', 'running', 'cycling', 'swimming', 'gym', 'yoga', 'other']),
  startedAt: z.string().datetime('Started date must be valid'),
  durationMinutes: z.coerce.number().int().min(1, 'Duration must be at least 1 minute').max(1440),
  distanceKm: z.coerce.number().min(0).optional(),
  caloriesBurned: z.coerce.number().min(0).optional(),
  avgHeartRate: z.coerce.number().min(30).max(250).optional(),
  notes: z.string().max(500).optional(),
})

export type ActivityRecordInput = z.infer<typeof activityRecordSchema>
