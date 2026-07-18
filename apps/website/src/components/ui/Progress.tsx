'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export interface ProgressProps {
  current: number;
  total: number;
  labels?: string[];
  className?: string;
}

export function Progress({ current, total, labels, className }: ProgressProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setDisplayPct(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div className={cn('w-full', className)} aria-label={`Step ${current} of ${total}`}>
      <div className="mb-2.5 flex items-center justify-between">
        {labels && labels.length === total ? (
          <>
            <p className="text-sm font-medium text-foreground">{labels[current - 1]}</p>
            <p className="text-xs text-foreground-tertiary tabular-nums">
              <span className="text-foreground">{String(current).padStart(2, '0')}</span>
              {' / '}
              {String(total).padStart(2, '0')}
            </p>
          </>
        ) : (
          <p className="text-xs text-foreground-tertiary tabular-nums">
            Step {current} of {total}
          </p>
        )}
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-tertiary"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-pill bg-accent shadow-accent transition-[width] duration-base ease-spring"
          style={{ width: `${displayPct}%` }}
        />
      </div>
    </div>
  );
}

export function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li
            key={i}
            className={cn(
              'flex h-2 w-2 items-center rounded-pill transition-all duration-base ease-spring',
              active && 'h-2.5 w-6 bg-accent shadow-accent',
              done && 'bg-accent/60',
              !active && !done && 'bg-border'
            )}
            aria-hidden={n !== current}
          >
            <span className="sr-only">Step {n}</span>
          </li>
        );
      })}
    </ol>
  );
}
