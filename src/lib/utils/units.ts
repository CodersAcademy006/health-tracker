export const UNIT_CONVERSIONS = {
  length: {
    cmToInch: (cm: number) => cm * 0.393701,
    inchToCm: (inch: number) => inch / 0.393701,
    kmToMiles: (km: number) => km * 0.621371,
    milesToKm: (miles: number) => miles / 0.621371,
    metersToKm: (meters: number) => meters / 1000,
  },
  mass: {
    kgToLbs: (kg: number) => kg * 2.20462,
    lbsToKg: (lbs: number) => lbs / 2.20462,
  },
  temperature: {
    celsiusToFahrenheit: (c: number) => (c * 9) / 5 + 32,
    fahrenheitToCelsius: (f: number) => ((f - 32) * 5) / 9,
  },
  energy: {
    kcalToJoules: (kcal: number) => kcal * 4184,
    joulesToKcal: (j: number) => j / 4184,
  },
} as const

export function formatDistance(value: number, unit: 'km' | 'mi' = 'km', digits = 1): string {
  if (unit === 'mi') return `${value.toFixed(digits)} mi`
  return `${value.toFixed(digits)} km`
}

export function formatWeight(value: number, unit: 'kg' | 'lbs' = 'kg', digits = 1): string {
  if (unit === 'lbs') return `${value.toFixed(digits)} lbs`
  return `${value.toFixed(digits)} kg`
}

export function formatHeight(value: number, unit: 'cm' | 'in' = 'cm'): string {
  if (unit === 'in') {
    const totalInches = UNIT_CONVERSIONS.length.cmToInch(value)
    const feet = Math.floor(totalInches / 12)
    const inches = Math.round(totalInches % 12)
    return `${feet}' ${inches}"`
  }
  return `${value} cm`
}
