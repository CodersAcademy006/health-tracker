import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  className?: string
}

const variantClasses: Record<AlertVariant, string> = {
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  success: 'bg-green-50 text-green-800 border-green-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  danger: 'bg-red-50 text-red-800 border-red-200',
}

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  return (
    <div className={cn('rounded-lg border p-4 text-sm', variantClasses[variant], className)} role="alert">
      {title && <p className="font-semibold mb-1">{title}</p>}
      <div className={cn(title && 'opacity-90')}>{children}</div>
    </div>
  )
}
