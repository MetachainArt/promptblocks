'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  showCloseButton = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-2 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div
        className={cn(
          'relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl rounded-b-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl sm:max-h-[85vh] sm:rounded-3xl',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          className
        )}
      >
        {(title || showCloseButton) && (
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5 py-4 sm:px-7 sm:py-5">
            {title && <h2 className="text-xl font-bold text-gray-900">{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="모달 닫기"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">닫기</span>
              </button>
            )}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-7 sm:py-6">{children}</div>
      </div>
    </div>
  );
}
