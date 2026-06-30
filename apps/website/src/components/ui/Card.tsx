import { forwardRef, type HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const base = 'rounded-xl transition-all duration-[250ms] cubic-bezier(0.16,1,0.3,1)';

const variants = {
  default: 'bg-surface border border-border',
  elevated: 'bg-surface border border-border shadow-md',
  ghost: 'bg-transparent',
};

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', padding = 'md', hover, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`
        ${base}
        ${variants[variant]}
        ${paddings[padding]}
        ${hover ? 'hover:-translate-y-0.5 hover:shadow-lg hover:border-border-hover cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <header ref={ref} className={`mb-4 ${className}`} {...props}>{children}</header>
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', children, ...props }, ref) => (
    <h3 ref={ref} className={`heading-md ${className}`} {...props}>{children}</h3>
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', children, ...props }, ref) => (
    <p ref={ref} className={`text-sm text-foreground-secondary mt-1 ${className}`} {...props}>{children}</p>
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>{children}</div>
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <footer ref={ref} className={`mt-6 pt-4 border-t border-border flex items-center gap-3 ${className}`} {...props}>
      {children}
    </footer>
  )
);
CardFooter.displayName = 'CardFooter';
