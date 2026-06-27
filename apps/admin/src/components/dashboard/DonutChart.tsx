'use client';

interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>;
}

export function DonutChart({ data }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  const segments = data.map((item) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    return { ...item, startAngle, angle, percentage };
  });
  
  if (total === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center space-x-8">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {segments.map((segment, index) => {
            const x1 = 50 + 40 * Math.cos((Math.PI * segment.startAngle) / 180);
            const y1 = 50 + 40 * Math.sin((Math.PI * segment.startAngle) / 180);
            const x2 = 50 + 40 * Math.cos((Math.PI * (segment.startAngle + segment.angle)) / 180);
            const y2 = 50 + 40 * Math.sin((Math.PI * (segment.startAngle + segment.angle)) / 180);
            
            const largeArc = segment.angle > 180 ? 1 : 0;
            
            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
              `Z`,
            ].join(' ');
            
            return (
              <path
                key={index}
                d={pathData}
                fill={segment.color}
                className="transition-all hover:opacity-80 cursor-pointer"
              />
            );
          })}
          <circle cx="50" cy="50" r="25" fill="hsl(var(--card))" />
        </svg>
      </div>
      
      <div className="space-y-2">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-sm text-muted-foreground">{segment.label}</span>
            <span className="text-sm font-semibold text-foreground">
              {Math.round(segment.percentage * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
