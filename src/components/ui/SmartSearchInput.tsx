'use client';

import { useRef, useEffect } from 'react';
import { Search, X, Clock, Trash2 } from 'lucide-react';
import { useSearchInput, clearSearchHistory } from '@/hooks/useSmartSearch';

interface SmartSearchInputProps {
  placeholder?: string;
  searchType: string;
  onSearch: (query: string) => void;
  className?: string;
  autoFocus?: boolean;
}

export function SmartSearchInput({
  placeholder = '검색...',
  searchType,
  onSearch,
  className = '',
  autoFocus = false,
}: SmartSearchInputProps) {
  const {
    query,
    setQuery,
    isFocused,
    setIsFocused,
    history,
    handleSelectSuggestion,
    clearQuery,
    saveSearch,
  } = useSearchInput(searchType);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsFocused]);

  // 검색어 변경 시 부모에게 알림
  const handleChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSearch();
    setIsFocused(false);
  };

  const handleClear = () => {
    clearQuery();
    onSearch('');
    inputRef.current?.focus();
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSearchHistory(searchType);
    // 강제 리렌더링을 위해 query 변경
    setQuery((prev) => prev);
  };

  const showSuggestions = isFocused && (history.length > 0 || query);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pr-10 pl-10 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-0.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] hover:text-[var(--color-text-primary)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* 추천/히스토리 드롭다운 */}
      {showSuggestions && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[var(--color-border)] bg-white py-1 shadow-lg">
          {query ? (
            <div className="px-3 py-2 text-xs text-[var(--color-text-secondary)]">
              &quot;{query}&quot; 검색 중...
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                  최근 검색
                </span>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    삭제
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <div className="px-3 py-2 text-xs text-[var(--color-text-secondary)]">
                  검색 기록이 없습니다
                </div>
              ) : (
                history.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleSelectSuggestion(item);
                      onSearch(item);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-background)]"
                  >
                    <Clock className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
                    {item}
                  </button>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
