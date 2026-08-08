import type { HealthMetricDefinition, HealthMetricType } from '@/types/health'

export const HEALTH_METRIC_DEFINITIONS: Record<HealthMetricType, HealthMetricDefinition> = {
  weight: {
    type: 'weight',
    label: 'Weight',
    unit: 'kg',
    min: 20,
    max: 500,
    normalRange: [50, 100],
    step: 0.1,
  },
  heart_rate: {
    type: 'heart_rate',
    label: 'Heart Rate',
    unit: 'bpm',
    min: 20,
    max: 250,
    normalRange: [60, 100],
    step: 1,
  },
  blood_pressure_systolic: {
    type: 'blood_pressure_systolic',
    label: 'Blood Pressure (Systolic)',
    unit: 'mmHg',
    min: 70,
    max: 250,
    normalRange: [90, 120],
    step: 1,
  },
  blood_pressure_diastolic: {
    type: 'blood_pressure_diastolic',
    label: 'Blood Pressure (Diastolic)',
    unit: 'mmHg',
    min: 40,
    max: 150,
    normalRange: [60, 80],
    step: 1,
  },
  blood_glucose: {
    type: 'blood_glucose',
    label: 'Blood Glucose',
    unit: 'mg/dL',
    min: 20,
    max: 600,
    normalRange: [70, 99],
    step: 1,
  },
  body_temperature: {
    type: 'body_temperature',
    label: 'Body Temperature',
    unit: '°C',
    min: 30,
    max: 45,
    normalRange: [36.1, 37.2],
    step: 0.1,
  },
  blood_oxygen: {
    type: 'blood_oxygen',
    label: 'Blood Oxygen',
    unit: '%',
    min: 50,
    max: 100,
    normalRange: [95, 100],
    step: 1,
  },
  respiratory_rate: {
    type: 'respiratory_rate',
    label: 'Respiratory Rate',
    unit: 'breaths/min',
    min: 5,
    max: 60,
    normalRange: [12, 20],
    step: 1,
  },
  cholesterol_total: {
    type: 'cholesterol_total',
    label: 'Total Cholesterol',
    unit: 'mg/dL',
    min: 50,
    max: 500,
    normalRange: [125, 200],
    step: 1,
  },
  cholesterol_hdl: {
    type: 'cholesterol_hdl',
    label: 'HDL Cholesterol',
    unit: 'mg/dL',
    min: 10,
    max: 200,
    normalRange: [40, 60],
    step: 1,
  },
  cholesterol_ldl: {
    type: 'cholesterol_ldl',
    label: 'LDL Cholesterol',
    unit: 'mg/dL',
    min: 20,
    max: 400,
    normalRange: [70, 130],
    step: 1,
  },
  triglycerides: {
    type: 'triglycerides',
    label: 'Triglycerides',
    unit: 'mg/dL',
    min: 20,
    max: 1000,
    normalRange: [50, 150],
    step: 1,
  },
}

export function getMetricDefinition(type: HealthMetricType): HealthMetricDefinition {
  return HEALTH_METRIC_DEFINITIONS[type]
}

export function isInNormalRange(type: HealthMetricType, value: number): boolean {
  const def = HEALTH_METRIC_DEFINITIONS[type]
  if (!def) return false
  return value >= def.normalRange[0] && value <= def.normalRange[1]
}

export function getMetricLabel(type: HealthMetricType): string {
  return HEALTH_METRIC_DEFINITIONS[type]?.label ?? type
}

export function getMetricUnit(type: HealthMetricType): string {
  return HEALTH_METRIC_DEFINITIONS[type]?.unit ?? ''
}
