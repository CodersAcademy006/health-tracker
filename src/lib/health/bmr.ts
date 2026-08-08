export type Sex = 'male' | 'female'

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

export interface BMRInput {
  weightKg: number
  heightCm: number
  age: number
  sex: Sex
}

export interface TDEEInput extends BMRInput {
  activityLevel: ActivityLevel
}

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export function calculateBMR({ weightKg, heightCm, age, sex }: BMRInput): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  const bmr = sex === 'male' ? base + 5 : base - 161
  return Math.round(bmr)
}

export function calculateTDEE(input: TDEEInput): number {
  const bmr = calculateBMR(input)
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[input.activityLevel])
}
