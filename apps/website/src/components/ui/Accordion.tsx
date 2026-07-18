'use client';

import { useState, type ReactNode, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccordionItem {
  id: string;
  trigger: ReactNode;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  multiple?: boolean;
  defaultOpenIds?: string[];
  className?: string;
}

export function Accordion({ items, multiple = false, defaultOpenIds = [], className }: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpenIds));

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className={cn('divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden', className)}>
      {items.map((item) => {
        const open = openIds.has(item.id);
        return (
          <div key={item.id} className="bg-surface">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`${item.id}-panel`}
              onClick={() => toggle(item.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-secondary active:scale-[0.99] duration-fast"
            >
              <span className="font-medium text-foreground">{item.trigger}</span>
              <ChevronDown
                aria-hidden
                className={cn(
                  'h-4 w-4 shrink-0 text-foreground-tertiary transition-transform duration-base ease-spring',
                  open && 'rotate-180'
                )}
              />
            </button>
            <div
              id={`${item.id}-panel`}
              role="region"
              className="grid transition-[grid-template-rows] duration-base ease-spring"
              style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-4 pt-1 text-foreground-secondary">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { useId };
