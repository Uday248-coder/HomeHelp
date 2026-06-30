'use client';

import { useState } from 'react';

interface BarChartProps {
  data: Array<{ date: string; revenue: number }>;
}

export function BarChart({ data }: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        No revenue data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.revenue), 1);

  return (
    <div className="h-48 flex items-end gap-1.5" role="img" aria-label="Weekly revenue bar chart">
      {data.map((item, index) => {
        const height = (item.revenue / maxValue) * 100;
        const day = new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short' });
        const isHovered = hoveredIndex === index;

        return (
          <div
            key={index}
            className="flex-1 flex flex-col items-center gap-1.5 group"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="relative w-full flex justify-center">
              <span
                className={`text-[10px] font-medium text-muted-foreground whitespace-nowrap absolute -top-5 transition-all duration-150 ${
                  isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
                }`}
              >
                ₹{item.revenue.toLocaleString()}
              </span>
            </div>
            <div
              className="w-full rounded-[3px] transition-all duration-200 origin-bottom"
              style={{
                height: `${Math.max(height, 3)}%`,
                background: isHovered
                  ? 'linear-gradient(180deg, hsl(160, 84%, 45%) 0%, hsl(160, 72%, 38%) 100%)'
                  : 'linear-gradient(180deg, hsl(160, 84%, 45%, 0.8) 0%, hsl(160, 72%, 38%, 0.7) 100%)',
                transform: isHovered ? 'scaleY(1.04)' : 'scaleY(1)',
              }}
            />
            <span className={`text-[10px] font-medium transition-colors duration-150 ${
              isHovered ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {day}
            </span>
          </div>
        );
      })}
    </div>
  );
}
