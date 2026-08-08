export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const candidate = await hashPassword(password)
  return candidate === hash
}
