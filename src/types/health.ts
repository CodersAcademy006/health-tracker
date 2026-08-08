import type { ID } from './user'

export type HealthMetricType =
  | 'weight'
  | 'heart_rate'
  | 'blood_pressure_systolic'
  | 'blood_pressure_diastolic'
  | 'blood_glucose'
  | 'body_temperature'
  | 'blood_oxygen'
  | 'respiratory_rate'
  | 'cholesterol_total'
  | 'cholesterol_hdl'
  | 'cholesterol_ldl'
  | 'triglycerides'

export interface HealthMetric {
  id: ID
  userId: ID
  type: HealthMetricType
  value: number
  unit: string
  recordedAt: string
  notes?: string
  source: 'manual' | 'device' | 'imported'
}

export interface HealthMetricDefinition {
  type: HealthMetricType
  label: string
  unit: string
  min: number
  max: number
  normalRange: [number, number]
  step: number
  icon?: string
  color?: string
}

export interface HealthMetricFilter {
  type?: HealthMetricType
  startDate?: string
  endDate?: string
  limit?: number
}
