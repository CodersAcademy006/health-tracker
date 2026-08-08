import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils/cn'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative w-full rounded-xl bg-white shadow-2xl animate-slide-up',
          sizeClasses[size]
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-surface-200">
          <div>
            {title && <h2 id="modal-title" className="text-lg font-semibold text-surface-900">{title}</h2>}
            {description && <p className="mt-1 text-sm text-surface-500">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto scrollbar-thin">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-surface-200 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
