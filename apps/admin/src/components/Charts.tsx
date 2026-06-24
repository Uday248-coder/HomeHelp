'use client';

interface WeeklyRevenue {
  date: string;
  revenue: number;
  bookings: number;
}

interface BarChartProps {
  data: WeeklyRevenue[];
}

export function BarChart({ data }: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No revenue data available
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const barMaxHeight = 180;

  return (
    <div className="relative h-48 flex items-end gap-2">
      {data.map((item, index) => {
        const height = (item.revenue / maxRevenue) * barMaxHeight;
        const day = new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short' });
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full flex justify-center">
              <span className="text-[10px] font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">
                ₹{item.revenue.toLocaleString()}
              </span>
            </div>
            <div
              className="w-full max-w-[32px] rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 transition-all cursor-pointer"
              style={{ height: `${Math.max(height, 4)}px` }}
            />
            <span className="text-[10px] text-muted-foreground">{day}</span>
          </div>
        );
      })}
    </div>
  );
}

interface StatsSummaryProps {
  completed: number;
  cancelled: number;
  pending: number;
  inProgress: number;
}

export function StatsSummary({ completed, cancelled, pending, inProgress }: StatsSummaryProps) {
  const total = completed + cancelled + pending + inProgress || 1;

  const segments = [
    { label: 'Completed', value: completed, color: 'bg-emerald-500' },
    { label: 'In Progress', value: inProgress, color: 'bg-blue-500' },
    { label: 'Pending', value: pending, color: 'bg-amber-500' },
    { label: 'Cancelled', value: cancelled, color: 'bg-red-500' },
  ];

  const dashArray = 2 * Math.PI * 40;
  let offset = 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          {segments
            .filter((s) => s.value > 0)
            .map((segment) => {
              const percentage = segment.value / total;
              const length = percentage * dashArray;
              const segOffset = offset;
              offset += length;
              return (
                <circle
                  key={segment.label}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${length} ${dashArray - length}`}
                  strokeDashoffset={-segOffset}
                  className={segment.color.replace('bg-', 'text-')}
                />
              );
            })}
          <text x="50" y="50" textAnchor="middle" dy="0.35em" className="fill-foreground text-lg font-bold" transform="rotate(90, 50, 50)">
            {total}
          </text>
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="ml-auto font-medium text-foreground">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
