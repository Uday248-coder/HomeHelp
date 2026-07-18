'use client';

import { useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

export interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  ariaLabel?: string;
}

const labels = ['Bad', 'Poor', 'OK', 'Good', 'Great'];

export function Rating({
  value,
  onChange,
  max = 5,
  readOnly = false,
  size = 'md',
  showLabel = false,
  ariaLabel = 'Rating',
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const active = hoverValue ?? value;
  const cls = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' }[size];

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (readOnly) return;
    if (e.key === 'ArrowRight' && value < max) onChange?.(value + 1);
    if (e.key === 'ArrowLeft' && value > 1) onChange?.(value - 1);
    if (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4' || e.key === '5') {
      onChange?.(Number(e.key));
    }
  }

  return (
    <div
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={ariaLabel}
      aria-valuenow={value}
      aria-valuemax={max}
      aria-valuemin={0}
      tabIndex={readOnly ? -1 : 0}
      onKeyDown={onKey}
      className="flex items-center gap-1.5"
    >
      {(Array.from({ length: max }) as number[]).map((_, i) => {
        const filled = i < active;
        return (
          <button
            key={i}
            type="button"
            role={readOnly ? undefined : 'radio'}
            aria-checked={readOnly ? undefined : i === value - 1}
            aria-label={readOnly ? `${i + 1} of ${max}` : `Rate ${i + 1}: ${labels[i]}`}
            disabled={readOnly}
            onClick={readOnly ? undefined : () => onChange?.(i + 1)}
            onMouseEnter={readOnly ? undefined : () => setHoverValue(i + 1)}
            onMouseLeave={readOnly ? undefined : () => setHoverValue(null)}
            className={cn(
              'rounded-pill transition-transform duration-micro ease-spring',
              !readOnly && 'hover:scale-110 active:scale-95',
              readOnly && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                cls,
                filled ? 'fill-warm text-warm' : 'fill-surface-tertiary text-border'
              )}
              strokeWidth={1.5}
              aria-hidden
            />
          </button>
        );
      })}
      {showLabel && value > 0 && value <= max && (
        <span className="ml-2 text-sm font-medium text-foreground">{labels[value - 1]}</span>
      )}
    </div>
  );
}
