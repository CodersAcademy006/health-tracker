import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  children: ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className, id, children, ...props }, ref) => {
    const selectId = id ?? (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={cn(
              'input appearance-none pr-8 cursor-pointer',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
        {!error && hint && (
          <p className="mt-1 text-xs text-surface-500">{hint}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
