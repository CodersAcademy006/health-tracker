import { useMemo } from 'react'
import { format } from 'date-fns'

export interface LineChartPoint {
  x: string
  y: number
}

interface LineChartProps {
  data: LineChartPoint[]
  height?: number
  color?: string
  unit?: string
  yDomain?: [number, number]
  xFormat?: (value: string) => string
  yFormat?: (value: number) => string
}

function buildPath(points: Array<{ px: number; py: number }>): string {
  if (points.length === 0) return ''
  const [first, ...rest] = points
  return rest.reduce(
    (path, point, i) => {
      const prev = points[i]
      const midX = (prev.px + point.px) / 2
      return `${path} C ${midX},${prev.py} ${midX},${point.py} ${point.px},${point.py}`
    },
    `M ${first.px},${first.py}`
  )
}

function buildAreaPath(points: Array<{ px: number; py: number }>, height: number): string {
  if (points.length === 0) return ''
  const line = buildPath(points)
  const last = points[points.length - 1]
  const first = points[0]
  return `${line} L ${last.px},${height} L ${first.px},${height} Z`
}

export function LineChart({
  data,
  height = 200,
  color = '#16a34a',
  unit,
  yDomain,
  xFormat,
  yFormat,
}: LineChartProps) {
  const { points, domain } = useMemo(() => {
    if (data.length === 0) return { points: [], domain: { min: 0, max: 1 } }

    const values = data.map((d) => d.y)
    const rawMin = Math.min(...values)
    const rawMax = Math.max(...values)
    const padding = (rawMax - rawMin) * 0.1 || 1

    const min = yDomain ? yDomain[0] : rawMin - padding
    const max = yDomain ? yDomain[1] : rawMax + padding

    const width = 600
    const plotHeight = height - 40
    const minX = 0
    const maxX = width
    const minY = 0
    const maxY = plotHeight

    const points = data.map((d, i) => {
      const px = minX + (i / Math.max(1, data.length - 1)) * (maxX - minX)
      const py = maxY - ((d.y - min) / (max - min)) * (maxY - minY)
      return { px, py }
    })

    return { points, domain: { min, max } }
  }, [data, height, yDomain])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-surface-400" style={{ height }}>
        No data available
      </div>
    )
  }

  const linePath = buildPath(points)
  const areaPath = buildAreaPath(points, height - 40)
  const formatY = yFormat ?? ((v: number) => v.toFixed(0))
  const formatX = xFormat ?? ((v: string) => format(new Date(v), 'MMM d'))

  return (
    <div>
      <svg viewBox={`0 0 600 ${height}`} className="w-full" role="img" aria-label="Trend chart">
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {[0, 1, 2, 3].map((i) => {
          const y = (i / 3) * (height - 40)
          const value = domain.max - (i / 3) * (domain.max - domain.min)
          return (
            <g key={i}>
              <line x1="0" x2="600" y1={y} y2={y} stroke="currentColor" className="text-surface-200" strokeDasharray="4 4" strokeWidth="1" />
              <text x="600" y={y - 4} textAnchor="end" className="fill-surface-400 text-[10px]">
                {formatY(value)}
              </text>
            </g>
          )
        })}

        <path d={areaPath} fill={`url(#gradient-${color.replace('#', '')})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <circle key={i} cx={p.px} cy={p.py} r="3" fill="white" stroke={color} strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-between text-xs text-surface-400">
        {data.length > 0 && <span>{formatX(data[0].x)}</span>}
        {data.length > 0 && <span>{formatX(data[data.length - 1].x)}</span>}
      </div>
      {unit && <span className="sr-only">Unit: {unit}</span>}
    </div>
  )
}
