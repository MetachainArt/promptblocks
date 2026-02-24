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
            className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-xl border bg-[var(--color-surface-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] transition-all placeholder:text-[var(--color-text-secondary)]',
            'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-[var(--color-error)]'
              : 'border-[var(--color-border)] hover:border-gray-300',
            className
          )}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-[var(--color-error)]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
