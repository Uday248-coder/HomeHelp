import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-gradient-to-r from-muted via-muted/80 to-muted bg-[length:200%_100%] animate-shimmer',
        className
      )}
      aria-hidden="true"
    />
  );
}
