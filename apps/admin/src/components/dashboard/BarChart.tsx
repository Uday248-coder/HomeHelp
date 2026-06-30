'use client';

interface BarChartProps {
  data: Array<{ date: string; revenue: number }>;
}

export function BarChart({ data }: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        No revenue data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.revenue), 1);

  return (
    <div className="h-48 flex items-end gap-1.5">
      {data.map((item, index) => {
        const height = (item.revenue / maxValue) * 100;
        const day = new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short' });
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1.5 group">
            <div className="relative w-full flex justify-center">
              <span className="text-[10px] font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 whitespace-nowrap">
                ₹{item.revenue.toLocaleString()}
              </span>
            </div>
            <div
              className="w-full rounded-[3px] bg-emerald-500/80 hover:bg-emerald-500 transition-all duration-150 cursor-pointer origin-bottom"
              style={{ height: `${Math.max(height, 3)}%` }}
            />
            <span className="text-[10px] text-muted-foreground font-medium">{day}</span>
          </div>
        );
      })}
    </div>
  );
}
