import { z } from 'zod'

export const goalSchema = z.object({
  type: z.enum(['weight', 'activity', 'sleep', 'nutrition', 'habit']),
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  targetValue: z.coerce.number().positive('Target must be positive'),
  currentValue: z.coerce.number().min(0),
  unit: z.string().min(1),
  startDate: z.string().date(),
  endDate: z.string().date().optional(),
  status: z.enum(['active', 'completed', 'archived']).default('active'),
})

export const goalUpdateSchema = goalSchema.partial()

export type GoalInput = z.infer<typeof goalSchema>
export type GoalUpdateInput = z.infer<typeof goalUpdateSchema>
