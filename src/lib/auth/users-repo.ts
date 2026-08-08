import type { User } from '@/types/user'

export interface StoredUser extends User {
  passwordHash: string
}

const USERS_KEY = 'health-tracker:users'

export function loadUsers(): StoredUser[] {
  const raw = localStorage.getItem(USERS_KEY)
  return raw ? (JSON.parse(raw) as StoredUser[]) : []
}

export function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function findByEmail(email: string): StoredUser | undefined {
  const normalized = email.trim().toLowerCase()
  return loadUsers().find((u) => u.email.toLowerCase() === normalized)
}

export function findById(id: string): StoredUser | undefined {
  return loadUsers().find((u) => u.id === id)
}

export function createUser(user: StoredUser): StoredUser {
  const users = loadUsers()
  users.push(user)
  saveUsers(users)
  return user
}

export function updateUser(id: string, updates: Partial<Pick<StoredUser, 'firstName' | 'lastName' | 'email'>>): StoredUser | undefined {
  const users = loadUsers()
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) return undefined
  users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() }
  saveUsers(users)
  return users[index]
}

export function isUsersEmpty(): boolean {
  return loadUsers().length === 0
}
