'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';

// 퍼지 매칭 유틸리티
export function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase().trim();

  // 정확한 부분 문자열 매칭
  if (textLower.includes(queryLower)) return true;

  // 단어 단위 매칭 (띄어쓰기 무시)
  const textWords = textLower.split(/\s+/);
  const queryWords = queryLower.split(/\s+/);

  return queryWords.every((qWord) =>
    textWords.some((tWord) => tWord.includes(qWord) || qWord.includes(tWord))
  );
}

// 유사도 점수 계산 (0-100)
export function calculateRelevance(text: string, query: string): number {
  if (!query) return 100;
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase().trim();

  // 정확히 일치하면 최고점수
  if (textLower === queryLower) return 100;

  // 시작 부분에 일치
  if (textLower.startsWith(queryLower)) return 90;

  // 단어 시작 부분에 일치
  const words = textLower.split(/\s+/);
  if (words.some((w) => w.startsWith(queryLower))) return 80;

  // 포함되어 있음
  if (textLower.includes(queryLower)) return 70;

  // 퍼지 매칭
  if (fuzzyMatch(text, query)) return 50;

  return 0;
}

// 검색어 하이라이팅
export function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  const queryLower = query.toLowerCase().trim();
  const regex = new RegExp(`(${escapeRegExp(queryLower)})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 font-semibold">$1</mark>');
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 로컬 스토리지 기반 검색 히스토리
const SEARCH_HISTORY_KEY = 'promptblocks_search_history';
const MAX_HISTORY_ITEMS = 10;

export function getSearchHistory(searchType: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(`${SEARCH_HISTORY_KEY}_${searchType}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToSearchHistory(searchType: string, query: string): void {
  if (!query || typeof window === 'undefined') return;
  const trimmed = query.trim();
  if (!trimmed) return;

  try {
    const history = getSearchHistory(searchType);
    // 중복 제거하고 최신으로
    const newHistory = [trimmed, ...history.filter((h) => h !== trimmed)].slice(
      0,
      MAX_HISTORY_ITEMS
    );
    localStorage.setItem(`${SEARCH_HISTORY_KEY}_${searchType}`, JSON.stringify(newHistory));
  } catch {
    // ignore
  }
}

export function clearSearchHistory(searchType: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${SEARCH_HISTORY_KEY}_${searchType}`);
}

// 스마트 서치 훅
interface UseSmartSearchOptions<T> {
  items: T[];
  searchFields: (keyof T)[];
  searchQuery: string;
  sortByRelevance?: boolean;
  additionalFilter?: (item: T) => boolean;
  searchType?: string; // for history tracking
}

export function useSmartSearch<T>({
  items,
  searchFields,
  searchQuery,
  sortByRelevance = true,
  additionalFilter,
  searchType,
}: UseSmartSearchOptions<T>) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const results = useMemo(() => {
    const query = searchQuery.trim();

    let filtered = items.filter((item) => {
      // 추가 필터가 있으면 적용
      if (additionalFilter && !additionalFilter(item)) return false;

      // 검색어가 없으면 모두 포함
      if (!query) return true;

      // 각 필드에서 퍼지 매칭 검사
      return searchFields.some((field) => {
        const value = item[field];
        if (typeof value === 'string') {
          return fuzzyMatch(value, query);
        }
        if (Array.isArray(value)) {
          return value.some((v) => typeof v === 'string' && fuzzyMatch(v, query));
        }
        return false;
      });
    });

    // 관련도 순 정렬
    if (sortByRelevance && query) {
      filtered = filtered.sort((a, b) => {
        const scoreA = Math.max(
          ...searchFields.map((field) => {
            const value = a[field];
            if (typeof value === 'string') return calculateRelevance(value, query);
            if (Array.isArray(value)) {
              return Math.max(
                ...value.map((v) => (typeof v === 'string' ? calculateRelevance(v, query) : 0))
              );
            }
            return 0;
          })
        );
        const scoreB = Math.max(
          ...searchFields.map((field) => {
            const value = b[field];
            if (typeof value === 'string') return calculateRelevance(value, query);
            if (Array.isArray(value)) {
              return Math.max(
                ...value.map((v) => (typeof v === 'string' ? calculateRelevance(v, query) : 0))
              );
            }
            return 0;
          })
        );
        return scoreB - scoreA;
      });
    }

    return filtered;
  }, [items, searchFields, searchQuery, sortByRelevance, additionalFilter]);

  // 검색어 저장
  const saveSearch = useCallback(() => {
    if (searchType && searchQuery.trim()) {
      addToSearchHistory(searchType, searchQuery.trim());
    }
  }, [searchType, searchQuery]);

  // 검색 히스토리
  const history = useMemo(() => {
    return searchType ? getSearchHistory(searchType) : [];
  }, [searchType, searchQuery]); // searchQuery가 변경될 때마다 새로 로드

  return {
    results,
    history,
    showSuggestions,
    setShowSuggestions,
    saveSearch,
    highlightMatch: useCallback((text: string) => highlightMatch(text, searchQuery), [searchQuery]),
  };
}

// 검색 인풋 컴포넌트용 훅
export function useSearchInput(searchType?: string) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const history = useMemo(() => {
    return searchType && isFocused ? getSearchHistory(searchType) : [];
  }, [searchType, isFocused]);

  const handleSelectSuggestion = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setIsFocused(false);
  }, []);

  const clearQuery = useCallback(() => {
    setQuery('');
  }, []);

  const saveSearch = useCallback(() => {
    if (searchType && query.trim()) {
      addToSearchHistory(searchType, query.trim());
    }
  }, [searchType, query]);

  return {
    query,
    setQuery,
    isFocused,
    setIsFocused,
    history: query ? [] : history, // 입력 중일 때는 히스토리 숨김
    handleSelectSuggestion,
    clearQuery,
    saveSearch,
  };
}
