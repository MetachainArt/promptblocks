'use client';

import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  variant?: 'default' | 'glass';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, variant = 'default', children, ...props }, ref) => {
    const variantClass = variant === 'glass' ? 'glass-card p-6' : 'bento-card p-6';

    return (
      <div ref={ref} className={cn(variantClass, hover && 'cursor-pointer', className)} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'mb-4 flex items-center justify-between border-b border-gray-100 pb-4',
        className
      )}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('flex items-center gap-2 text-lg font-bold text-gray-900', className)}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-gray-600', className)} {...props} />
  )
);

CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };
