import { Card } from '@/components/ui/Card'

interface ComingSoonProps {
  title: string
  description: string
}

export function ComingSoonPage({ title, description }: ComingSoonProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">{title}</h1>
        <p className="mt-1 text-sm text-surface-500">{description}</p>
      </div>
      <Card className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-4xl">🚧</span>
        <h2 className="mt-4 text-lg font-semibold text-surface-900">Coming soon</h2>
        <p className="mt-1 max-w-sm text-sm text-surface-500">
          This feature is currently in development. Check back later.
        </p>
      </Card>
    </div>
  )
}
