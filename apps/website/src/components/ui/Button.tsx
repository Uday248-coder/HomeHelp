'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium leading-none ' +
  'transition-all duration-[180ms] cubic-bezier(0.16,1,0.3,1) ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ' +
  'disabled:opacity-50 disabled:pointer-events-none select-none';

const variants = {
  primary:
    'bg-accent text-white shadow-[0_1px_3px_hsl(160_84%_39%_/_0.3)] ' +
    'hover:bg-accent-hover hover:shadow-[0_4px_12px_hsl(160_84%_39%_/_0.35)] ' +
    'active:bg-accent-active active:shadow-[0_1px_2px_hsl(160_84%_39%_/_0.3)] active:scale-[0.97]',
  secondary:
    'bg-surface text-foreground border border-border ' +
    'hover:bg-surface-secondary hover:border-border-hover ' +
    'active:bg-surface-tertiary active:scale-[0.97]',
  ghost:
    'bg-transparent text-foreground-secondary ' +
    'hover:bg-surface-secondary hover:text-foreground ' +
    'active:bg-surface-tertiary active:scale-[0.97]',
  outline:
    'bg-transparent text-foreground border border-border ' +
    'hover:bg-surface-secondary hover:border-border-hover ' +
    'active:bg-surface-tertiary active:scale-[0.97]',
  destructive:
    'bg-red-600 text-white shadow-sm ' +
    'hover:bg-red-700 active:bg-red-800 active:scale-[0.97]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2.5 text-sm rounded-lg',
  lg: 'px-5 py-3 text-sm rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
);

Button.displayName = 'Button';
