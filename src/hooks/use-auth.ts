import { useAuthStore } from '@/store/auth-store'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)

  return { user, isAuthenticated, setUser, logout }
}
