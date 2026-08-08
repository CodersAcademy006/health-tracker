import { describe, it, expect } from 'vitest'
import { healthMetricSchema } from '@/lib/validation/health'
import { loginSchema, registerSchema } from '@/lib/validation/auth'
import { sleepRecordSchema } from '@/lib/validation/sleep'
import { goalSchema } from '@/lib/validation/goals'

describe('healthMetricSchema', () => {
  it('accepts a valid weight metric', () => {
    const result = healthMetricSchema.safeParse({
      type: 'weight',
      value: 75.5,
      unit: 'kg',
      recordedAt: new Date().toISOString(),
      source: 'manual',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a negative value', () => {
    const result = healthMetricSchema.safeParse({
      type: 'weight',
      value: -5,
      unit: 'kg',
      recordedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(false)
  })

  it('rejects a heart rate outside the valid range', () => {
    const result = healthMetricSchema.safeParse({
      type: 'heart_rate',
      value: 300,
      unit: 'bpm',
      recordedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown metric type', () => {
    const result = healthMetricSchema.safeParse({
      type: 'unknown_metric',
      value: 10,
      unit: 'x',
      recordedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'password123' }).success).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'password123' }).success).toBe(false)
  })

  it('rejects short password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'short' }).success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      firstName: 'Alex',
      lastName: 'Morgan',
      email: 'a@b.com',
      password: 'Password123',
      confirmPassword: 'Password124',
    })
    expect(result.success).toBe(false)
  })

  it('requires an uppercase letter', () => {
    const result = registerSchema.safeParse({
      firstName: 'Alex',
      lastName: 'Morgan',
      email: 'a@b.com',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(false)
  })
})

describe('sleepRecordSchema', () => {
  it('accepts a valid record', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-01',
      sleepStart: new Date().toISOString(),
      sleepEnd: new Date().toISOString(),
      durationHours: 7.5,
      quality: 4,
    })
    expect(result.success).toBe(true)
  })

  it('rejects quality outside 1-5', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-01',
      sleepStart: new Date().toISOString(),
      sleepEnd: new Date().toISOString(),
      durationHours: 7.5,
      quality: 9,
    })
    expect(result.success).toBe(false)
  })
})

describe('goalSchema', () => {
  it('accepts a valid goal', () => {
    const result = goalSchema.safeParse({
      type: 'weight',
      title: 'Reach 75kg',
      targetValue: 75,
      currentValue: 78,
      unit: 'kg',
      startDate: '2024-01-01',
      status: 'active',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = goalSchema.safeParse({
      type: 'weight',
      title: '',
      targetValue: 75,
      currentValue: 78,
      unit: 'kg',
      startDate: '2024-01-01',
    })
    expect(result.success).toBe(false)
  })
})
