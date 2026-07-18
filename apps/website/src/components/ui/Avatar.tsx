import { cn } from '@/lib/utils';

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const initial = (name || '').trim().charAt(0).toUpperCase() || '?';
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-pill bg-accent text-foreground-on-accent font-semibold overflow-hidden',
        sizes[size],
        className
      )}
      aria-hidden
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name || 'Avatar'} className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}
