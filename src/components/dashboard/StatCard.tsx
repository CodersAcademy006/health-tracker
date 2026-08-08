import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface StatCardProps {
  title: string
  value: string | number
  unit?: string
  icon: ReactNode
  change?: number
  changeLabel?: string
  trend?: 'up' | 'down' | 'neutral'
  loading?: boolean
}

export function StatCard({
  title,
  value,
  unit,
  icon,
  change,
  changeLabel = 'vs last week',
  trend,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-surface-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 animate-pulse rounded bg-surface-200" />
            <div className="h-5 w-24 animate-pulse rounded bg-surface-200" />
          </div>
        </div>
      </div>
    )
  }

  const trendConfig = {
    up: { icon: TrendingUp, className: 'text-green-600 bg-green-50' },
    down: { icon: TrendingDown, className: 'text-red-600 bg-red-50' },
    neutral: { icon: Minus, className: 'text-surface-500 bg-surface-100' },
  }

  const TrendIcon = trendConfig[trend ?? 'neutral'].icon
  const trendClass = trendConfig[trend ?? 'neutral'].className

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500">{title}</p>
          <p className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-surface-900">{value}</span>
            {unit && <span className="text-sm text-surface-500">{unit}</span>}
          </p>
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', trendClass)}>
          {icon}
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className={cn('flex items-center gap-1 font-medium', trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-surface-500')}>
            <TrendIcon className="h-3.5 w-3.5" />
            {Math.abs(change)}%
          </span>
          <span className="text-surface-400">{changeLabel}</span>
        </div>
      )}
    </div>
  )
}
