'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition-all duration-300 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';

    const variants = {
      primary:
        'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98] shadow-lg',
      secondary:
        'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 active:scale-[0.98]',
      ghost:
        'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100 active:scale-[0.98]',
      danger:
        'bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 active:scale-[0.98]',
      neon:
        'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white hover:shadow-xl hover:shadow-purple-200 active:scale-[0.98] shadow-lg shadow-purple-200',
    };

    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-14 px-8 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
