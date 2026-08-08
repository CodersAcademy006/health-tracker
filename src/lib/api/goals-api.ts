import type { HealthGoal } from '@/types/goals'
import type { ApiPaginationParams } from '@/types/api'
import { delay, failure, paginate, sortItems } from '@/lib/api/client'
import { useAuthStore } from '@/store/auth-store'

const STORAGE_KEY = 'health-tracker:goals'

function currentUserId(): string {
  return useAuthStore.getState().user?.id ?? 'guest'
}

function loadAll(): HealthGoal[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as HealthGoal[]) : []
}

function saveAll(goals: HealthGoal[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
}

function mine(goals: HealthGoal[]): HealthGoal[] {
  const userId = currentUserId()
  return goals.filter((g) => g.userId === userId)
}

export const goalsApi = {
  async list(params: ApiPaginationParams = {}): Promise<ReturnType<typeof paginate<HealthGoal>>> {
    await delay()
    const all = sortItems(mine(loadAll()), params)
    return paginate(all, params)
  },

  async getById(id: string): Promise<HealthGoal> {
    await delay()
    const goal = loadAll().find((g) => g.id === id && g.userId === currentUserId())
    if (!goal) failure(404, 'NOT_FOUND', 'Goal not found')
    return goal
  },

  async create(input: Omit<HealthGoal, 'id' | 'userId' | 'progress' | 'createdAt' | 'updatedAt'>): Promise<HealthGoal> {
    await delay()
    const now = new Date().toISOString()
    const goal: HealthGoal = {
      ...input,
      id: crypto.randomUUID(),
      userId: currentUserId(),
      progress: 0,
      createdAt: now,
      updatedAt: now,
    }
    const all = loadAll()
    all.push(goal)
    saveAll(all)
    return goal
  },

  async update(id: string, input: Partial<Omit<HealthGoal, 'id' | 'userId' | 'createdAt'>>): Promise<HealthGoal> {
    await delay()
    const all = loadAll()
    const index = all.findIndex((g) => g.id === id && g.userId === currentUserId())
    if (index === -1) failure(404, 'NOT_FOUND', 'Goal not found')
    all[index] = { ...all[index], ...input, updatedAt: new Date().toISOString() }
    if (input.currentValue !== undefined) {
      const goal = all[index]
      const target = goal.targetValue
      const progress = target > 0 ? (goal.currentValue / target) * 100 : 0
      goal.progress = Math.min(100, Math.round(progress))
    }
    saveAll(all)
    return all[index]
  },

  async delete(id: string): Promise<void> {
    await delay()
    const all = loadAll().filter((g) => !(g.id === id && g.userId === currentUserId()))
    saveAll(all)
  },
}

export type GoalsApi = typeof goalsApi
