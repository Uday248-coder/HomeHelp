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
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  const radius = 40;
  const center = 50;

  return (
    <div className="flex items-center justify-center gap-8">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {segments.map((segment, index) => {
            const x1 = center + radius * Math.cos((Math.PI * segment.startAngle) / 180);
            const y1 = center + radius * Math.sin((Math.PI * segment.startAngle) / 180);
            const x2 = center + radius * Math.cos((Math.PI * (segment.startAngle + segment.angle)) / 180);
            const y2 = center + radius * Math.sin((Math.PI * (segment.startAngle + segment.angle)) / 180);
            const largeArc = segment.angle > 180 ? 1 : 0;

            const pathData = [
              `M ${center} ${center}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
              `Z`,
            ].join(' ');

            return (
              <path
                key={index}
                d={pathData}
                fill={segment.color}
                className="transition-opacity duration-150 hover:opacity-80 cursor-pointer"
              />
            );
          })}
          <circle cx={center} cy={center} r="22" fill="hsl(var(--card))" />
        </svg>
      </div>

      <div className="space-y-2.5">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-sm text-muted-foreground">{segment.label}</span>
            <span className="text-sm font-semibold text-foreground ml-auto tabular-nums">
              {Math.round(segment.percentage * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
