import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/auth-store'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login({ email, password })
      toast.success('Welcome back', 'You are now signed in.')
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in')
    } finally {
      setSubmitting(false)
    }
  }

  const fillDemo = () => {
    setEmail('alex@example.com')
    setPassword('DemoPass123')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
            <HeartPulse className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-surface-900">Sign in to Vitalis</h1>
          <p className="mt-1 text-sm text-surface-500">Track your health, activity, and goals.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {error}
            </div>
          )}
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" loading={submitting}>
            Sign in
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={fillDemo}>
            Use demo account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-500">
          New to Vitalis?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
