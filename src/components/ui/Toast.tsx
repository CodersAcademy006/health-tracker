import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ToastContext } from '@/components/ui/toast-context'
import type { Toast, ToastType } from '@/components/ui/toast-types'

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
}

const borderColors: Record<ToastType, string> = {
  success: 'border-green-200',
  error: 'border-red-200',
  warning: 'border-yellow-200',
  info: 'border-blue-200',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ type, title, message }: Omit<Toast, 'id'>) => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, type, title, message }])
      setTimeout(() => dismiss(id), 5000)
    },
    [dismiss]
  )

  const value = useMemo(
    () => ({
      toast,
      success: (title: string, message?: string) => toast({ type: 'success', title, message }),
      error: (title: string, message?: string) => toast({ type: 'error', title, message }),
      warning: (title: string, message?: string) => toast({ type: 'warning', title, message }),
      info: (title: string, message?: string) => toast({ type: 'info', title, message }),
    }),
    [toast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-3">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-lg border bg-white p-4 shadow-lg animate-slide-down',
                borderColors[t.type]
              )}
              role="status"
            >
              <span className="shrink-0 mt-0.5">{icons[t.type]}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-surface-900">{t.title}</p>
                {t.message && <p className="mt-0.5 text-sm text-surface-500">{t.message}</p>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded p-1 text-surface-400 hover:text-surface-600 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}
