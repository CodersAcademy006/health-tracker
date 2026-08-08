import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns'

export function formatDate(date: string | Date, pattern = 'MMM d, yyyy'): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(parsed)) return '—'
  return format(parsed, pattern)
}

export function formatTime(date: string | Date, pattern = 'h:mm a'): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(parsed)) return '—'
  return format(parsed, pattern)
}

export function formatDateTime(date: string | Date, pattern = 'MMM d, yyyy h:mm a'): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(parsed)) return '—'
  return format(parsed, pattern)
}

export function formatRelativeTime(date: string | Date): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(parsed)) return '—'
  return formatDistanceToNow(parsed, { addSuffix: true })
}

export function isSameDay(date: string | Date, compare: string | Date = new Date()): boolean {
  const a = typeof date === 'string' ? parseISO(date) : date
  const b = typeof compare === 'string' ? parseISO(compare) : compare
  return format(a, 'yyyy-MM-dd') === format(b, 'yyyy-MM-dd')
}

export function daysBetween(start: string | Date, end: string | Date): number {
  const a = typeof start === 'string' ? parseISO(start) : start
  const b = typeof end === 'string' ? parseISO(end) : end
  const diff = b.getTime() - a.getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}
