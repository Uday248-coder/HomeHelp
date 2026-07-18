'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface RadioCardOption<T extends string> {
  value: T;
  title: string;
  description?: string;
  icon?: ReactNode;
  badge?: string;
}

export interface RadioCardsProps<T extends string> {
  value: T | null;
  onChange: (value: T) => void;
  options: RadioCardOption<T>[];
  columns?: 1 | 2 | 3;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function RadioCards<T extends string>({
  value,
  onChange,
  options,
  columns = 2,
  name,
  className,
  size = 'md',
}: RadioCardsProps<T>) {
  const sizeClass = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  }[size];

  return (
    <div
      role="radiogroup"
      className={cn(
        'grid gap-3',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 sm:grid-cols-2',
        columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            data-name={name}
            onClick={() => onChange(opt.value)}
            className={cn(
              'group relative text-left card-base transition-[transform,border-color,box-shadow] duration-fast ease-spring',
              sizeClass,
              selected
                ? 'border-accent shadow-accent ring-accent'
                : 'hover:border-border-hover hover:-translate-y-px hover:shadow-md active:scale-[0.985]',
              !selected && 'active:scale-[0.985]'
            )}
          >
            <div className="flex items-start gap-3">
              {opt.icon && (
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl [&_svg]:h-5 [&_svg]:w-5 transition-colors',
                    selected ? 'bg-accent text-foreground-on-accent' : 'bg-surface-tertiary text-foreground-secondary'
                  )}
                  aria-hidden
                >
                  {opt.icon}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn('font-medium', selected ? 'text-foreground' : 'text-foreground')}>
                    {opt.title}
                  </p>
                  {opt.badge && (
                    <span className="rounded-pill bg-accent-subtle px-2 py-0.5 text-[11px] font-medium text-accent">
                      {opt.badge}
                    </span>
                  )}
                </div>
                {opt.description && (
                  <p className="mt-0.5 text-sm text-foreground-secondary">{opt.description}</p>
                )}
              </div>
              <span
                className={cn(
                  'mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-pill border-2 transition-all duration-fast ease-spring',
                  selected ? 'border-accent bg-accent' : 'border-border group-hover:border-border-hover'
                )}
                aria-hidden
              >
                {selected && (
                  <span className="h-1.5 w-1.5 rounded-pill bg-foreground-on-accent" />
                )}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
