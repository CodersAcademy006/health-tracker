import { describe, it, expect } from 'vitest'
import { calculateBMI, getBMIInterpretation } from '@/lib/health/bmi'
import { calculateBMR, calculateTDEE } from '@/lib/health/bmr'

describe('calculateBMI', () => {
  it('computes BMI correctly for a normal weight', () => {
    const result = calculateBMI(70, 175)
    expect(result.bmi).toBeCloseTo(22.9, 1)
    expect(result.category).toBe('normal')
  })

  it('returns underweight below 18.5', () => {
    const result = calculateBMI(45, 175)
    expect(result.category).toBe('underweight')
    expect(result.bmi).toBeLessThan(18.5)
  })

  it('returns obese above 30', () => {
    const result = calculateBMI(100, 175)
    expect(result.category).toBe('obese')
    expect(result.bmi).toBeGreaterThan(30)
  })

  it('throws on invalid inputs', () => {
    expect(() => calculateBMI(0, 175)).toThrow()
    expect(() => calculateBMI(70, 0)).toThrow()
  })

  it('computes a healthy weight range', () => {
    const result = calculateBMI(70, 175)
    expect(result.healthyRange[0]).toBeGreaterThan(50)
    expect(result.healthyRange[1]).toBeLessThan(80)
  })
})

describe('getBMIInterpretation', () => {
  it('labels each category', () => {
    expect(getBMIInterpretation(17)).toBe('Underweight')
    expect(getBMIInterpretation(22)).toBe('Normal weight')
    expect(getBMIInterpretation(27)).toBe('Overweight')
    expect(getBMIInterpretation(32)).toBe('Obese')
  })
})

describe('calculateBMR', () => {
  it('computes a male BMR using the Mifflin-St Jeor formula', () => {
    const bmr = calculateBMR({ weightKg: 80, heightCm: 180, age: 30, sex: 'male' })
    expect(bmr).toBe(1780)
  })

  it('computes a female BMR lower than the equivalent male', () => {
    const male = calculateBMR({ weightKg: 70, heightCm: 170, age: 30, sex: 'male' })
    const female = calculateBMR({ weightKg: 70, heightCm: 170, age: 30, sex: 'female' })
    expect(female).toBe(male - 166)
  })
})

describe('calculateTDEE', () => {
  it('scales BMR by activity multiplier', () => {
    const sedentary = calculateTDEE({
      weightKg: 70,
      heightCm: 170,
      age: 30,
      sex: 'male',
      activityLevel: 'sedentary',
    })
    const active = calculateTDEE({
      weightKg: 70,
      heightCm: 170,
      age: 30,
      sex: 'male',
      activityLevel: 'active',
    })
    expect(active).toBeGreaterThan(sedentary)
  })
})
