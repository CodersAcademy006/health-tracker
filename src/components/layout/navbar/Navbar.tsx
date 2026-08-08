import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse, Menu, User, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { NotificationsDropdown } from '@/components/layout/notifications/NotificationsDropdown'

interface NavbarProps {
  onMenuClick: () => void
  mobileSidebarOpen: boolean
}

export function Navbar({ onMenuClick, mobileSidebarOpen }: NavbarProps) {
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    toast.info('Signed out', 'You have been signed out.')
    navigate('/login')
  }

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Account'

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-surface-200 bg-white/80 backdrop-blur-lg">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 lg:hidden transition-colors"
            aria-label={mobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
              <HeartPulse className="h-5 w-5" />
            </span>
            <span className="hidden sm:block text-lg font-bold text-surface-900">Vitalis</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <NotificationsDropdown />

          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-surface-100 transition-colors"
              aria-label="Account menu"
              aria-expanded={menuOpen}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <User className="h-4 w-4" />
              </span>
              <span className="hidden md:block text-sm font-medium text-surface-700">{displayName}</span>
              <ChevronDown className="hidden md:block h-4 w-4 text-surface-400" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-surface-200 bg-white p-2 shadow-lg animate-slide-down">
                  <div className="border-b border-surface-100 px-3 py-2">
                    <p className="text-sm font-semibold text-surface-900">{displayName}</p>
                    <p className="truncate text-xs text-surface-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900"
                  >
                    <User className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
