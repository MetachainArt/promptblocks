'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Trash2, ChevronDown, ChevronRight, Copy, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Input, Button, Card, CardContent, Modal } from '@/components/ui';
import {
  BLOCK_TYPES,
  BLOCK_TYPE_LABELS,
  BLOCK_TYPE_DESCRIPTIONS,
  BLOCK_TYPE_COLORS,
  type BlockType,
  type Block,
  type Collection,
} from '@/types';
import { getBlocks, toggleFavorite, deleteBlock } from '@/lib/blocks';
import { getCollections } from '@/lib/collections';
import { cn } from '@/utils/cn';
import { completeOnboardingStep } from '@/lib/onboarding';
import { trackProductEvent } from '@/lib/analytics';

export default function LibraryPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTypes, setExpandedTypes] = useState<Set<BlockType>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<Block | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionFilter, setCollectionFilter] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'favorite' | 'type'>('recent');

  const loadBlocks = async () => {
    try {
      const loaded = await getBlocks();
      setBlocks(loaded);

      // 블록이 있는 타입만 기본 펼침
      const typesWithBlocks = new Set<BlockType>();
      loaded.forEach((block) => typesWithBlocks.add(block.blockType));
      setExpandedTypes(typesWithBlocks);
    } catch (error) {
      console.error('블록 로드 실패:', error);
      toast.error('블록을 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
    getCollections().then(setCollections);
    completeOnboardingStep('visit_library');
  }, []);

  // 검색 디바운스 (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!debouncedSearch.trim()) return;
    trackProductEvent('library_search', { queryLength: debouncedSearch.trim().length });
  }, [debouncedSearch]);

  const toggleExpanded = (type: BlockType) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedTypes(new Set(BLOCK_TYPES));
  };

  const collapseAll = () => {
    setExpandedTypes(new Set());
  };

  const handleFavoriteToggle = async (block: Block) => {
    try {
      const updated = await toggleFavorite(block.id);
      if (updated) {
        setBlocks((prev) => prev.map((b) => (b.id === block.id ? updated : b)));
        toast.success(updated.isFavorite ? '즐겨찾기 추가' : '즐겨찾기 해제');
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
      toast.error('즐겨찾기 변경에 실패했습니다.');
    }
  };

  const handleDeleteClick = (block: Block) => {
    setBlockToDelete(block);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (blockToDelete) {
      try {
        await deleteBlock(blockToDelete.id);
        setBlocks((prev) => prev.filter((b) => b.id !== blockToDelete.id));
        toast.success('블록이 삭제되었습니다.');
      } catch (error) {
        console.error('블록 삭제 실패:', error);
        toast.error('블록 삭제에 실패했습니다.');
      }
      setShowDeleteModal(false);
      setBlockToDelete(null);
    }
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('복사되었습니다!');
  };

  // 검색 필터링 (디바운스 적용)
  const filteredBlocks = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    const searched = blocks.filter((block) => {
      const matchesSearch =
        !query ||
        block.content.toLowerCase().includes(query) ||
        block.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        BLOCK_TYPE_LABELS[block.blockType].toLowerCase().includes(query);

      const matchesCollection =
        collectionFilter === 'all'
          ? true
          : collectionFilter === 'uncategorized'
            ? !block.collectionId
            : block.collectionId === collectionFilter;

      const matchesFavorite = favoritesOnly ? block.isFavorite : true;

      return matchesSearch && matchesCollection && matchesFavorite;
    });

    const sorted = [...searched];
    if (sortBy === 'favorite') {
      sorted.sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));
    }
    if (sortBy === 'type') {
      sorted.sort((a, b) => a.blockType.localeCompare(b.blockType));
    }
    if (sortBy === 'recent') {
      sorted.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    }

    return sorted;
  }, [blocks, collectionFilter, debouncedSearch, favoritesOnly, sortBy]);

  // 타입별로 그룹핑
  const blocksByType = BLOCK_TYPES.reduce(
    (acc, type) => {
      acc[type] = filteredBlocks.filter((b) => b.blockType === type);
      return acc;
    },
    {} as Record<BlockType, Block[]>
  );

  const totalBlocks = blocks.length;
  const filteredTotal = filteredBlocks.length;

  return (
    <div className="space-y-4">
      {/* 검색 및 컨트롤 */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]" />
            <Input
              placeholder="블록 내용 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={collectionFilter}
              onChange={(event) => setCollectionFilter(event.target.value)}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-2 text-xs"
            >
              <option value="all">전체 컬렉션</option>
              <option value="uncategorized">미분류</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.emoji || '📁'} {collection.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as 'recent' | 'favorite' | 'type')}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-2 text-xs"
            >
              <option value="recent">최신순</option>
              <option value="favorite">즐겨찾기 우선</option>
              <option value="type">타입순</option>
            </select>

            <Button
              variant={favoritesOnly ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFavoritesOnly((prev) => !prev)}
            >
              <Star className="mr-1 h-4 w-4" />
              즐겨찾기만
            </Button>

            <span className="text-sm text-[var(--color-text-secondary)]">
              {searchQuery ? `${filteredTotal}/${totalBlocks}개` : `총 ${totalBlocks}개`}
            </span>
            <Button variant="ghost" size="sm" onClick={expandAll}>
              모두 펼치기
            </Button>
            <Button variant="ghost" size="sm" onClick={collapseAll}>
              모두 접기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 로딩 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--color-primary)]"></div>
            <p className="mt-3 text-[var(--color-text-secondary)]">블록 불러오는 중...</p>
          </div>
        </div>
      ) : totalBlocks === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[var(--color-text-secondary)]">
              저장된 블록이 없습니다. 이미지를 분석해서 블록을 저장해보세요!
            </p>
            <Button className="mt-4" onClick={() => (window.location.href = '/decompose')}>
              이미지 분석하러 가기
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* 아코디언 리스트 */
        <div className="space-y-2">
          {BLOCK_TYPES.map((type) => {
            const typeBlocks = blocksByType[type];
            const isExpanded = expandedTypes.has(type);
            const hasBlocks = typeBlocks.length > 0;
            const colorClass = BLOCK_TYPE_COLORS[type];

            return (
              <div
                key={type}
                className={cn(
                  'overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]',
                  !hasBlocks && 'opacity-50'
                )}
              >
                {/* 아코디언 헤더 */}
                <button
                  onClick={() => hasBlocks && toggleExpanded(type)}
                  disabled={!hasBlocks}
                  className={cn(
                    'flex w-full items-center gap-3 p-4 text-left transition-colors',
                    hasBlocks && 'hover:bg-[var(--color-background)]',
                    !hasBlocks && 'cursor-not-allowed'
                  )}
                >
                  {/* 확장 아이콘 */}
                  <div className="text-[var(--color-text-secondary)]">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </div>

                  {/* 타입 배지 */}
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center rounded px-2 py-1 text-xs font-medium text-white',
                      colorClass
                    )}
                  >
                    {BLOCK_TYPE_LABELS[type]}
                  </span>

                  {/* 설명 */}
                  <span className="flex-1 truncate text-sm text-[var(--color-text-secondary)]">
                    {BLOCK_TYPE_DESCRIPTIONS[type]}
                  </span>

                  {/* 카운트 */}
                  <span
                    className={cn(
                      'shrink-0 text-sm font-medium',
                      hasBlocks
                        ? 'text-[var(--color-primary)]'
                        : 'text-[var(--color-text-secondary)]'
                    )}
                  >
                    {typeBlocks.length}개
                  </span>
                </button>

                {/* 아코디언 내용 */}
                {isExpanded && hasBlocks && (
                  <div className="border-t border-[var(--color-border)] bg-[var(--color-background)] p-3">
                    <div className="space-y-2">
                      {typeBlocks.map((block) => (
                        <div
                          key={block.id}
                          className="group flex items-start gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                        >
                          {/* 블록 내용 */}
                          <p className="line-clamp-2 flex-1 text-sm text-[var(--color-text-primary)]">
                            {block.content}
                          </p>

                          {/* 액션 버튼들 */}
                          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => handleCopyContent(block.content)}
                              className="rounded p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                              title="복사"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleFavoriteToggle(block)}
                              className={cn(
                                'rounded p-1.5 hover:bg-[var(--color-warning)]/10',
                                block.isFavorite
                                  ? 'text-[var(--color-warning)]'
                                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-warning)]'
                              )}
                              title="즐겨찾기"
                            >
                              <Star className={cn('h-4 w-4', block.isFavorite && 'fill-current')} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(block)}
                              className="rounded p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)]"
                              title="삭제"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setBlockToDelete(null);
        }}
        title="블록 삭제"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            이 블록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </p>
          {blockToDelete && (
            <div className="rounded-md bg-[var(--color-background)] p-3 text-sm">
              <p className="font-medium text-[var(--color-text-primary)]">
                {BLOCK_TYPE_LABELS[blockToDelete.blockType]}
              </p>
              <p className="mt-1 line-clamp-2 text-[var(--color-text-secondary)]">
                {blockToDelete.content}
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setBlockToDelete(null);
              }}
            >
              취소
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
