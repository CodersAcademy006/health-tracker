import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral'

const variants: Record<BadgeVariant, string> = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  neutral: 'badge-neutral',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: ReactNode
}

export function Badge({ variant = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(variants[variant], className)} {...props}>
      {children}
    </span>
  )
}
