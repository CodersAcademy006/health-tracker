import { cn } from '@/lib/utils/cn'

interface ProgressBarProps {
  value: number
  max?: number
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
  className?: string
  showLabel?: boolean
  label?: string
}

const variantClasses = {
  primary: 'bg-primary-600',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  className,
  showLabel = false,
  label,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-medium text-surface-700">{label ?? value}</span>
          <span className="text-surface-500">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-surface-100',
          size === 'sm' ? 'h-1.5' : 'h-2.5',
          className
        )}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', variantClasses[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
