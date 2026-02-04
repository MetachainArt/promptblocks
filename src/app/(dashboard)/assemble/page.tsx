'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Copy, Save, Trash2, Search, X, Shuffle, GripVertical, Clock, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardContent, Textarea, Modal, Input } from '@/components/ui';
import { TemplateSelector } from '@/components/blocks/TemplateSelector';
import { BLOCK_TYPES, BLOCK_TYPE_LABELS, type BlockType, type Block, type Preset } from '@/types';
import { getBlocks } from '@/lib/blocks';
import { getPresets, savePresetWithBlocks, deletePreset as deletePresetApi, getLocalPresetBlocks } from '@/lib/presets';
import { type Template } from '@/lib/templates';
import {
  getPromptHistory,
  addPromptHistory,
  deletePromptHistory,
  clearPromptHistory,
  type PromptHistoryItem,
} from '@/lib/promptHistory';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AssembleBlock {
  id: string;
  blockType: BlockType;
  content: string;
  originalId: string;
}

// 드래그 가능한 블록 아이템 컴포넌트
function SortableBlockItem({
  block,
  index,
  editingBlockId,
  editingContent,
  onRemove,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
}: {
  block: AssembleBlock;
  index: number;
  editingBlockId: string | null;
  editingContent: string;
  onRemove: (id: string) => void;
  onEditStart: (block: AssembleBlock) => void;
  onEditChange: (value: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const isEditing = editingBlockId === block.id;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
    >
      {/* 드래그 핸들 */}
      <div className="flex flex-col items-center gap-1 pt-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab rounded p-0.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-center text-xs text-[var(--color-text-secondary)]">{index + 1}</span>
      </div>

      {/* 블록 내용 */}
      <div className="flex-1 min-w-0">
        <span className="inline-block rounded bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
          {BLOCK_TYPE_LABELS[block.blockType]}
        </span>
        {isEditing ? (
          <input
            ref={inputRef}
            value={editingContent}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onEditSave();
              if (e.key === 'Escape') onEditCancel();
            }}
            onBlur={onEditSave}
            className="mt-1 w-full rounded border border-[var(--color-primary)] bg-[var(--color-background)] px-2 py-1 text-sm text-[var(--color-text-primary)] outline-none"
          />
        ) : (
          <p
            onClick={() => onEditStart(block)}
            className="mt-1 text-sm text-[var(--color-text-secondary)] line-clamp-2 cursor-pointer hover:text-[var(--color-text-primary)] transition-colors"
            title="클릭하여 편집"
          >
            {block.content}
          </p>
        )}
      </div>

      {/* 삭제 버튼 */}
      <button
        onClick={() => onRemove(block.id)}
        className="rounded p-1 text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}


const DEFAULT_NEGATIVE_PROMPT = 'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry';

export default function AssemblePage() {
  const [assembleBlocks, setAssembleBlocks] = useState<AssembleBlock[]>([]);
  const [libraryBlocks, setLibraryBlocks] = useState<Block[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<BlockType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [negativePrompt, setNegativePrompt] = useState(DEFAULT_NEGATIVE_PROMPT);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);

  // dnd-kit 센서
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // 데이터 로드 (Supabase 또는 localStorage)
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [blocksData, presetsData] = await Promise.all([
          getBlocks(),
          getPresets(),
        ]);
        setLibraryBlocks(blocksData);
        setPresets(presetsData);
        setPromptHistory(getPromptHistory());
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        toast.error('데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const generatedPrompt = assembleBlocks.map((b) => b.content).join(', ');

  const filteredLibraryBlocks = libraryBlocks.filter((block) => {
    const matchesSearch = block.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || block.blockType === selectedType;
    const notAlreadyAdded = !assembleBlocks.some((ab) => ab.originalId === block.id);
    const matchesTemplate = !activeTemplate || activeTemplate.blockTypes.includes(block.blockType);
    return matchesSearch && matchesType && notAlreadyAdded && matchesTemplate;
  });

  const handleAddBlock = (block: Block) => {
    const newBlock: AssembleBlock = {
      id: crypto.randomUUID(),
      blockType: block.blockType,
      content: block.content,
      originalId: block.id,
    };
    setAssembleBlocks((prev) => [...prev, newBlock]);
    toast.success(`${BLOCK_TYPE_LABELS[block.blockType]} 블록 추가됨`);
  };

  const handleRemoveBlock = (id: string) => {
    setAssembleBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  // 드래그 앤 드롭 핸들러
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setAssembleBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 인라인 편집
  const handleEditStart = (block: AssembleBlock) => {
    setEditingBlockId(block.id);
    setEditingContent(block.content);
  };

  const handleEditSave = () => {
    if (editingBlockId && editingContent.trim()) {
      setAssembleBlocks((prev) =>
        prev.map((b) => (b.id === editingBlockId ? { ...b, content: editingContent.trim() } : b))
      );
    }
    setEditingBlockId(null);
    setEditingContent('');
  };

  const handleEditCancel = () => {
    setEditingBlockId(null);
    setEditingContent('');
  };

  const handleCopyPrompt = async () => {
    if (!generatedPrompt) {
      toast.error('조립할 블록을 추가해주세요.');
      return;
    }

    let fullPrompt = generatedPrompt;
    if (negativePrompt.trim()) {
      fullPrompt += `\n\nNegative prompt: ${negativePrompt.trim()}`;
    }

    try {
      await navigator.clipboard.writeText(fullPrompt);

      // 히스토리에 저장
      addPromptHistory(generatedPrompt, negativePrompt.trim(), assembleBlocks.length);
      setPromptHistory(getPromptHistory());

      toast.success('프롬프트가 클립보드에 복사되었습니다!');
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      toast.error('프리셋 이름을 입력해주세요.');
      return;
    }

    try {
      const blocksData = assembleBlocks.map((b) => ({
        blockType: b.blockType,
        content: b.content,
        originalId: b.originalId,
      }));

      const preset = await savePresetWithBlocks(presetName, blocksData);
      if (preset) {
        setPresets((prev) => [preset, ...prev]);
        toast.success('프리셋이 저장되었습니다!');
      } else {
        toast.error('프리셋 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('프리셋 저장 실패:', error);
      toast.error('프리셋 저장에 실패했습니다.');
    }

    setShowSaveModal(false);
    setPresetName('');
  };

  const handleLoadPreset = async (preset: Preset) => {
    const localBlocks = getLocalPresetBlocks(preset.id);
    if (localBlocks) {
      setAssembleBlocks(localBlocks.map((b) => ({
        id: crypto.randomUUID(),
        blockType: b.blockType as BlockType,
        content: b.content,
        originalId: b.originalId,
      })));
      setShowPresetsModal(false);
      toast.success(`"${preset.name}" 프리셋을 불러왔습니다.`);
      return;
    }

    toast.info(`"${preset.name}" 프리셋 - 블록을 라이브러리에서 선택해주세요.`);
    setShowPresetsModal(false);
  };

  const handleDeletePreset = async (presetId: string) => {
    try {
      await deletePresetApi(presetId);
      setPresets((prev) => prev.filter((p) => p.id !== presetId));
      toast.success('프리셋이 삭제되었습니다.');
    } catch (error) {
      console.error('프리셋 삭제 실패:', error);
      toast.error('프리셋 삭제에 실패했습니다.');
    }
  };

  const handleClearAll = () => {
    setAssembleBlocks([]);
    setActiveTemplate(null);
    toast.success('모든 블록이 제거되었습니다.');
  };

  const handleRandomTemplate = () => {
    if (libraryBlocks.length === 0) {
      toast.error('라이브러리에 저장된 블록이 없습니다. 먼저 이미지를 분석해주세요.');
      return;
    }

    const blocksByType = new Map<string, Block[]>();
    for (const block of libraryBlocks) {
      const list = blocksByType.get(block.blockType) || [];
      list.push(block);
      blocksByType.set(block.blockType, list);
    }

    const randomBlocks: AssembleBlock[] = [];
    for (const [, blocks] of blocksByType) {
      const randomBlock = blocks[Math.floor(Math.random() * blocks.length)];
      randomBlocks.push({
        id: crypto.randomUUID(),
        blockType: randomBlock.blockType,
        content: randomBlock.content,
        originalId: randomBlock.id,
      });
    }

    setActiveTemplate(null);
    setAssembleBlocks(randomBlocks);
    toast.success(`${randomBlocks.length}개 타입에서 무작위 블록이 조립되었습니다!`);
  };

  const handleSelectTemplate = (template: Template) => {
    setActiveTemplate(template);
    setAssembleBlocks([]);
    toast.success(`"${template.name}" 템플릿이 적용되었습니다. 라이브러리에서 블록을 추가하세요!`);
    setShowLibraryModal(true);
  };

  // 히스토리 항목 복사
  const handleCopyHistoryItem = async (item: PromptHistoryItem) => {
    let fullPrompt = item.prompt;
    if (item.negativePrompt) {
      fullPrompt += `\n\nNegative prompt: ${item.negativePrompt}`;
    }
    try {
      await navigator.clipboard.writeText(fullPrompt);
      toast.success('히스토리 프롬프트가 복사되었습니다!');
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    deletePromptHistory(id);
    setPromptHistory(getPromptHistory());
  };

  const handleClearHistory = () => {
    clearPromptHistory();
    setPromptHistory([]);
    toast.success('히스토리가 모두 삭제되었습니다.');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto"></div>
          <p className="mt-3 text-[var(--color-text-secondary)]">데이터 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* 왼쪽: 블록 목록 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              선택된 블록 ({assembleBlocks.length})
            </h2>
            {activeTemplate && (
              <p className="text-sm text-[var(--color-primary)] mt-0.5">
                {activeTemplate.icon} {activeTemplate.name} 템플릿
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <TemplateSelector onSelect={handleSelectTemplate} />
            <Button variant="secondary" size="sm" onClick={handleRandomTemplate} className="gap-2">
              <Shuffle className="h-4 w-4" />
              무작위 조립
            </Button>
            {assembleBlocks.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearAll}>
                <Trash2 className="mr-1 h-4 w-4" />
                전체 삭제
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setShowLibraryModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              블록 추가
            </Button>
          </div>
        </div>

        {assembleBlocks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-[var(--color-text-secondary)]">
              {activeTemplate ? (
                <>
                  <p className="text-lg">{activeTemplate.icon}</p>
                  <p className="mt-2 font-medium text-[var(--color-text-primary)]">{activeTemplate.name}</p>
                  <p className="mt-1 text-sm">라이브러리에서 다음 블록 타입을 추가하세요:</p>
                  <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                    {activeTemplate.blockTypes.map((type) => (
                      <span
                        key={type}
                        className="inline-block rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs text-[var(--color-primary)]"
                      >
                        {BLOCK_TYPE_LABELS[type]}
                      </span>
                    ))}
                  </div>
                  <Button variant="secondary" className="mt-4" onClick={() => setShowLibraryModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    블록 추가하기
                  </Button>
                </>
              ) : (
                <>
                  <p>선택된 블록이 없습니다.</p>
                  <p className="mt-1 text-sm">추천 템플릿을 선택하거나 라이브러리에서 블록을 추가하세요.</p>
                  <div className="mt-4 flex justify-center gap-3">
                    <TemplateSelector onSelect={handleSelectTemplate} />
                    <Button variant="ghost" onClick={handleRandomTemplate} className="gap-2">
                      <Shuffle className="h-4 w-4" />
                      무작위 조립
                    </Button>
                    <Button variant="ghost" onClick={() => setShowLibraryModal(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      라이브러리에서 추가
                    </Button>
                    {presets.length > 0 && (
                      <Button variant="ghost" onClick={() => setShowPresetsModal(true)}>
                        프리셋 불러오기
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={assembleBlocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {assembleBlocks.map((block, index) => (
                  <SortableBlockItem
                    key={block.id}
                    block={block}
                    index={index}
                    editingBlockId={editingBlockId}
                    editingContent={editingContent}
                    onRemove={handleRemoveBlock}
                    onEditStart={handleEditStart}
                    onEditChange={setEditingContent}
                    onEditSave={handleEditSave}
                    onEditCancel={handleEditCancel}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* 오른쪽: 프롬프트 미리보기 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">생성된 프롬프트</h2>
          <div className="flex gap-2">
            {promptHistory.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setShowHistoryModal(true)}>
                <Clock className="mr-1 h-4 w-4" />
                히스토리 ({promptHistory.length})
              </Button>
            )}
            {presets.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setShowPresetsModal(true)}>
                프리셋 ({presets.length})
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardContent>
            <Textarea
              value={generatedPrompt}
              readOnly
              placeholder="블록을 추가하면 프롬프트가 생성됩니다..."
              className="min-h-[200px] bg-[var(--color-background)]"
            />
            {generatedPrompt && (
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                {generatedPrompt.length}자 · {assembleBlocks.length}개 블록
              </p>
            )}
          </CardContent>
        </Card>

        {/* 네거티브 프롬프트 */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Negative Prompt</label>
              <div className="flex gap-2">
                <button onClick={() => setNegativePrompt(DEFAULT_NEGATIVE_PROMPT)} className="text-xs text-purple-400 hover:text-purple-600 font-medium">
                  기본값 복원
                </button>
                {negativePrompt && (
                  <button onClick={() => setNegativePrompt('')} className="text-xs text-red-400 hover:text-red-500 font-medium">
                    지우기
                  </button>
                )}
              </div>
            </div>
            <Textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="제외할 요소를 입력하세요... (예: low quality, blurry, distorted)"
              className="min-h-[80px] bg-[var(--color-background)]"
            />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleCopyPrompt} disabled={assembleBlocks.length === 0} className="flex-1">
            <Copy className="mr-2 h-4 w-4" />
            클립보드에 복사
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowSaveModal(true)}
            disabled={assembleBlocks.length === 0}
          >
            <Save className="mr-2 h-4 w-4" />
            프리셋 저장
          </Button>
        </div>
      </div>

      {/* 라이브러리 모달 */}
      <Modal
        isOpen={showLibraryModal}
        onClose={() => {
          setShowLibraryModal(false);
          setSearchQuery('');
          setSelectedType('all');
        }}
        title={activeTemplate ? `${activeTemplate.icon} ${activeTemplate.name} - 블록 추가` : "라이브러리에서 블록 추가"}
      >
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]" />
              <Input
                placeholder="블록 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as BlockType | 'all')}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
            >
              <option value="all">전체</option>
              {(activeTemplate ? activeTemplate.blockTypes : BLOCK_TYPES).map((type) => (
                <option key={type} value={type}>
                  {BLOCK_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          {activeTemplate && (
            <div className="rounded-lg bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 p-3">
              <p className="text-sm text-[var(--color-primary)]">
                💡 <strong>{activeTemplate.name}</strong> 템플릿에 맞는 블록 타입만 표시됩니다.
              </p>
            </div>
          )}

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {filteredLibraryBlocks.length === 0 ? (
              <div className="py-8 text-center text-[var(--color-text-secondary)]">
                {libraryBlocks.length === 0 ? (
                  <>
                    <p>저장된 블록이 없습니다.</p>
                    <Button
                      variant="secondary"
                      className="mt-3"
                      onClick={() => {
                        setShowLibraryModal(false);
                        window.location.href = '/decompose';
                      }}
                    >
                      이미지 분석하러 가기
                    </Button>
                  </>
                ) : (
                  <p>검색 결과가 없거나 모든 블록이 이미 추가되었습니다.</p>
                )}
              </div>
            ) : (
              filteredLibraryBlocks.map((block) => (
                <div
                  key={block.id}
                  onClick={() => handleAddBlock(block)}
                  className="cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
                >
                  <span className="inline-block rounded bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
                    {BLOCK_TYPE_LABELS[block.blockType]}
                  </span>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)] line-clamp-2">
                    {block.content}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setShowLibraryModal(false)}>
              닫기
            </Button>
          </div>
        </div>
      </Modal>

      {/* 프리셋 저장 모달 */}
      <Modal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} title="프리셋 저장">
        <div className="space-y-4">
          <Input
            label="프리셋 이름"
            placeholder="예: 시네마틱 인물 사진"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
          />
          <p className="text-sm text-[var(--color-text-secondary)]">
            {assembleBlocks.length}개의 블록이 프리셋으로 저장됩니다.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
              취소
            </Button>
            <Button onClick={handleSavePreset}>저장</Button>
          </div>
        </div>
      </Modal>

      {/* 프리셋 목록 모달 */}
      <Modal
        isOpen={showPresetsModal}
        onClose={() => setShowPresetsModal(false)}
        title="저장된 프리셋"
      >
        <div className="space-y-4">
          {presets.length === 0 ? (
            <div className="py-8 text-center text-[var(--color-text-secondary)]">
              저장된 프리셋이 없습니다.
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleLoadPreset(preset)}
                  >
                    <p className="font-medium text-[var(--color-text-primary)]">{preset.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {new Date(preset.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePreset(preset.id)}
                    className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setShowPresetsModal(false)}>
              닫기
            </Button>
          </div>
        </div>
      </Modal>

      {/* 프롬프트 히스토리 모달 */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="프롬프트 히스토리"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            복사한 프롬프트가 자동으로 저장됩니다. (최대 50개)
          </p>

          {promptHistory.length === 0 ? (
            <div className="py-8 text-center text-[var(--color-text-secondary)]">
              저장된 히스토리가 없습니다.
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {promptHistory.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                >
                  <p className="text-sm text-[var(--color-text-primary)] line-clamp-3">
                    {item.prompt}
                  </p>
                  {item.negativePrompt && (
                    <p className="mt-1 text-xs text-[var(--color-error)]/70 line-clamp-1">
                      Negative: {item.negativePrompt}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {item.blockCount}개 블록 · {new Date(item.copiedAt).toLocaleString()}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleCopyHistoryItem(item)}
                        className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                        title="복사"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteHistoryItem(item.id)}
                        className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)]"
                        title="삭제"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            {promptHistory.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearHistory}>
                <Trash2 className="mr-1 h-4 w-4" />
                전체 삭제
              </Button>
            )}
            <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
              닫기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
