import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/user'
import { authApi, type LoginInput, type RegisterInput } from '@/lib/api/auth-api'
import { updateUser } from '@/lib/auth/users-repo'

export interface ProfileInput {
  firstName: string
  lastName: string
  email: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  initialized: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  updateProfile: (input: ProfileInput) => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      initialized: false,

      initialize: async () => {
        if (get().initialized) return
        await authApi.ensureDemoUser()
        set({ initialized: true })
      },

      login: async (input) => {
        const user = await authApi.login(input)
        set({ user, isAuthenticated: true })
      },

      register: async (input) => {
        const user = await authApi.register(input)
        set({ user, isAuthenticated: true })
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      updateProfile: (input) => {
        const current = get().user
        if (!current) return
        const stored = updateUser(current.id, input)
        if (stored) {
          const { passwordHash: _passwordHash, ...publicUser } = stored
          set({ user: publicUser })
        }
      },
    }),
    {
      name: 'health-tracker:session',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
