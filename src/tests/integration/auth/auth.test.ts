import { describe, it, expect, beforeEach } from 'vitest'
import { authApi } from '@/lib/api/auth-api'
import { loadUsers } from '@/lib/auth/users-repo'

describe('authApi', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('registers a new user', async () => {
    const user = await authApi.register({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'Password123',
    })
    expect(user.id).toBeDefined()
    expect(user.email).toBe('jane@example.com')
    expect(user.firstName).toBe('Jane')
    expect('passwordHash' in user).toBe(false)
  })

  it('registers multiple distinct users', async () => {
    await authApi.register({
      firstName: 'One',
      lastName: 'A',
      email: 'one@example.com',
      password: 'Password123',
    })
    await authApi.register({
      firstName: 'Two',
      lastName: 'B',
      email: 'two@example.com',
      password: 'Password123',
    })
    const users = loadUsers()
    expect(users).toHaveLength(2)
    expect(users[0].id).not.toBe(users[1].id)
  })

  it('rejects duplicate emails', async () => {
    await authApi.register({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'Password123',
    })
    await expect(
      authApi.register({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'Password123',
      })
    ).rejects.toThrow()
  })

  it('logs in with correct credentials', async () => {
    await authApi.register({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'Password123',
    })
    const user = await authApi.login({ email: 'jane@example.com', password: 'Password123' })
    expect(user.email).toBe('jane@example.com')
  })

  it('rejects wrong password', async () => {
    await authApi.register({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'Password123',
    })
    await expect(
      authApi.login({ email: 'jane@example.com', password: 'WrongPass' })
    ).rejects.toThrow()
  })

  it('ensures the demo user exists once', async () => {
    await authApi.ensureDemoUser()
    await authApi.ensureDemoUser()
    expect(loadUsers()).toHaveLength(1)
    const demo = loadUsers()[0]
    expect(demo.email).toBe('alex@example.com')
  })
})
