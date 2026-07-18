'use client';

import { useEffect, useRef, useState, type ReactNode, type ElementType } from 'react';
import { cn } from '@/lib/utils';

export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className,
  animation = 'fade-in-up',
  threshold = 0.15,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
  animation?: 'fade-in' | 'fade-in-up' | 'scale-in' | 'slide-in-up';
  threshold?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, once]);

  return (
    <Tag
      ref={ref}
      className={cn(className)}
      style={{
        opacity: visible ? undefined : 0,
        animation: visible ? `${animation} var(--dur-entry, 0.48s) var(--ease-spring, cubic-bezier(0.16,1,0.3,1)) forwards` : undefined,
        animationDelay: visible ? `${delay}ms` : undefined,
        willChange: visible ? 'opacity, transform' : 'auto',
      }}
    >
      {children}
    </Tag>
  );
}

export function StaggerGroup({
  children,
  className,
  gap = 80,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn(className)}
      data-stagger="true"
      data-visible={visible}
    >
      {/* children that are direct ReactNodes get stagger via CSS counter is complex; instead we apply gap via prop and assign nth-child delays */}
      <style jsx>{`
        [data-stagger='true'][data-visible='true'] > * {
          animation: fadeInUp var(--dur-entry, 0.48s) var(--ease-spring, cubic-bezier(0.16,1,0.3,1)) backwards;
        }
        [data-stagger='true'][data-visible='true'] > *:nth-child(1) { animation-delay: ${0}ms; }
        [data-stagger='true'][data-visible='true'] > *:nth-child(2) { animation-delay: ${gap}ms; }
        [data-stagger='true'][data-visible='true'] > *:nth-child(3) { animation-delay: ${gap * 2}ms; }
        [data-stagger='true'][data-visible='true'] > *:nth-child(4) { animation-delay: ${gap * 3}ms; }
        [data-stagger='true'][data-visible='true'] > *:nth-child(5) { animation-delay: ${gap * 4}ms; }
        [data-stagger='true'][data-visible='true'] > *:nth-child(6) { animation-delay: ${gap * 5}ms; }
        [data-stagger='true'][data-visible='true'] > *:nth-child(7) { animation-delay: ${gap * 6}ms; }
        [data-stagger='true'][data-visible='true'] > *:nth-child(8) { animation-delay: ${gap * 7}ms; }
      `}</style>
      {children}
    </Tag>
  );
}

export function AnimatedNumber({
  target,
  duration = 1200,
  prefix = '',
  suffix = '',
  className,
}: {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setValue(target);
      return;
    }
    const el = ref.current;
    if (!el) {
      setValue(target);
      return;
    }
    let started = false;
    let start = 0;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        started = true;
        start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 4);
          setValue(Math.round(target * eased));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  );
}
