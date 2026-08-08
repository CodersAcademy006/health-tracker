export interface Preferences {
  heightCm?: string
  weightKg?: string
  activityLevel?: string
  weightUnit?: string
  distanceUnit?: string
}

const STORAGE_KEY = 'health-tracker:preferences'

function readAll(): Record<string, Preferences> {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, Preferences>
  } catch {
    return {}
  }
}

function writeAll(all: Record<string, Preferences>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export const preferencesApi = {
  get(userId: string): Preferences {
    return readAll()[userId] ?? {}
  },

  save(userId: string, patch: Preferences): Preferences {
    const all = readAll()
    const next = { ...all[userId], ...patch }
    all[userId] = next
    writeAll(all)
    return next
  },
}
