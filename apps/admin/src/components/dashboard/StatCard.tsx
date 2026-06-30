'use client';

import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon: React.ReactNode;
  color?: 'emerald' | 'amber' | 'red' | 'blue' | 'purple';
}

export function StatCard({ title, value, trend, icon, color = 'emerald' }: StatCardProps) {
  const colors = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:border-foreground/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground font-medium truncate">{title}</p>
          <p className="text-2xl font-semibold text-foreground tracking-tight mt-1.5">{value}</p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-1.5">{trend}</p>
          )}
        </div>
        <div className={cn('p-2.5 rounded-lg shrink-0', colors[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
