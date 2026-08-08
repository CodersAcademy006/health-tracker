import type { User } from '@/types/user'
import { delay, failure } from '@/lib/api/client'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { createUser, findByEmail, isUsersEmpty } from '@/lib/auth/users-repo'
import { seedDatabase } from '@/database/seed'

export interface RegisterInput {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

function toPublicUser(user: import('@/lib/auth/users-repo').StoredUser): User {
  const { passwordHash: _passwordHash, ...publicUser } = user
  return publicUser
}

export const authApi = {
  async register(input: RegisterInput): Promise<User> {
    await delay()
    if (findByEmail(input.email)) {
      failure(409, 'EMAIL_EXISTS', 'An account with this email already exists')
    }
    const now = new Date().toISOString()
    const user = createUser({
      id: crypto.randomUUID(),
      email: input.email.trim().toLowerCase(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      role: 'member',
      passwordHash: await hashPassword(input.password),
      createdAt: now,
      updatedAt: now,
    })
    return toPublicUser(user)
  },

  async login(input: LoginInput): Promise<User> {
    await delay()
    const user = findByEmail(input.email)
    if (!user) {
      failure(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
    }
    const valid = await verifyPassword(input.password, user.passwordHash)
    if (!valid) {
      failure(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
    }
    return toPublicUser(user)
  },

  async ensureDemoUser(): Promise<void> {
    if (!isUsersEmpty()) return
    const now = new Date().toISOString()
    createUser({
      id: 'demo-user',
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Morgan',
      role: 'member',
      passwordHash: await hashPassword('DemoPass123'),
      createdAt: now,
      updatedAt: now,
    })
    seedDatabase('demo-user')
  },
}
