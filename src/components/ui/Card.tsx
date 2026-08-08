import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('card', className)} {...props}>
      {children}
    </div>
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  action?: ReactNode
}

export function CardHeader({ className, children, action }: CardHeaderProps) {
  return (
    <div className={cn('card-header flex items-center justify-between', className)}>
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function CardTitle({ className, children }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('card-title', className)}>{children}</h3>
}

export function CardDescription({ className, children }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mt-1 text-sm text-surface-500', className)}>{children}</p>
}

export function CardContent({ className, children }: CardProps) {
  return <div className={cn('card-content', className)}>{children}</div>
}

export function CardFooter({ className, children }: CardProps) {
  return <div className={cn('px-5 py-4 border-t border-surface-200', className)}>{children}</div>
}
