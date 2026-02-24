'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  ArrowLeft,
  Trash2,
  Edit3,
  FolderOpen,
  ArrowRight,
  CheckSquare,
  Square,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardContent, Modal, Input } from '@/components/ui';
import { BLOCK_TYPE_LABELS, BLOCK_TYPE_COLORS, type Block, type Collection } from '@/types';
import { getBlocks, getBlocksByCollection, moveBlocksToCollection } from '@/lib/blocks';
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} from '@/lib/collections';
import { cn } from '@/utils/cn';

const UNCATEGORIZED_ID = '__uncategorized__';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allBlocks, setAllBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 상세 뷰
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [collectionBlocks, setCollectionBlocks] = useState<Block[]>([]);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);

  // 블록 선택
  const [selectedBlockIds, setSelectedBlockIds] = useState<Set<string>>(new Set());

  // 모달
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);

  // 폼
  const [formName, setFormName] = useState('');
  const [formEmoji, setFormEmoji] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);

  // 데이터 로드
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [collectionsData, blocksData] = await Promise.all([getCollections(), getBlocks()]);
        setCollections(collectionsData);
        setAllBlocks(blocksData);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        toast.error('데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // 컬렉션별 블록 수 계산
  const blockCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    let uncategorized = 0;
    for (const block of allBlocks) {
      if (block.collectionId) {
        counts[block.collectionId] = (counts[block.collectionId] || 0) + 1;
      } else {
        uncategorized++;
      }
    }
    counts[UNCATEGORIZED_ID] = uncategorized;
    return counts;
  }, [allBlocks]);

  // 상세 뷰 열기
  const handleOpenCollection = async (collectionId: string) => {
    setActiveCollectionId(collectionId);
    setSelectedBlockIds(new Set());
    setIsLoadingBlocks(true);
    try {
      const realId = collectionId === UNCATEGORIZED_ID ? null : collectionId;
      const blocks = await getBlocksByCollection(realId);
      setCollectionBlocks(blocks);
    } catch (error) {
      console.error('블록 로드 실패:', error);
      toast.error('블록을 불러오는 데 실패했습니다.');
    } finally {
      setIsLoadingBlocks(false);
    }
  };

  // 목록으로 돌아가기
  const handleBack = () => {
    setActiveCollectionId(null);
    setCollectionBlocks([]);
    setSelectedBlockIds(new Set());
  };

  // 컬렉션 생성
  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error('컬렉션 이름을 입력해주세요.');
      return;
    }
    try {
      const col = await createCollection(
        formName.trim(),
        formEmoji.trim() || undefined,
        formDescription.trim() || undefined
      );
      setCollections((prev) => [col, ...prev]);
      toast.success(`"${col.name}" 컬렉션이 생성되었습니다.`);
    } catch (error) {
      console.error('컬렉션 생성 실패:', error);
      toast.error('컬렉션 생성에 실패했습니다.');
    }
    setShowCreateModal(false);
    resetForm();
  };

  // 컬렉션 편집
  const handleEdit = async () => {
    if (!editingCollection || !formName.trim()) return;
    try {
      const updated = await updateCollection(editingCollection.id, {
        name: formName.trim(),
        emoji: formEmoji.trim() || undefined,
        description: formDescription.trim() || undefined,
      });
      if (updated) {
        setCollections((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        toast.success('컬렉션이 수정되었습니다.');
      }
    } catch (error) {
      console.error('컬렉션 수정 실패:', error);
      toast.error('컬렉션 수정에 실패했습니다.');
    }
    setShowEditModal(false);
    setEditingCollection(null);
    resetForm();
  };

  // 컬렉션 삭제
  const handleDelete = async () => {
    if (!deletingCollection) return;
    try {
      await deleteCollection(deletingCollection.id);
      setCollections((prev) => prev.filter((c) => c.id !== deletingCollection.id));
      // 삭제된 컬렉션 블록들 미분류로 업데이트
      setAllBlocks((prev) =>
        prev.map((b) =>
          b.collectionId === deletingCollection.id ? { ...b, collectionId: null } : b
        )
      );
      if (activeCollectionId === deletingCollection.id) {
        handleBack();
      }
      toast.success('컬렉션이 삭제되었습니다. 블록은 미분류로 이동합니다.');
    } catch (error) {
      console.error('컬렉션 삭제 실패:', error);
      toast.error('컬렉션 삭제에 실패했습니다.');
    }
    setShowDeleteModal(false);
    setDeletingCollection(null);
  };

  // 블록 이동
  const handleMoveBlocks = async (targetCollectionId: string) => {
    const realTarget = targetCollectionId === UNCATEGORIZED_ID ? null : targetCollectionId;
    const ids = Array.from(selectedBlockIds);
    try {
      await moveBlocksToCollection(ids, realTarget);
      // allBlocks 업데이트
      setAllBlocks((prev) =>
        prev.map((b) => (ids.includes(b.id) ? { ...b, collectionId: realTarget } : b))
      );
      // 현재 뷰에서 이동된 블록 제거
      setCollectionBlocks((prev) => prev.filter((b) => !ids.includes(b.id)));
      setSelectedBlockIds(new Set());
      const targetName =
        targetCollectionId === UNCATEGORIZED_ID
          ? '미분류'
          : collections.find((c) => c.id === targetCollectionId)?.name || '';
      toast.success(`${ids.length}개 블록이 "${targetName}"(으)로 이동되었습니다.`);
    } catch (error) {
      console.error('블록 이동 실패:', error);
      toast.error('블록 이동에 실패했습니다.');
    }
    setShowMoveModal(false);
  };

  // 블록 선택 토글
  const toggleBlockSelect = (id: string) => {
    setSelectedBlockIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedBlockIds.size === collectionBlocks.length) {
      setSelectedBlockIds(new Set());
    } else {
      setSelectedBlockIds(new Set(collectionBlocks.map((b) => b.id)));
    }
  };

  // 편집 시작
  const startEdit = (col: Collection) => {
    setEditingCollection(col);
    setFormName(col.name);
    setFormEmoji(col.emoji || '');
    setFormDescription(col.description || '');
    setShowEditModal(true);
  };

  // 삭제 시작
  const startDelete = (col: Collection) => {
    setDeletingCollection(col);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormEmoji('');
    setFormDescription('');
  };

  // 현재 활성 컬렉션 정보
  const activeCollection =
    activeCollectionId === UNCATEGORIZED_ID
      ? ({ id: UNCATEGORIZED_ID, name: '미분류', emoji: '📁', description: null } as Collection)
      : collections.find((c) => c.id === activeCollectionId) || null;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--color-primary)]"></div>
          <p className="mt-3 text-[var(--color-text-secondary)]">데이터 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // ===================== 상세 뷰 =====================
  if (activeCollectionId && activeCollection) {
    return (
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              뒤로
            </Button>
            <span className="text-2xl">{activeCollection.emoji || '📁'}</span>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              {activeCollection.name}
            </h2>
            <span className="text-sm text-[var(--color-text-secondary)]">
              ({collectionBlocks.length}개)
            </span>
          </div>
          {activeCollectionId !== UNCATEGORIZED_ID && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => startEdit(activeCollection)}>
                <Edit3 className="mr-1 h-4 w-4" />
                편집
              </Button>
              <Button variant="ghost" size="sm" onClick={() => startDelete(activeCollection)}>
                <Trash2 className="mr-1 h-4 w-4" />
                삭제
              </Button>
            </div>
          )}
        </div>

        {/* 선택 컨트롤 */}
        {collectionBlocks.length > 0 && (
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
              {selectedBlockIds.size === collectionBlocks.length ? (
                <CheckSquare className="mr-1 h-4 w-4" />
              ) : (
                <Square className="mr-1 h-4 w-4" />
              )}
              {selectedBlockIds.size === collectionBlocks.length ? '전체 해제' : '전체 선택'}
            </Button>
            {selectedBlockIds.size > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setShowMoveModal(true)}>
                <ArrowRight className="mr-1 h-4 w-4" />
                {selectedBlockIds.size}개 이동
              </Button>
            )}
          </div>
        )}

        {/* 블록 리스트 */}
        {isLoadingBlocks ? (
          <div className="flex items-center justify-center py-12">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : collectionBlocks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-[var(--color-text-secondary)]">
              <FolderOpen className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>이 컬렉션에 블록이 없습니다.</p>
              <p className="mt-1 text-sm">
                이미지를 분석할 때 이 컬렉션을 선택하거나, 다른 컬렉션에서 블록을 이동하세요.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {collectionBlocks.map((block) => {
              const isSelected = selectedBlockIds.has(block.id);
              return (
                <div
                  key={block.id}
                  onClick={() => toggleBlockSelect(block.id)}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/50'
                  )}
                >
                  <div className="pt-0.5">
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4 text-[var(--color-primary)]" />
                    ) : (
                      <Square className="h-4 w-4 text-[var(--color-text-secondary)]" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center rounded px-2 py-0.5 text-xs font-medium text-white',
                      BLOCK_TYPE_COLORS[block.blockType]
                    )}
                  >
                    {BLOCK_TYPE_LABELS[block.blockType]}
                  </span>
                  <p className="line-clamp-2 flex-1 text-sm text-[var(--color-text-primary)]">
                    {block.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* 이동 모달 */}
        <Modal isOpen={showMoveModal} onClose={() => setShowMoveModal(false)} title="블록 이동">
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-secondary)]">
              {selectedBlockIds.size}개 블록을 이동할 컬렉션을 선택하세요.
            </p>
            <div className="max-h-[300px] space-y-2 overflow-y-auto">
              {/* 미분류 */}
              {activeCollectionId !== UNCATEGORIZED_ID && (
                <div
                  onClick={() => handleMoveBlocks(UNCATEGORIZED_ID)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
                >
                  <span className="text-lg">📁</span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    미분류
                  </span>
                </div>
              )}
              {/* 컬렉션들 */}
              {collections
                .filter((c) => c.id !== activeCollectionId)
                .map((col) => (
                  <div
                    key={col.id}
                    onClick={() => handleMoveBlocks(col.id)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
                  >
                    <span className="text-lg">{col.emoji || '📁'}</span>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {col.name}
                    </span>
                  </div>
                ))}
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setShowMoveModal(false)}>
                취소
              </Button>
            </div>
          </div>
        </Modal>

        {/* 편집 모달 */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingCollection(null);
            resetForm();
          }}
          title="컬렉션 편집"
        >
          <div className="space-y-4">
            <Input
              label="컬렉션 이름"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="예: 웨딩 사진"
            />
            <Input
              label="이모지 (선택)"
              value={formEmoji}
              onChange={(e) => setFormEmoji(e.target.value)}
              placeholder="예: 🎨"
            />
            <Input
              label="설명 (선택)"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="이 컬렉션에 대한 설명"
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
              >
                취소
              </Button>
              <Button onClick={handleEdit}>저장</Button>
            </div>
          </div>
        </Modal>

        {/* 삭제 확인 모달 */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingCollection(null);
          }}
          title="컬렉션 삭제"
        >
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-secondary)]">
              &quot;{deletingCollection?.name}&quot; 컬렉션을 삭제하시겠습니까?
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              컬렉션만 삭제되며, 소속 블록은 &quot;미분류&quot;로 이동합니다.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingCollection(null);
                }}
              >
                취소
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // ===================== 목록 뷰 =====================
  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">컬렉션 관리</h2>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />새 컬렉션
        </Button>
      </div>

      {collections.length === 0 && blockCounts[UNCATEGORIZED_ID] === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-[var(--color-text-secondary)]">
            <FolderOpen className="mx-auto mb-3 h-12 w-12 opacity-30" />
            <p>컬렉션이 없습니다.</p>
            <p className="mt-1 text-sm">
              이미지를 분석할 때 컬렉션을 만들거나, 위의 버튼으로 직접 생성하세요.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* 컬렉션 카드들 */}
          {collections.map((col) => (
            <Card key={col.id} hover>
              <CardContent className="cursor-pointer" onClick={() => handleOpenCollection(col.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{col.emoji || '📁'}</span>
                    <div>
                      <h3 className="font-semibold text-[var(--color-text-primary)]">{col.name}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {blockCounts[col.id] || 0}개 블록
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(col);
                      }}
                      className="rounded p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startDelete(col);
                      }}
                      className="rounded p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {col.description && (
                  <p className="mt-2 line-clamp-1 text-xs text-[var(--color-text-secondary)]">
                    {col.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {/* 미분류 카드 */}
          {blockCounts[UNCATEGORIZED_ID] > 0 && (
            <Card hover>
              <CardContent
                className="cursor-pointer"
                onClick={() => handleOpenCollection(UNCATEGORIZED_ID)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📁</span>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text-primary)]">미분류</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {blockCounts[UNCATEGORIZED_ID]}개 블록
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                  컬렉션에 속하지 않은 블록
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 생성 모달 */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="새 컬렉션"
      >
        <div className="space-y-4">
          <Input
            label="컬렉션 이름"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="예: 웨딩 사진"
          />
          <Input
            label="이모지 (선택)"
            value={formEmoji}
            onChange={(e) => setFormEmoji(e.target.value)}
            placeholder="예: 💒"
          />
          <Input
            label="설명 (선택)"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="이 컬렉션에 대한 설명"
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              취소
            </Button>
            <Button onClick={handleCreate}>생성</Button>
          </div>
        </div>
      </Modal>

      {/* 편집 모달 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCollection(null);
          resetForm();
        }}
        title="컬렉션 편집"
      >
        <div className="space-y-4">
          <Input
            label="컬렉션 이름"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="예: 웨딩 사진"
          />
          <Input
            label="이모지 (선택)"
            value={formEmoji}
            onChange={(e) => setFormEmoji(e.target.value)}
            placeholder="예: 🎨"
          />
          <Input
            label="설명 (선택)"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="이 컬렉션에 대한 설명"
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
            >
              취소
            </Button>
            <Button onClick={handleEdit}>저장</Button>
          </div>
        </div>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingCollection(null);
        }}
        title="컬렉션 삭제"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            &quot;{deletingCollection?.name}&quot; 컬렉션을 삭제하시겠습니까?
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            컬렉션만 삭제되며, 소속 블록은 &quot;미분류&quot;로 이동합니다.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingCollection(null);
              }}
            >
              취소
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
