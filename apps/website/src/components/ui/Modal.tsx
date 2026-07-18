'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  size?: 'md' | 'lg' | 'sm';
  align?: 'center' | 'sheet';
  closeOnOverlay?: boolean;
  showClose?: boolean;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  align = 'center',
  closeOnOverlay = true,
  showClose = true,
  primaryAction,
  secondaryAction,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const focusables = ref.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    focusables?.[0]?.focus();
  }, [open]);

  if (!open) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };
  const isSheet = align === 'sheet';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center overflow-y-auto"
      role="dialog"
      aria-modal="true"
      ref={ref}
    >
      <div
        className="fixed inset-0 bg-surface-inverse/45 backdrop-blur-sm animate-overlay-in"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden
      />
      <div
        className={cn(
          'relative z-10 w-full glass-strong shadow-xl m-auto',
          widths[size],
          isSheet
            ? 'mt-auto rounded-t-3xl animate-slide-in-up'
            : 'my-auto rounded-3xl animate-scale-in'
        )}
        role="document"
      >
        {(title || showClose) && (
          <div className={cn('flex items-start gap-4', isSheet ? 'p-6 pb-3' : 'p-6 pb-3')}>
            {title && (
              <div className="flex-1">
                <h2 className="heading-sm">{title}</h2>
                {description && (
                  <p className="mt-1 text-sm text-foreground-secondary">{description}</p>
                )}
              </div>
            )}
            {showClose && (
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="flex h-9 w-9 items-center justify-center rounded-pill text-foreground-secondary transition hover:bg-surface-secondary hover:text-foreground active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        <div className={cn(isSheet ? 'px-6 pb-4' : 'px-6 pb-4')}>{children}</div>
        {(primaryAction || secondaryAction) && (
          <div className={cn('flex items-center justify-end gap-3 border-t border-border p-4', isSheet && 'pb-6')}>
            {secondaryAction}
            {primaryAction}
          </div>
        )}
      </div>
    </div>
  );
}
