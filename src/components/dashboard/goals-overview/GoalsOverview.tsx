import { Link } from 'react-router-dom'
import { ArrowRight, Target } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import type { GoalProgress } from '@/types/goals'
import { formatDate } from '@/lib/utils/date'

interface GoalsOverviewProps {
  goals: GoalProgress[]
  loading?: boolean
}

export function GoalsOverview({ goals, loading = false }: GoalsOverviewProps) {
  return (
    <Card>
      <CardHeader
        action={
          <Link
            to="/goals"
            className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      >
        <CardTitle>Active Goals</CardTitle>
        <CardDescription>Your current targets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-2.5 w-full" />
              </div>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="py-8 text-center">
            <Target className="mx-auto h-10 w-10 text-surface-300" />
            <p className="mt-3 text-sm text-surface-500">No active goals. Create one to get started.</p>
            <Link to="/goals" className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">
              Create a goal
            </Link>
          </div>
        ) : (
          goals.map(({ goal, percentComplete, onTrack, daysRemaining }) => (
            <div key={goal.id}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-surface-800 truncate">{goal.title}</p>
                <Badge variant={onTrack ? 'success' : 'warning'}>{onTrack ? 'On track' : 'Off track'}</Badge>
              </div>
              <ProgressBar value={percentComplete} variant={onTrack ? 'primary' : 'warning'} />
              <div className="mt-1 flex items-center justify-between text-xs text-surface-400">
                <span>
                  {goal.currentValue} / {goal.targetValue} {goal.unit}
                </span>
                <span>
                  {daysRemaining !== undefined && daysRemaining >= 0
                    ? `${daysRemaining} days left`
                    : goal.endDate
                      ? 'Past due'
                      : formatDate(goal.startDate)}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
