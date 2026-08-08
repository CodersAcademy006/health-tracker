import { describe, it, expect } from 'vitest'
import { calculateStats, calculateTrend, calculatePercentageChange } from '@/lib/analytics/trends'
import type { HealthMetric } from '@/types/health'

function makeMetrics(values: number[]): HealthMetric[] {
  return values.map((value, i) => ({
    id: `m${i}`,
    userId: 'u1',
    type: 'weight' as const,
    value,
    unit: 'kg',
    recordedAt: new Date(2024, 0, i + 1).toISOString(),
    source: 'manual' as const,
  }))
}

describe('calculateStats', () => {
  it('returns null for empty input', () => {
    expect(calculateStats([])).toBeNull()
  })

  it('computes count, average, min, max', () => {
    const stats = calculateStats(makeMetrics([70, 72, 74, 76]))!
    expect(stats.count).toBe(4)
    expect(stats.average).toBe(73)
    expect(stats.min).toBe(70)
    expect(stats.max).toBe(76)
    expect(stats.latest).toBe(76)
  })
})

describe('calculateTrend', () => {
  it('returns neutral for a single point', () => {
    const trend = calculateTrend(makeMetrics([70]))
    expect(trend.trend).toBe('neutral')
  })

  it('detects an increasing series', () => {
    const trend = calculateTrend(makeMetrics([70, 72, 74]))
    expect(trend.direction).toBe('increasing')
    expect(trend.change).toBe(4)
  })

  it('detects a decreasing series', () => {
    const trend = calculateTrend(makeMetrics([76, 74, 70]))
    expect(trend.direction).toBe('decreasing')
    expect(trend.change).toBe(-6)
  })
})

describe('calculatePercentageChange', () => {
  it('computes positive change', () => {
    expect(calculatePercentageChange(110, 100)).toBe(10)
  })

  it('computes negative change', () => {
    expect(calculatePercentageChange(90, 100)).toBe(-10)
  })

  it('returns 0 when previous is 0', () => {
    expect(calculatePercentageChange(50, 0)).toBe(0)
  })
})
