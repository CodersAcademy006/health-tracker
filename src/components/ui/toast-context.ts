import { createContext } from 'react'
import type { ToastType } from './toast-types'

export interface ToastContextValue {
  toast: (options: { type: ToastType; title: string; message?: string }) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
