'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

const inputSizeClasses = {
  sm: 'text-xs px-3 py-2',
  md: 'text-sm px-4 py-3',
  lg: 'text-base px-4 py-3.5',
};

const iconSizeClass = '[&_svg]:h-4 [&_svg]:w-4';

function useFieldId(id: string | undefined, label: string | undefined) {
  if (id) return id;
  if (!label) return undefined;
  return `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, iconLeft, iconRight, inputSize = 'md', ...props }, ref) => {
    const fieldId = useFieldId(id, label);
    const describedBy = error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <span
              className={cn('pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary', iconSizeClass)}
              aria-hidden
            >
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={fieldId}
            className={cn(
              'input-base',
              inputSizeClasses[inputSize],
              iconLeft && 'pl-10',
              iconRight && 'pr-10',
              error && 'ring-warm',
              className
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            {...props}
          />
          {iconRight && (
            <span
              className={cn('absolute right-3 top-1/2 -translate-y-1/2 text-foreground-tertiary', iconSizeClass)}
              aria-hidden
            >
              {iconRight}
            </span>
          )}
        </div>
        {error && (
          <p id={`${fieldId}-error`} className="mt-1.5 text-sm text-warm" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${fieldId}-helper`} className="mt-1.5 text-sm text-foreground-tertiary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
