'use client';

import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-2 block text-sm font-medium text-white"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
          
          <input
            ref={ref}
            id={id}
            className={cn(
              'relative w-full rounded-xl border bg-slate-950/80 px-5 py-4 text-base text-white placeholder:text-slate-500 transition-all',
              'focus:outline-none focus:ring-0 focus:border-[var(--color-primary)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-[var(--color-error)]'
                : 'border-white/10 hover:border-white/20',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-2 text-sm text-[var(--color-error)]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
