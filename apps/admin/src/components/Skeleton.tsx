export function StatCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
      <div className="h-3 bg-muted rounded w-24 mb-3" />
      <div className="h-8 bg-muted rounded w-16" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
      <div className="h-4 bg-muted rounded w-32 mb-6" />
      <div className="h-48 bg-muted rounded" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-muted rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-muted rounded w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5">
            <div className="h-3 bg-muted rounded w-20 mb-3" />
            <div className="h-7 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="h-4 bg-muted rounded w-32 mb-6" />
          <div className="h-48 bg-muted rounded" />
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="h-4 bg-muted rounded w-32 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="h-5 bg-muted rounded w-32 mb-4" />
        <TableSkeleton rows={5} cols={6} />
      </div>
    </div>
  );
}
