'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: number
  color?: string
  className?: string
}

export function StatsCard({ title, value, icon: Icon, trend, color = 'green', className }: StatsCardProps) {
  const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
    green: { bg: 'bg-green-50 dark:bg-green-950/30', icon: 'text-green-600', border: 'border-l-green-500' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', icon: 'text-blue-600', border: 'border-l-blue-500' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', icon: 'text-orange-600', border: 'border-l-orange-500' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', icon: 'text-purple-600', border: 'border-l-purple-500' },
    red: { bg: 'bg-red-50 dark:bg-red-950/30', icon: 'text-red-600', border: 'border-l-red-500' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950/30', icon: 'text-yellow-600', border: 'border-l-yellow-500' },
  }

  const colors = colorClasses[color] || colorClasses.green

  return (
    <Card className={cn('border-l-4', colors.border, className)}>
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground font-medium">{title}</span>
            <span className="text-2xl lg:text-3xl font-bold tracking-tight">{value}</span>
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {trend >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                )}
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend >= 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {trend >= 0 ? '+' : ''}
                  {trend}%
                </span>
                <span className="text-xs text-muted-foreground">vs last week</span>
              </div>
            )}
          </div>
          <div className={cn('flex items-center justify-center w-12 h-12 rounded-xl', colors.bg)}>
            <Icon className={cn('w-6 h-6', colors.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
