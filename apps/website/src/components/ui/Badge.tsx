import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'neutral' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  children: ReactNode;
}

const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-surface-secondary text-foreground-secondary',
  neutral: 'bg-surface-tertiary text-foreground-secondary',
  success: 'bg-accent-subtle text-accent-active dark:text-accent',
  warning: 'bg-warm-subtle text-warm',
  danger: 'bg-warm/15 text-warm dark:text-warm',
  info: 'bg-surface-tertiary text-foreground-secondary',
  outline: 'bg-transparent border border-border text-foreground-secondary',
  dark: 'bg-surface-inverse text-surface',
};

const sizes: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-[11px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-2',
};

const dotColors: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-foreground-tertiary',
  neutral: 'bg-foreground-tertiary',
  success: 'bg-accent',
  warning: 'bg-warm',
  danger: 'bg-warm',
  info: 'bg-foreground-tertiary',
  outline: 'bg-foreground-tertiary',
  dark: 'bg-surface',
};

export function Badge({
  className, variant = 'default', size = 'md', dot, children, ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-pill tracking-wide',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-pill', dotColors[variant] || dotColors.default)}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
