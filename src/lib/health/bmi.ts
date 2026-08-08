export interface BMIResult {
  bmi: number
  category: 'underweight' | 'normal' | 'overweight' | 'obese'
  healthyRange: [number, number]
}

const BMI_CATEGORIES: Array<{ max: number; category: BMIResult['category'] }> = [
  { max: 18.5, category: 'underweight' },
  { max: 25, category: 'normal' },
  { max: 30, category: 'overweight' },
  { max: Infinity, category: 'obese' },
]

export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
  if (heightCm <= 0 || weightKg <= 0) {
    throw new Error('Weight and height must be positive values')
  }
  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)
  const category = BMI_CATEGORIES.find((c) => bmi < c.max)!.category
  const minHealthyWeight = 18.5 * heightM * heightM
  const maxHealthyWeight = 24.9 * heightM * heightM
  return { bmi: Math.round(bmi * 10) / 10, category, healthyRange: [minHealthyWeight, maxHealthyWeight] }
}

export function getBMIInterpretation(bmi: number): string {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal weight'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}
