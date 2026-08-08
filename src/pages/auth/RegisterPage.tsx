import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/auth-store'
import { useToast } from '@/hooks/use-toast'
import { registerSchema, type RegisterInput } from '@/lib/validation/auth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)
  const toast = useToast()
  const [form, setForm] = useState<RegisterInput>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (field: keyof RegisterInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const result = registerSchema.safeParse(form)
    if (!result.success) {
      const next: Partial<Record<keyof RegisterInput, string>> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof RegisterInput
        if (key && !next[key]) next[key] = issue.message
      }
      setErrors(next)
      return
    }
    setSubmitting(true)
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      })
      toast.success('Account created', 'Welcome to Vitalis.')
      navigate('/', { replace: true })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to create account')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
            <HeartPulse className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-surface-900">Create your account</h1>
          <p className="mt-1 text-sm text-surface-500">Join Vitalis and start tracking your health.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6" noValidate>
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              autoComplete="given-name"
              value={form.firstName}
              onChange={update('firstName')}
              error={errors.firstName}
              required
            />
            <Input
              label="Last name"
              autoComplete="family-name"
              value={form.lastName}
              onChange={update('lastName')}
              error={errors.lastName}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters with uppercase, lowercase, and a number."
            value={form.password}
            onChange={update('password')}
            error={errors.password}
            required
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            error={errors.confirmPassword}
            required
          />
          <Button type="submit" className="w-full" loading={submitting}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
