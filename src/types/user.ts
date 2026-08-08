export type ID = string

export type UserRole = 'admin' | 'member'

export interface User {
  id: ID
  email: string
  firstName: string
  lastName: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  userId: ID
  dateOfBirth?: string
  sex: 'male' | 'female' | 'other'
  heightCm: number
  weightKg: number
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
}

export interface Session {
  token: string
  user: User
  expiresAt: string
}
