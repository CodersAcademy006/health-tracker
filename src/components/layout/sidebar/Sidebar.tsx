import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Activity,
  Moon,
  Target,
  FileText,
  Settings,
  LineChart,
  Apple,
  Brain,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/health', label: 'Health', icon: LineChart },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/sleep', label: 'Sleep', icon: Moon },
  { to: '/nutrition', label: 'Nutrition', icon: Apple },
  { to: '/symptoms', label: 'Symptoms', icon: Brain },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={cn(
          'fixed top-16 bottom-0 left-0 z-30 w-64 transform border-r border-surface-200 bg-white transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Sidebar navigation"
      >
        <nav className="flex flex-col gap-1 p-4">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-surface-400">
            Overview
          </p>
          {navItems.slice(0, 3).map((item) => (
            <SidebarLink key={item.to} item={item} onClick={onClose} />
          ))}
          <p className="px-3 py-2 mt-4 text-xs font-semibold uppercase tracking-wider text-surface-400">
            Tracking
          </p>
          {navItems.slice(3, 6).map((item) => (
            <SidebarLink key={item.to} item={item} onClick={onClose} />
          ))}
          <p className="px-3 py-2 mt-4 text-xs font-semibold uppercase tracking-wider text-surface-400">
            Progress
          </p>
          {navItems.slice(6).map((item) => (
            <SidebarLink key={item.to} item={item} onClick={onClose} />
          ))}
        </nav>
      </aside>
    </>
  )
}

function SidebarLink({
  item,
  onClick,
}: {
  item: (typeof navItems)[number]
  onClick: () => void
}) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary-50 text-primary-700'
            : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
        )
      }
    >
      <Icon className="h-5 w-5" />
      {item.label}
    </NavLink>
  )
}
