export function formatNumber(value: number, options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat('en-US', options).format(value)
}

export function formatDecimal(value: number, digits = 1): string {
  return formatNumber(value, { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

export function formatPercentage(value: number, digits = 1): string {
  return `${formatDecimal(value, digits)}%`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function round(value: number, digits = 2): number {
  const factor = Math.pow(10, digits)
  return Math.round(value * factor) / factor
}
