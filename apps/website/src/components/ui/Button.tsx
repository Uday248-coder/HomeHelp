'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode, type AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'warm';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium leading-none ' +
  'transition-[transform,background-color,border-color,color,box-shadow] ' +
  'duration-fast ease-spring ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-surface ' +
  'disabled:opacity-55 disabled:pointer-events-none disabled:transform-none ' +
  'select-none no-tap-highlight [-webkit-tap-highlight-color:transparent]';

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-accent text-foreground-on-accent shadow-md ' +
    'hover:bg-accent-hover hover:shadow-accent hover:-translate-y-px ' +
    'active:bg-accent-active active:shadow-sm active:scale-[0.97]',
  secondary:
    'bg-surface text-foreground border border-border ' +
    'hover:bg-surface-secondary hover:border-border-hover hover:-translate-y-px ' +
    'active:bg-surface-tertiary active:scale-[0.97]',
  ghost:
    'bg-transparent text-foreground-secondary ' +
    'hover:bg-surface-secondary hover:text-foreground ' +
    'active:bg-surface-tertiary active:scale-[0.97]',
  outline:
    'bg-transparent text-accent border border-accent/40 ' +
    'hover:bg-accent-subtle hover:border-accent hover:-translate-y-px ' +
    'active:scale-[0.97]',
  destructive:
    'bg-warm text-white shadow-warm ' +
    'hover:bg-warm-hover hover:-translate-y-px ' +
    'active:scale-[0.97]',
  warm:
    'bg-warm text-white shadow-warm ' +
    'hover:bg-warm-hover hover:-translate-y-px ' +
    'active:scale-[0.97]',
};

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3.5 py-2 text-xs rounded-pill',
  md: 'px-5 py-2.5 text-sm rounded-pill',
  lg: 'px-7 py-3.5 text-base rounded-pill',
  icon: 'h-10 w-10 rounded-pill',
};

interface ButtonComponentProps extends ButtonProps {
  asChild?: false;
}

function ButtonImpl(
  { className, variant = 'primary', size = 'md', loading, iconLeft, iconRight, fullWidth, children, disabled, ...props }: ButtonComponentProps,
  ref: React.Ref<HTMLButtonElement>
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : iconLeft ? (
        <span className="shrink-0 [&_svg]:h-4 [&_svg]:w-4" aria-hidden>{iconLeft}</span>
      ) : null}
      {children}
      {!loading && iconRight ? (
        <span className="shrink-0 [&_svg]:h-4 [&_svg]:w-4" aria-hidden>{iconRight}</span>
      ) : null}
    </button>
  );
}

const ButtonBase = forwardRef<HTMLButtonElement, ButtonComponentProps>(ButtonImpl);
ButtonBase.displayName = 'Button';

export { ButtonBase as Button };

export interface LinkButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'warm';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
  href: string;
}

function LinkButtonImpl(
  { className, variant = 'primary', size = 'md', loading, iconLeft, iconRight, fullWidth, children, href, ...props }: LinkButtonProps,
  ref: React.Ref<HTMLAnchorElement>
) {
  return (
    <a
      ref={ref}
      href={href}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : iconLeft ? (
        <span className="shrink-0 [&_svg]:h-4 [&_svg]:w-4" aria-hidden>{iconLeft}</span>
      ) : null}
      {children}
      {!loading && iconRight ? (
        <span className="shrink-0 [&_svg]:h-4 [&_svg]:w-4" aria-hidden>{iconRight}</span>
      ) : null}
    </a>
  );
}

const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(LinkButtonImpl);
LinkButton.displayName = 'LinkButton';

export { LinkButton };