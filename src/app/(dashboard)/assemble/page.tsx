'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import NextImage from 'next/image';
import {
  Plus,
  Copy,
  Save,
  Trash2,
  Search,
  X,
  Shuffle,
  GripVertical,
  Clock,
  Lock,
  Unlock,
  Share2,
  RotateCcw,
  Users,
  CheckSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardContent, Textarea, Modal, Input, AutoSaveRecoveryModal } from '@/components/ui';
import { useAutoSave, formatLastSaved, type AutoSaveData } from '@/hooks/useAutoSave';
import { useUndoToast } from '@/hooks/useUndoToast';
import { SmartSearchInput } from '@/components/ui/SmartSearchInput';
import { useSmartSearch, highlightMatch } from '@/hooks/useSmartSearch';
import { TemplateSelector } from '@/components/blocks/TemplateSelector';
import {
  BLOCK_TYPES,
  BLOCK_TYPE_LABELS,
  type BlockType,
  type Block,
  type Preset,
  type Collection,
} from '@/types';
import { getBlocks } from '@/lib/blocks';
import { getCollections } from '@/lib/collections';
import {
  getPresets,
  savePresetWithBlocks,
  deletePreset as deletePresetApi,
  getLocalPresetBlocks,
  getPresetStyleMeta,
  savePresetStyleMeta,
  deletePresetStyleMeta,
  type StylePromptMode,
  type OutputPromptMode,
  type MidjourneyStyleVersion,
} from '@/lib/presets';
import { type Template } from '@/lib/templates';
import {
  getPromptHistory,
  addPromptHistory,
  deletePromptHistory,
  clearPromptHistory,
  type PromptHistoryItem,
} from '@/lib/promptHistory';
import {
  getAssembleSnapshots,
  saveAssembleSnapshot,
  deleteAssembleSnapshot,
  type AssembleSnapshot,
} from '@/lib/assembleSnapshots';
import { createShareLink } from '@/lib/shareLinks';
import { validateAssembledPrompt } from '@/lib/promptQuality';
import { subscribePresence, type PresenceMember } from '@/lib/collaborationPresence';
import { completeOnboardingStep } from '@/lib/onboarding';
import { trackProductEvent } from '@/lib/analytics';
import { clearAutoSave } from '@/lib/autoSave';
import { getIdentitySettings } from '@/lib/userSettings';
import {
  ARTISTS,
  ARTIST_CATEGORY_LABELS,
  ARTIST_CATEGORY_ICONS,
  getRecommendedArtists,
  type Artist,
  type ArtistCategory,
} from '@/lib/artists';
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

const FACE_IDENTITY_BLOCK_TYPES: BlockType[] = ['subject_type', 'appearance'];
const ARTIST_CATEGORY_ORDER: ArtistCategory[] = [
  'photographer',
  'illustrator',
  'anime',
  'concept_art',
  'classic',
];
const SAFE_STYLE_BY_CATEGORY: Record<ArtistCategory, string> = {
  photographer: 'photographic style',
  illustrator: 'illustration style',
  anime: 'anime style',
  concept_art: 'concept art style',
  classic: 'fine art painting style',
};

// 드래그 가능한 블록 아이템 컴포넌트
function SortableBlockItem({
  block,
  index,
  editingBlockId,
  editingContent,
  isLocked,
  isSelected,
  isBulkMode,
  onRemove,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  onToggleLock,
  onToggleSelect,
}: {
  block: AssembleBlock;
  index: number;
  editingBlockId: string | null;
  editingContent: string;
  isLocked: boolean;
  isSelected: boolean;
  isBulkMode: boolean;
  onRemove: (id: string) => void;
  onEditStart: (block: AssembleBlock) => void;
  onEditChange: (value: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onToggleLock: (id: string) => void;
  onToggleSelect: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

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
      className={`group flex items-start gap-2 rounded-lg border p-3 ${
        isSelected 
          ? 'border-indigo-500 bg-indigo-50/50' 
          : isLocked 
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' 
            : 'border-[var(--color-border)] bg-[var(--color-surface)]'
      }`}
    >
      {/* 벌크 선택 체크박스 */}
      {isBulkMode && (
        <div className="flex items-center pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(block.id)}
            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* 드래그 핸들 */}
      <div className="flex flex-col items-center gap-1 pt-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab rounded p-0.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] active:cursor-grabbing"
          aria-label="블록 순서 드래그"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-center text-xs text-[var(--color-text-secondary)]">{index + 1}</span>
      </div>

      {/* 블록 내용 */}
      <div className="min-w-0 flex-1">
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
            className="mt-1 line-clamp-2 cursor-pointer text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
            title="클릭하여 편집"
          >
            {block.content}
          </p>
        )}
      </div>

      {/* 잠금 + 삭제 버튼 */}
      <div className="flex shrink-0 flex-col items-center gap-1">
        <button
          onClick={() => onToggleLock(block.id)}
          className={
            isLocked
              ? 'rounded p-1 text-[var(--color-primary)]'
              : 'rounded p-1 text-[var(--color-text-secondary)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[var(--color-primary)]'
          }
          title={isLocked ? '잠금 해제' : '고정 (무작위 시 유지)'}
          aria-label={isLocked ? '블록 잠금 해제' : '블록 잠금'}
        >
          {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </button>
        <button
          onClick={() => onRemove(block.id)}
          className="rounded p-1 text-[var(--color-text-secondary)] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)]"
          aria-label="블록 삭제"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function getStylePromptFromArtist(artist: Artist, stylePromptMode: StylePromptMode): string {
  if (stylePromptMode === 'artist') {
    return artist.promptFormat;
  }

  const safeCategory = SAFE_STYLE_BY_CATEGORY[artist.category];
  const topTags = artist.tags.slice(0, 3).join(', ');
  if (!topTags) {
    return safeCategory;
  }
  return `${safeCategory}, ${topTags}`;
}

const DEFAULT_NEGATIVE_PROMPT =
  'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry';

export default function AssemblePage() {
  const [assembleBlocks, setAssembleBlocks] = useState<AssembleBlock[]>([]);
  const [libraryBlocks, setLibraryBlocks] = useState<Block[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSnapshotsModal, setShowSnapshotsModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetSearchQuery, setPresetSearchQuery] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [snapshotName, setSnapshotName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<BlockType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [negativePrompt, setNegativePrompt] = useState(DEFAULT_NEGATIVE_PROMPT);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
  const [snapshots, setSnapshots] = useState<AssembleSnapshot[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [randomScopeCollectionId, setRandomScopeCollectionId] = useState<string>('all');
  const [lockedBlockIds, setLockedBlockIds] = useState<Set<string>>(new Set());
  const [presenceMembers, setPresenceMembers] = useState<PresenceMember[]>([]);
  const [identityAnchor, setIdentityAnchor] = useState('');
  const [identityEnabled, setIdentityEnabled] = useState(false);
  const [identityReferenceImage, setIdentityReferenceImage] = useState<string | null>(null);
  const [identityReferenceWeight, setIdentityReferenceWeight] = useState(0.75);
  const [artistCategory, setArtistCategory] = useState<ArtistCategory | 'all'>('all');
  const [artistSearchQuery, setArtistSearchQuery] = useState('');
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);
  const [stylePromptMode, setStylePromptMode] = useState<StylePromptMode>('artist');
  const [outputPromptMode, setOutputPromptMode] = useState<OutputPromptMode>('standard');
  const [midjourneySrefCodes, setMidjourneySrefCodes] = useState('');
  const [midjourneyStyleWeight, setMidjourneyStyleWeight] = useState(100);
  const [midjourneyStyleVersion, setMidjourneyStyleVersion] = useState<MidjourneyStyleVersion>('6');
  const [selectedBlockIds, setSelectedBlockIds] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);

  // dnd-kit 센서
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 데이터 로드 (Supabase 또는 localStorage)
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [blocksData, presetsData, collectionsData] = await Promise.all([
          getBlocks(),
          getPresets(),
          getCollections(),
        ]);
        const identitySettings = await getIdentitySettings();
        setLibraryBlocks(blocksData);
        setPresets(presetsData);
        setCollections(collectionsData);
        setPromptHistory(getPromptHistory());
        setSnapshots(getAssembleSnapshots());
        setIdentityAnchor(identitySettings.identityAnchor);
        setIdentityEnabled(identitySettings.identityEnabled);
        setIdentityReferenceImage(identitySettings.identityReferenceImage);
        setIdentityReferenceWeight(identitySettings.identityReferenceWeight);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        toast.error('데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    return subscribePresence('assemble-room', setPresenceMembers);
  }, []);

  const basePrompt = assembleBlocks.map((b) => b.content).join(', ');
  const generatedPrompt = useMemo(() => {
    if (!basePrompt.trim()) return '';

    const styleSuffix = selectedArtists
      .map((artist) => getStylePromptFromArtist(artist, stylePromptMode))
      .join(', ');
    const promptWithStyle = styleSuffix ? `${basePrompt}, ${styleSuffix}` : basePrompt;

    const hasReference = !!identityReferenceImage;
    const normalizedWeight = Math.max(0, Math.min(1, identityReferenceWeight));
    const anchor = identityAnchor.trim();
    if (!identityEnabled || (!anchor && !hasReference)) return promptWithStyle;

    const anchorParts: string[] = [];
    if (anchor) {
      anchorParts.push(anchor);
    }
    if (hasReference) {
      anchorParts.push(
        `same person as reference image, preserve facial identity, identity consistency weight ${normalizedWeight.toFixed(2)}`
      );
    }

    return `${anchorParts.join(', ')}, ${promptWithStyle}`;
  }, [
    basePrompt,
    identityAnchor,
    identityEnabled,
    identityReferenceImage,
    identityReferenceWeight,
    selectedArtists,
    stylePromptMode,
  ]);

  const promptForDisplay = useMemo(() => {
    if (!generatedPrompt) return '';
    if (outputPromptMode === 'standard') return generatedPrompt;

    const params: string[] = [];
    const trimmedSref = midjourneySrefCodes.trim();
    if (trimmedSref) {
      params.push(`--sref ${trimmedSref}`);
    }

    const normalizedSw = Math.max(0, Math.min(1000, Math.round(midjourneyStyleWeight)));
    params.push(`--sw ${normalizedSw}`);

    if (midjourneyStyleVersion !== 'none') {
      params.push(`--sv ${midjourneyStyleVersion}`);
    }

    if (negativePrompt.trim()) {
      params.push(`--no ${negativePrompt.trim()}`);
    }

    return `${generatedPrompt} ${params.join(' ')}`.trim();
  }, [
    generatedPrompt,
    outputPromptMode,
    midjourneySrefCodes,
    midjourneyStyleWeight,
    midjourneyStyleVersion,
    negativePrompt,
  ]);

  const selectedArtistNameSet = useMemo(
    () => new Set(selectedArtists.map((artist) => artist.name)),
    [selectedArtists]
  );

  // Smart Search: Artists
  const { results: filteredArtists } = useSmartSearch({
    items: ARTISTS,
    searchFields: ['name', 'promptFormat', 'tags'],
    searchQuery: artistSearchQuery,
    additionalFilter: (artist) => artistCategory === 'all' || artist.category === artistCategory,
    searchType: 'artist_search',
  });

  const recommendedArtists = useMemo(() => {
    if (assembleBlocks.length === 0) return [];
    return getRecommendedArtists(
      assembleBlocks.map((block) => block.content),
      artistCategory,
      selectedArtists.map((artist) => artist.name)
    );
  }, [assembleBlocks, artistCategory, selectedArtists]);

  // Smart Search: Presets
  const { results: filteredPresets } = useSmartSearch({
    items: presets,
    searchFields: ['name'],
    searchQuery: presetSearchQuery,
    searchType: 'preset_search',
  });

  // Smart Search: History
  const { results: filteredHistory } = useSmartSearch({
    items: promptHistory,
    searchFields: ['prompt', 'negativePrompt'],
    searchQuery: historySearchQuery,
    searchType: 'history_search',
  });

  // Smart Search: Library Blocks
  const { results: filteredLibraryBlocks } = useSmartSearch({
    items: libraryBlocks,
    searchFields: ['content'],
    searchQuery: searchQuery,
    additionalFilter: (block) => {
      const matchesType = selectedType === 'all' || block.blockType === selectedType;
      const notAlreadyAdded = !assembleBlocks.some((ab) => ab.originalId === block.id);
      const matchesTemplate = !activeTemplate || activeTemplate.blockTypes.includes(block.blockType);
      return matchesType && notAlreadyAdded && matchesTemplate;
    },
    searchType: 'library_search',
  });

  const handleAddBlock = (block: Block) => {
    const newBlock: AssembleBlock = {
      id: crypto.randomUUID(),
      blockType: block.blockType,
      content: block.content,
      originalId: block.id,
    };
    setAssembleBlocks((prev) => [...prev, newBlock]);

    if (identityEnabled && FACE_IDENTITY_BLOCK_TYPES.includes(newBlock.blockType)) {
      setLockedBlockIds((prev) => {
        const next = new Set(prev);
        next.add(newBlock.id);
        return next;
      });
    }

    toast.success(`${BLOCK_TYPE_LABELS[block.blockType]} 블록 추가됨`);
  };

  const handleRemoveBlock = (id: string) => {
    // 삭제 전 블록 데이터 저장
    const blockToRemove = assembleBlocks.find((b) => b.id === id);
    if (!blockToRemove) return;

    const previousBlocks = [...assembleBlocks];
    const previousLockedIds = new Set(lockedBlockIds);

    setAssembleBlocks((prev) => prev.filter((b) => b.id !== id));
    setLockedBlockIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    // 실행취소 토스트 표시
    showDeleteUndo(
      [blockToRemove],
      previousLockedIds,
      (blocks, lockedIds) => {
        setAssembleBlocks(previousBlocks);
        setLockedBlockIds(lockedIds);
        toast.success('삭제한 블록을 복구했습니다');
      }
    );
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

    let fullPrompt = promptForDisplay;
    if (outputPromptMode === 'standard' && negativePrompt.trim()) {
      fullPrompt += `\n\nNegative prompt: ${negativePrompt.trim()}`;
    }

    const quality = validateAssembledPrompt(generatedPrompt, negativePrompt, assembleBlocks.length);
    if (quality.issues.length > 0) {
      toast.warning(`품질 점수 ${quality.score}점: ${quality.issues[0].message}`);
    }

    try {
      await navigator.clipboard.writeText(fullPrompt);

      // 히스토리에 저장
      addPromptHistory(
        outputPromptMode === 'midjourney' ? promptForDisplay : generatedPrompt,
        outputPromptMode === 'midjourney' ? '' : negativePrompt.trim(),
        assembleBlocks.length,
        identityEnabled && (identityAnchor.trim().length > 0 || !!identityReferenceImage)
      );
      setPromptHistory(getPromptHistory());

      completeOnboardingStep('first_assemble');
      trackProductEvent('assemble_copied', {
        blockCount: assembleBlocks.length,
        qualityScore: quality.score,
        styleCount: selectedArtists.length,
        outputMode: outputPromptMode,
      });

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
        savePresetStyleMeta(preset.id, {
          artistNames: selectedArtists.map((artist) => artist.name),
          stylePromptMode,
          outputPromptMode,
          midjourneySrefCodes,
          midjourneyStyleWeight,
          midjourneyStyleVersion,
        });
        setPresets((prev) => [preset, ...prev]);
        trackProductEvent('preset_saved', { blockCount: assembleBlocks.length });
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
      const mappedBlocks = localBlocks.map((b) => ({
        id: crypto.randomUUID(),
        blockType: b.blockType as BlockType,
        content: b.content,
        originalId: b.originalId,
      }));

      setAssembleBlocks(mappedBlocks);

      if (identityEnabled) {
        const nextLocks = new Set<string>();
        for (const block of mappedBlocks) {
          if (FACE_IDENTITY_BLOCK_TYPES.includes(block.blockType)) {
            nextLocks.add(block.id);
          }
        }
        setLockedBlockIds(nextLocks);
      } else {
        setLockedBlockIds(new Set());
      }

      const styleMeta = getPresetStyleMeta(preset.id);
      if (styleMeta) {
        const restoredArtists = styleMeta.artistNames
          .map((name) => ARTISTS.find((artist) => artist.name === name))
          .filter((artist): artist is Artist => !!artist);
        setSelectedArtists(restoredArtists);
        setStylePromptMode(styleMeta.stylePromptMode);
        setOutputPromptMode(styleMeta.outputPromptMode);
        setMidjourneySrefCodes(styleMeta.midjourneySrefCodes);
        setMidjourneyStyleWeight(styleMeta.midjourneyStyleWeight);
        setMidjourneyStyleVersion(styleMeta.midjourneyStyleVersion);
      } else {
        setSelectedArtists([]);
        setStylePromptMode('artist');
        setOutputPromptMode('standard');
        setMidjourneySrefCodes('');
        setMidjourneyStyleWeight(100);
        setMidjourneyStyleVersion('6');
      }

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
      deletePresetStyleMeta(presetId);
      setPresets((prev) => prev.filter((p) => p.id !== presetId));
      toast.success('프리셋이 삭제되었습니다.');
    } catch (error) {
      console.error('프리셋 삭제 실패:', error);
      toast.error('프리셋 삭제에 실패했습니다.');
    }
  };

  const handleClearAll = () => {
    // 제거 전 모든 블록 데이터 저장
    const previousBlocks = [...assembleBlocks];
    const previousLockedIds = new Set(lockedBlockIds);

    setAssembleBlocks([]);
    setActiveTemplate(null);
    setLockedBlockIds(new Set());

    // 실행취소 토스트 표시
    showClearUndo(
      previousBlocks,
      previousLockedIds,
      (blocks, lockedIds) => {
        setAssembleBlocks(blocks);
        setLockedBlockIds(lockedIds);
        toast.success('모든 블록을 복구했습니다');
      }
    );
  };

  const handleToggleLock = (id: string) => {
    setLockedBlockIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 벌크 선택 핸들러
  const handleToggleSelectBlock = (id: string) => {
    setSelectedBlockIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllBlocks = () => {
    if (selectedBlockIds.size === assembleBlocks.length) {
      setSelectedBlockIds(new Set());
    } else {
      setSelectedBlockIds(new Set(assembleBlocks.map((b) => b.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedBlockIds.size === 0) return;

    const previousBlocks = [...assembleBlocks];
    const previousLockedIds = new Set(lockedBlockIds);
    const selectedBlocks = assembleBlocks.filter((b) => selectedBlockIds.has(b.id));

    setAssembleBlocks((prev) => prev.filter((b) => !selectedBlockIds.has(b.id)));
    setLockedBlockIds((prev) => {
      const next = new Set(prev);
      selectedBlockIds.forEach((id) => next.delete(id));
      return next;
    });
    setSelectedBlockIds(new Set());

    showDeleteUndo(
      selectedBlocks,
      previousLockedIds,
      (blocks, lockedIds) => {
        setAssembleBlocks(previousBlocks);
        setLockedBlockIds(lockedIds);
        toast.success('삭제한 블록을 복구했습니다');
      }
    );
  };

  const handleBulkLock = (lock: boolean) => {
    if (selectedBlockIds.size === 0) return;

    setLockedBlockIds((prev) => {
      const next = new Set(prev);
      selectedBlockIds.forEach((id) => {
        if (lock) next.add(id);
        else next.delete(id);
      });
      return next;
    });

    toast.success(`${selectedBlockIds.size}개 블록을 ${lock ? '고정' : '고정 해제'}했습니다`);
  };


  const handleToggleArtist = (artist: Artist) => {
    setSelectedArtists((prev) => {
      if (prev.some((selected) => selected.name === artist.name)) {
        return prev.filter((selected) => selected.name !== artist.name);
      }
      return [...prev, artist];
    });
  };

  const handleRemoveArtist = (name: string) => {
    setSelectedArtists((prev) => prev.filter((artist) => artist.name !== name));
  };

  const handleClearArtists = () => {
    setSelectedArtists([]);
  };

  const handleRandomTemplate = () => {
    // 컬렉션 범위에 따라 블록 필터링
    let scopeBlocks = libraryBlocks;
    if (randomScopeCollectionId === '__uncategorized__') {
      scopeBlocks = libraryBlocks.filter((b) => !b.collectionId);
    } else if (randomScopeCollectionId !== 'all') {
      scopeBlocks = libraryBlocks.filter((b) => b.collectionId === randomScopeCollectionId);
    }

    if (scopeBlocks.length === 0) {
      toast.error(
        randomScopeCollectionId === 'all'
          ? '라이브러리에 저장된 블록이 없습니다. 먼저 이미지를 분석해주세요.'
          : '선택한 컬렉션에 블록이 없습니다.'
      );
      return;
    }

    // 현재 선택된 블록이 있으면: 잠긴 블록 유지 + 나머지는 동일 타입 내에서만 무작위 교체
    if (assembleBlocks.length > 0) {
      let changedCount = 0;

      const nextBlocks = assembleBlocks.map((current) => {
        if (lockedBlockIds.has(current.id)) {
          return current;
        }

        const candidates = scopeBlocks.filter((block) => block.blockType === current.blockType);
        if (candidates.length === 0) {
          return current;
        }

        const randomBlock = candidates[Math.floor(Math.random() * candidates.length)];

        if (randomBlock.id !== current.originalId || randomBlock.content !== current.content) {
          changedCount += 1;
        }

        return {
          ...current,
          content: randomBlock.content,
          originalId: randomBlock.id,
        };
      });

      setAssembleBlocks(nextBlocks);

      const lockedCount = assembleBlocks.filter((block) => lockedBlockIds.has(block.id)).length;
      if (changedCount === 0) {
        toast.info('고정되지 않은 블록에서 교체 가능한 후보를 찾지 못했습니다.');
      } else if (lockedCount > 0) {
        toast.success(`${lockedCount}개 고정, ${changedCount}개만 무작위 교체했습니다.`);
      } else {
        toast.success(`${changedCount}개 블록을 무작위 교체했습니다.`);
      }

      return;
    }

    // 현재 블록이 비어있으면: 타입별로 1개씩 초기 무작위 조립
    const blocksByType = new Map<string, Block[]>();
    for (const block of scopeBlocks) {
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

    if (identityEnabled) {
      const nextLocks = new Set<string>();
      for (const block of randomBlocks) {
        if (FACE_IDENTITY_BLOCK_TYPES.includes(block.blockType)) {
          nextLocks.add(block.id);
        }
      }
      setLockedBlockIds(nextLocks);
    }

    toast.success(`${randomBlocks.length}개 타입에서 무작위 블록이 조립되었습니다!`);
  };

  const handleSelectTemplate = (template: Template) => {
    setActiveTemplate(template);
    setAssembleBlocks([]);
    setLockedBlockIds(new Set());
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

  const handleCreateShare = async () => {
    if (!promptForDisplay) {
      toast.error('공유할 프롬프트가 없습니다.');
      return;
    }

    const shareUrl = createShareLink(
      {
        prompt: promptForDisplay,
        negativePrompt: outputPromptMode === 'midjourney' ? '' : negativePrompt,
        blockCount: assembleBlocks.length,
        blocks: assembleBlocks.map((block) => ({
          type: BLOCK_TYPE_LABELS[block.blockType],
          content: block.content,
        })),
      },
      window.location.origin
    );

    await navigator.clipboard.writeText(shareUrl);
    trackProductEvent('share_created', { blockCount: assembleBlocks.length });
    toast.success('읽기 전용 공유 링크가 생성되어 복사되었습니다.');
  };

  const handleSaveSnapshot = () => {
    if (!promptForDisplay) {
      toast.error('스냅샷으로 저장할 조립 상태가 없습니다.');
      return;
    }

    const snapshot = saveAssembleSnapshot({
      name: snapshotName.trim() || `Snapshot ${new Date().toLocaleString()}`,
      prompt: promptForDisplay,
      negativePrompt,
      blocks: assembleBlocks,
    });

    setSnapshots((prev) => [snapshot, ...prev].slice(0, 20));
    setSnapshotName('');
    toast.success('스냅샷이 저장되었습니다.');
  };

  const handleRestoreSnapshot = (snapshot: AssembleSnapshot) => {
    const restoredBlocks = snapshot.blocks.map((block) => ({ ...block, id: crypto.randomUUID() }));
    setAssembleBlocks(restoredBlocks);

    if (identityEnabled) {
      const nextLocks = new Set<string>();
      for (const block of restoredBlocks) {
        if (FACE_IDENTITY_BLOCK_TYPES.includes(block.blockType)) {
          nextLocks.add(block.id);
        }
      }
      setLockedBlockIds(nextLocks);
    } else {
      setLockedBlockIds(new Set());
    }

    setNegativePrompt(snapshot.negativePrompt);
    setShowSnapshotsModal(false);
    toast.success(`"${snapshot.name}" 스냅샷을 복원했습니다.`);
  };

  const handleDeleteSnapshot = (id: string) => {
    deleteAssembleSnapshot(id);
    setSnapshots(getAssembleSnapshots());
    toast.success('스냅샷을 삭제했습니다.');
  };

  // 자동 저장 기능
  const { lastSavedAt } = useAutoSave({
    blocks: assembleBlocks,
    lockedBlockIds: Array.from(lockedBlockIds),
    outputMode: outputPromptMode,
    stylePromptMode,
    midjourneyParams: {
      srefCode: midjourneySrefCodes,
      styleWeight: String(midjourneyStyleWeight),
      styleVersion: midjourneyStyleVersion,
    },
  });

  // 실행취소 토스트
  const { showDeleteUndo, showClearUndo } = useUndoToast();

  // 블록 복구 핸들러
  const handleUndoRemove = (blocks: AssembleBlock[], lockedIds: Set<string>) => {
    setAssembleBlocks(blocks);
    setLockedBlockIds(lockedIds);
    toast.success('삭제한 블록을 복구했습니다');
  };


  // 복구 모달 상태
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryData, setRecoveryData] = useState<AutoSaveData | null>(null);

  // 페이지 로드 시 복구 데이터 확인
  useEffect(() => {
    const saved = localStorage.getItem('promptblocks_autosave_assemble');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AutoSaveData;
        if (parsed.blocks && parsed.blocks.length > 0) {
          setRecoveryData(parsed);
          setShowRecoveryModal(true);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // 복구 핸들러
  const handleRecover = () => {
    if (recoveryData) {
      setAssembleBlocks(recoveryData.blocks.map(b => ({ ...b, blockType: b.blockType as BlockType, id: crypto.randomUUID() })));
      setLockedBlockIds(new Set(recoveryData.lockedBlockIds));
      setOutputPromptMode(recoveryData.outputMode as OutputPromptMode);
      setStylePromptMode(recoveryData.stylePromptMode as StylePromptMode);
      if (recoveryData.midjourneyParams) {
        setMidjourneySrefCodes(recoveryData.midjourneyParams.srefCode);
        setMidjourneyStyleWeight(Number(recoveryData.midjourneyParams.styleWeight));
        setMidjourneyStyleVersion(recoveryData.midjourneyParams.styleVersion as MidjourneyStyleVersion);
      }
      toast.success('이전 작업을 복구했습니다');
    }
    setShowRecoveryModal(false);
  };

  const handleDiscardRecovery = () => {
    clearAutoSave();
    setShowRecoveryModal(false);
    toast.info('이전 작업을 삭제했습니다');
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-gray-900">
          블록 조립 <span className="text-indigo-600">Studio</span>
        </h1>
        <p className="mt-2 text-base font-medium text-gray-500">
          고정할 블록은 잠그고 나머지만 무작위로 교체해 프롬프트를 빠르게 완성하세요.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 왼쪽: 블록 목록 */}
        <div className="bento-card space-y-4 p-6">
          {/* 헤더 영역 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold whitespace-nowrap text-[var(--color-text-primary)]">
                  선택된 블록 ({assembleBlocks.length})
                </h2>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
                  <Users className="h-3.5 w-3.5" />
                  협업 Presence: {Math.max(presenceMembers.length, 1)}명 온라인
                </p>
                {activeTemplate && (
                  <p className="mt-0.5 text-sm text-[var(--color-primary)]">
                    {activeTemplate.icon} {activeTemplate.name} 템플릿
                  </p>
                )}
              </div>
              <Button variant="secondary" size="sm" onClick={() => setShowLibraryModal(true)}>
                <Plus className="mr-1 h-4 w-4" />
                블록 추가
              </Button>
            </div>

            {/* 컨트롤 바 */}
            <div className="flex flex-wrap items-center gap-2">
              <TemplateSelector onSelect={handleSelectTemplate} />
              <select
                value={randomScopeCollectionId}
                onChange={(e) => setRandomScopeCollectionId(e.target.value)}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-xs text-[var(--color-text-primary)]"
              >
                <option value="all">전체 블록</option>
                <option value="__uncategorized__">미분류</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.emoji || '📁'} {col.name}
                  </option>
                ))}
              </select>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRandomTemplate}
                className="gap-1"
              >
                <Shuffle className="h-4 w-4" />
                무작위
              </Button>
              {assembleBlocks.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearAll}>
                  <Trash2 className="mr-1 h-4 w-4" />
                  전체 삭제
                </Button>
              )}
              {assembleBlocks.length > 0 && (
                <Button
                  variant={isBulkMode ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setIsBulkMode(!isBulkMode);
                    if (isBulkMode) setSelectedBlockIds(new Set());
                  }}
                >
                  <CheckSquare className="mr-1 h-4 w-4" />
                  {isBulkMode ? '선택 완료' : '다중 선택'}
                </Button>
              )}
            </div>
            {/* 벌크 액션 바 */}
            {isBulkMode && selectedBlockIds.size > 0 && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-2">
                <span className="text-xs font-medium text-indigo-700">
                  {selectedBlockIds.size}개 선택됨
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllBlocks}
                  className="text-indigo-700 hover:bg-indigo-100"
                >
                  {selectedBlockIds.size === assembleBlocks.length ? '전체 해제' : '전체 선택'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkLock(true)}
                  className="text-indigo-700 hover:bg-indigo-100"
                >
                  <Lock className="mr-1 h-4 w-4" />
                  고정
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkLock(false)}
                  className="text-indigo-700 hover:bg-indigo-100"
                >
                  <Unlock className="mr-1 h-4 w-4" />
                  해제
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-rose-600 hover:bg-rose-100"
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  삭제
                </Button>
              </div>
            )}
            {assembleBlocks.length > 0 && (
              <p className="text-xs text-[var(--color-text-secondary)]">
                잠금 아이콘(
                <Lock className="mx-0.5 inline h-3.5 w-3.5" />
                )으로 원하는 블록을 고정하면, 무작위는 고정되지 않은 블록만 교체합니다.
              </p>
            )}
            {identityEnabled && (
              <p className="text-xs text-rose-600">
                얼굴 일관성 모드가 활성화되어 <strong>Subject Type</strong>과{' '}
                <strong>Appearance</strong> 블록은 추가 시 자동 고정됩니다.
              </p>
            )}
          </div>

          {assembleBlocks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-[var(--color-text-secondary)]">
                {activeTemplate ? (
                  <>
                    <p className="text-lg">{activeTemplate.icon}</p>
                    <p className="mt-2 font-medium text-[var(--color-text-primary)]">
                      {activeTemplate.name}
                    </p>
                    <p className="mt-1 text-sm">라이브러리에서 다음 블록 타입을 추가하세요:</p>
                    <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                      {activeTemplate.blockTypes.map((type) => (
                        <span
                          key={type}
                          className="inline-block rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs text-[var(--color-primary)]"
                        >
                          {BLOCK_TYPE_LABELS[type]}
                        </span>
                      ))}
                    </div>
                    <Button
                      variant="secondary"
                      className="mt-4"
                      onClick={() => setShowLibraryModal(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      블록 추가하기
                    </Button>
                  </>
                ) : (
                  <>
                    <p>선택된 블록이 없습니다.</p>
                    <p className="mt-1 text-sm">
                      추천 템플릿을 선택하거나 라이브러리에서 블록을 추가하세요.
                    </p>
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={assembleBlocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {assembleBlocks.map((block, index) => (
                    <SortableBlockItem
                      key={block.id}
                      block={block}
                      index={index}
                      editingBlockId={editingBlockId}
                      editingContent={editingContent}
                      isLocked={lockedBlockIds.has(block.id)}
                      isSelected={selectedBlockIds.has(block.id)}
                      isBulkMode={isBulkMode}
                      onRemove={handleRemoveBlock}
                      onEditStart={handleEditStart}
                      onEditChange={setEditingContent}
                      onEditSave={handleEditSave}
                      onEditCancel={handleEditCancel}
                      onToggleLock={handleToggleLock}
                      onToggleSelect={handleToggleSelectBlock}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* 오른쪽: 프롬프트 미리보기 */}
        <div className="bento-card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              생성된 프롬프트
            </h2>
            <div className="flex gap-2">
              {promptHistory.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setShowHistoryModal(true)}>
                  <Clock className="mr-1 h-4 w-4" />
                  히스토리 ({promptHistory.length})
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setShowSnapshotsModal(true)}>
                <RotateCcw className="mr-1 h-4 w-4" />
                스냅샷 ({snapshots.length})
              </Button>
              {presets.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setShowPresetsModal(true)}>
                  프리셋 ({presets.length})
                </Button>
              )}
            </div>
          </div>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Style Artist
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    카테고리별 작가 스타일을 선택하면 프롬프트에 자동 적용됩니다.
                  </p>
                </div>
                {selectedArtists.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearArtists}
                    className="text-xs font-medium text-indigo-500 hover:text-indigo-700"
                  >
                    전체 해제
                  </button>
                )}
              </div>

              <div className="mt-3 inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
                <button
                  type="button"
                  onClick={() => setStylePromptMode('artist')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    stylePromptMode === 'artist'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-[var(--color-text-secondary)] hover:text-indigo-600'
                  }`}
                >
                  작가명 모드
                </button>
                <button
                  type="button"
                  onClick={() => setStylePromptMode('safe')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    stylePromptMode === 'safe'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-[var(--color-text-secondary)] hover:text-indigo-600'
                  }`}
                >
                  안전 스타일 모드
                </button>
              </div>
              {stylePromptMode === 'safe' && (
                <p className="mt-2 text-xs text-indigo-600">
                  작가명 대신 카테고리+스타일 태그로 프롬프트를 구성합니다.
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setArtistCategory('all')}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    artistCategory === 'all'
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-indigo-100 hover:text-indigo-600'
                  }`}
                >
                  전체
                </button>
                {ARTIST_CATEGORY_ORDER.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setArtistCategory(category)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      artistCategory === category
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-indigo-100 hover:text-indigo-600'
                    }`}
                  >
                    {ARTIST_CATEGORY_ICONS[category]} {ARTIST_CATEGORY_LABELS[category]}
                  </button>
                ))}
              </div>

              <div className="mt-3">
                <SmartSearchInput
                  placeholder="작가명/태그/스타일 검색..."
                  searchType="artist_search"
                  onSearch={setArtistSearchQuery}
                  className="w-full"
                />
              </div>

              {recommendedArtists.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-xs font-semibold text-indigo-600">현재 블록 기반 추천</p>
                  <div className="flex flex-wrap gap-2">
                    {recommendedArtists.slice(0, 6).map((artist) => (
                      <button
                        key={artist.name}
                        type="button"
                        onClick={() => handleToggleArtist(artist)}
                        className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                      >
                        {artist.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-3 max-h-[180px] overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
                {filteredArtists.length === 0 ? (
                  <p className="px-2 py-4 text-center text-xs text-[var(--color-text-secondary)]">
                    조건에 맞는 작가가 없습니다.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {filteredArtists.map((artist) => {
                      const isSelected = selectedArtistNameSet.has(artist.name);
                      return (
                        <button
                          key={artist.name}
                          type="button"
                          onClick={() => handleToggleArtist(artist)}
                          className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                            isSelected
                              ? 'border-indigo-200 bg-indigo-50'
                              : 'border-[var(--color-border)] bg-white hover:border-indigo-100 hover:bg-indigo-50/50'
                          }`}
                        >
                          <p
                            className={`text-xs font-semibold ${
                              isSelected ? 'text-indigo-700' : 'text-[var(--color-text-primary)]'
                            }`}
                          >
                            {artist.name}
                          </p>
                          <p className="mt-1 line-clamp-1 text-[11px] text-[var(--color-text-secondary)]">
                            {getStylePromptFromArtist(artist, stylePromptMode)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedArtists.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-xs font-semibold text-[var(--color-text-primary)]">
                    선택된 스타일 ({selectedArtists.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedArtists.map((artist) => (
                      <button
                        key={artist.name}
                        type="button"
                        onClick={() => handleRemoveArtist(artist.name)}
                        className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                      >
                        {stylePromptMode === 'artist'
                          ? artist.name
                          : ARTIST_CATEGORY_LABELS[artist.category]}
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Output Mode
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    표준 프롬프트 또는 Midjourney 파라미터 출력을 선택하세요.
                  </p>
                </div>
              </div>

              <div className="mt-3 inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
                <button
                  type="button"
                  onClick={() => setOutputPromptMode('standard')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    outputPromptMode === 'standard'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-[var(--color-text-secondary)] hover:text-indigo-600'
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setOutputPromptMode('midjourney')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    outputPromptMode === 'midjourney'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-[var(--color-text-secondary)] hover:text-indigo-600'
                  }`}
                >
                  Midjourney
                </button>
              </div>

              {outputPromptMode === 'midjourney' && (
                <div className="mt-3 space-y-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                  <Input
                    label="SREF 코드 (선택)"
                    placeholder="예: 123456 987654::2"
                    value={midjourneySrefCodes}
                    onChange={(event) => setMidjourneySrefCodes(event.target.value)}
                  />

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-700">Style Weight (--sw)</p>
                      <p className="text-xs font-bold text-indigo-700">{midjourneyStyleWeight}</p>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1000}
                      step={10}
                      value={midjourneyStyleWeight}
                      onChange={(event) => setMidjourneyStyleWeight(Number(event.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold text-gray-700">Style Version (--sv)</p>
                    <select
                      value={midjourneyStyleVersion}
                      onChange={(event) =>
                        setMidjourneyStyleVersion(event.target.value as MidjourneyStyleVersion)
                      }
                      className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-700"
                    >
                      <option value="none">사용 안 함</option>
                      <option value="6">v7 default (6)</option>
                      <option value="4">legacy/default (4)</option>
                    </select>
                  </div>

                  <p className="text-[11px] text-indigo-700">
                    MJ 모드는 파라미터가 포함된 프롬프트를 생성합니다. 제출은 Midjourney에서 직접
                    진행하세요.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              {identityEnabled && (identityAnchor.trim() || identityReferenceImage) && (
                <div className="mb-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  <p className="font-semibold">얼굴 앵커 적용 중</p>
                  {identityReferenceImage && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="relative h-8 w-8 overflow-hidden rounded border border-rose-200 bg-white">
                        <NextImage
                          src={identityReferenceImage}
                          alt="얼굴 reference"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <span>reference 가중치 {Math.round(identityReferenceWeight * 100)}%</span>
                    </div>
                  )}
                </div>
              )}
              <Textarea
                value={promptForDisplay}
                readOnly
                placeholder="블록을 추가하면 프롬프트가 생성됩니다..."
                className="min-h-[200px] bg-[var(--color-background)]"
              />
              {promptForDisplay && (
                <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                  {promptForDisplay.length}자 · {assembleBlocks.length}개 블록 · {outputPromptMode}
                </p>
              )}
            </CardContent>
          </Card>

          {/* 네거티브 프롬프트 */}
          <Card>
            <CardContent>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Negative Prompt
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNegativePrompt(DEFAULT_NEGATIVE_PROMPT)}
                    className="text-xs font-medium text-indigo-500 hover:text-indigo-700"
                  >
                    기본값 복원
                  </button>
                  {negativePrompt && (
                    <button
                      onClick={() => setNegativePrompt('')}
                      className="text-xs font-medium text-red-400 hover:text-red-500"
                    >
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

          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                onClick={handleCopyPrompt}
                disabled={assembleBlocks.length === 0}
                className="w-full"
              >
                <Copy className="mr-2 h-4 w-4" />
                클립보드에 복사
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowSaveModal(true)}
                disabled={assembleBlocks.length === 0}
                className="w-full"
              >
                <Save className="mr-2 h-4 w-4" />
                프리셋 저장
              </Button>
            </div>

            <details className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-[var(--color-text-primary)]">
                고급 액션
              </summary>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={handleCreateShare}
                  disabled={assembleBlocks.length === 0}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  공유 링크
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleSaveSnapshot}
                  disabled={assembleBlocks.length === 0}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  스냅샷 저장
                </Button>
              </div>
            </details>
          </div>
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
        title={
          activeTemplate
            ? `${activeTemplate.icon} ${activeTemplate.name} - 블록 추가`
            : '라이브러리에서 블록 추가'
        }
      >
        <div className="space-y-4">
          <div className="flex gap-3">
            <SmartSearchInput
              placeholder="블록 검색..."
              searchType="library_search"
              onSearch={setSearchQuery}
              className="flex-1"
            />
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
            <div className="rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-3">
              <p className="text-sm text-[var(--color-primary)]">
                💡 <strong>{activeTemplate.name}</strong> 템플릿에 맞는 블록 타입만 표시됩니다.
              </p>
            </div>
          )}

          <div className="max-h-[400px] space-y-2 overflow-y-auto">
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
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text-secondary)]">
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
            {assembleBlocks.length}개의 블록과 스타일 설정({selectedArtists.length})이 프리셋으로
            저장됩니다.
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
        onClose={() => {
          setShowPresetsModal(false);
          setPresetSearchQuery('');
        }}
        title="저장된 프리셋"
      >
        <div className="space-y-4">
          <SmartSearchInput
            placeholder="프리셋 검색..."
            searchType="preset_search"
            onSearch={setPresetSearchQuery}
            className="w-full"
          />

          {presets.length === 0 ? (
            <div className="py-8 text-center text-[var(--color-text-secondary)]">
              저장된 프리셋이 없습니다.
            </div>
          ) : (
            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              {filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                >
                  <div className="flex-1 cursor-pointer" onClick={() => handleLoadPreset(preset)}>
                    <p className="font-medium text-[var(--color-text-primary)]">{preset.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {new Date(preset.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePreset(preset.id)}
                    className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)]"
                    aria-label="프리셋 삭제"
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
        onClose={() => {
          setShowHistoryModal(false);
          setHistorySearchQuery('');
        }}
        title="프롬프트 히스토리"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            복사한 프롬프트가 자동으로 저장됩니다. (최대 50개)
          </p>

          <SmartSearchInput
            placeholder="히스토리 검색..."
            searchType="history_search"
            onSearch={setHistorySearchQuery}
            className="w-full"
          />

          {promptHistory.length === 0 ? (
            <div className="py-8 text-center text-[var(--color-text-secondary)]">
              저장된 히스토리가 없습니다.
            </div>
          ) : (
            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                >
                  <p className="line-clamp-3 text-sm text-[var(--color-text-primary)]">
                    {item.prompt}
                  </p>
                  {item.negativePrompt && (
                    <p className="mt-1 line-clamp-1 text-xs text-[var(--color-error)]/70">
                      Negative: {item.negativePrompt}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {item.blockCount}개 블록 · {new Date(item.copiedAt).toLocaleString()}
                    </span>
                    {item.identityUsed && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                        얼굴 앵커
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-end">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleCopyHistoryItem(item)}
                        className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                        title="복사"
                        aria-label="히스토리 프롬프트 복사"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteHistoryItem(item.id)}
                        className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)]"
                        title="삭제"
                        aria-label="히스토리 항목 삭제"
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

      {/* 스냅샷 모달 */}
      <Modal
        isOpen={showSnapshotsModal}
        onClose={() => {
          setShowSnapshotsModal(false);
          setSnapshotName('');
        }}
        title="스냅샷 / 롤백"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="스냅샷 이름 (선택)"
              value={snapshotName}
              onChange={(event) => setSnapshotName(event.target.value)}
            />
            <Button onClick={handleSaveSnapshot}>저장</Button>
          </div>

          {snapshots.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
              저장된 스냅샷이 없습니다.
            </div>
          ) : (
            <div className="max-h-[360px] space-y-2 overflow-y-auto">
              {snapshots.map((snapshot) => (
                <div
                  key={snapshot.id}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {snapshot.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {new Date(snapshot.createdAt).toLocaleString()} · {snapshot.blocks.length}개
                        블록
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestoreSnapshot(snapshot)}
                      >
                        복원
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSnapshot(snapshot.id)}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* 자동 저장 복구 모달 */}
      <AutoSaveRecoveryModal
        isOpen={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        onRecover={handleRecover}
        onDiscard={handleDiscardRecovery}
        recoveryData={recoveryData}
        formattedTime={recoveryData ? formatLastSaved(recoveryData.timestamp) : ''}
      />
    </div>
  );
}
