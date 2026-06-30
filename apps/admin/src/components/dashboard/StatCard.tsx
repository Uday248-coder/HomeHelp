'use client';

import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon: React.ReactNode;
  color?: 'emerald' | 'amber' | 'red' | 'blue' | 'purple';
}

const colorMap = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  red: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
};

export function StatCard({ title, value, trend, icon, color = 'emerald' }: StatCardProps) {
  const c = colorMap[color];

  return (
    <div className="card-dashboard p-5 group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground font-medium truncate">{title}</p>
          <p className="text-2xl font-semibold text-foreground tracking-tight mt-1.5 tabular-nums">{value}</p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-1.5">{trend}</p>
          )}
        </div>
        <div className={cn('p-2.5 rounded-lg shrink-0 transition-transform duration-200 group-hover:scale-105', c.bg, c.text)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
