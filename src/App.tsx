import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Navbar } from '@/components/layout/navbar/Navbar'
import { Sidebar } from '@/components/layout/sidebar/Sidebar'
import { ToastProvider } from '@/components/ui/Toast'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import HealthPage from '@/pages/health/HealthPage'
import ActivityPage from '@/pages/activity/ActivityPage'
import SleepPage from '@/pages/sleep/SleepPage'
import GoalsPage from '@/pages/goals/GoalsPage'
import ReportsPage from '@/pages/reports/ReportsPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import { ComingSoonPage } from '@/pages/ComingSoonPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import { useAuth } from '@/hooks/use-auth'
import { useAuthStore } from '@/store/auth-store'
import { useReminderEngine } from '@/hooks/use-reminder-engine'
import { useNotificationStore } from '@/store/notification-store'

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const initNotifications = useNotificationStore((state) => state.initialize)
  useReminderEngine()

  useEffect(() => {
    if (isAuthenticated) {
      initNotifications()
    }
  }, [isAuthenticated, initNotifications])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar onMenuClick={() => setSidebarOpen((o) => !o)} mobileSidebarOpen={sidebarOpen} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="lg:pl-64 pt-16">
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          <Routes>
            <Route index element={<DashboardPage />} />
            <Route path="health" element={<HealthPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="sleep" element={<SleepPage />} />
            <Route path="nutrition" element={<ComingSoonPage title="Nutrition" description="Track your meals and nutrition intake." />} />
            <Route path="symptoms" element={<ComingSoonPage title="Symptoms" description="Log and monitor symptoms over time." />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />
  }
  return <>{children}</>
}

function App() {
  const initialize = useAuthStore((state) => state.initialize)
  const initialized = useAuthStore((state) => state.initialized)

  useEffect(() => {
    initialize()
  }, [initialize])

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface-300 border-t-primary-600" />
      </div>
    )
  }

  return (
    <ToastProvider>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnly>
              <RegisterPage />
            </PublicOnly>
          }
        />
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </ToastProvider>
  )
}

export default App
