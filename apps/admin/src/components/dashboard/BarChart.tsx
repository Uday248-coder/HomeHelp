'use client';

interface BarChartProps {
  data: Array<{ date: string; revenue: number }>;
}

export function BarChart({ data }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.revenue), 1);
  
  return (
    <div className="h-48 flex items-end justify-between space-x-2">
      {data.map((item, index) => {
        const height = (item.revenue / maxValue) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-emerald-600 rounded-t-lg hover:bg-emerald-500 transition-all cursor-pointer"
              style={{ height: `${Math.max(height, 4)}%` }}
            />
            <span className="text-xs text-muted-foreground mt-2">{item.date}</span>
          </div>
        );
      })}
    </div>
  );
}
