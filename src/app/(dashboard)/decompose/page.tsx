'use client';

import { useState, useRef, useEffect } from 'react';
import NextImage from 'next/image';
import {
  Sparkles,
  AlertCircle,
  Upload,
  Search,
  X,
  Zap,
  Save,
  Brain,
  RefreshCw,
  FolderOpen,
  Plus,
  Type,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Button } from '@/components/ui';
import { BlockCard } from '@/components/blocks/BlockCard';
import { BLOCK_TYPES, type BlockType, type DecomposeResult, type Collection } from '@/types';
import { saveBlocks } from '@/lib/blocks';
import {
  MAX_BATCH_IMAGES,
  buildBatchBlocksToSave,
  clearBatchBlocksForImage,
  clearBatchSelection,
  countSelectedBatchBlocks,
  createBatchProgressState,
  createDefaultBatchSelection,
  runBatchDecompose,
  saveBatchSelectedBlocks,
  selectAllBatchBlocks,
  selectAllBatchBlocksForImage,
  toggleBatchBlockSelection,
  type BatchDecomposeItem,
  type BatchProgressState,
  type BatchSelectionMap,
} from '@/lib/batchDecompose';
import { getApiKey, getIdentitySettings, saveIdentitySettings } from '@/lib/userSettings';
import { getCollections, createCollection } from '@/lib/collections';
import { completeOnboardingStep } from '@/lib/onboarding';
import { trackProductEvent } from '@/lib/analytics';
import { evaluateUsageDecision, getUsageSnapshot, registerUsageCall } from '@/lib/usageLimits';
import { validateBlockContents } from '@/lib/promptQuality';

const AI_MODELS = {
  gpt: [
    { id: 'gpt-5.2', name: 'GPT-5.2 (Recommended)' },
    { id: 'gpt-5-mini', name: 'GPT-5 Mini' },
    { id: 'gpt-4o', name: 'GPT-4o' },
  ],
  gemini: [
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro (Recommended)' },
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash' },
    { id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  ],
};

type WorkMode = 'off' | 'analyze' | 'search';

const WORK_MODE_STORAGE_KEY = 'promptblocks_decompose_work_mode';

const WORK_MODE_PREAMBLE: Record<Exclude<WorkMode, 'off'>, string> = {
  analyze: `[analyze-mode]
ANALYSIS MODE. Gather context before diving deep:

CONTEXT GATHERING (parallel):
- 1-2 explore agents (codebase patterns, implementations)
- 1-2 librarian agents (if external library involved)
- Direct tools: Grep, AST-grep, LSP for targeted searches

IF COMPLEX - DO NOT STRUGGLE ALONE. Consult specialists:
- **Oracle**: Conventional problems (architecture, debugging, complex logic)
- **Artistry**: Non-conventional problems (different approach needed)

SYNTHESIZE findings before proceeding.`,
  search: `[search-mode]
MAXIMIZE SEARCH EFFORT. Launch multiple background agents IN PARALLEL:
- explore agents (codebase patterns, file structures, ast-grep)
- librarian agents (remote repos, official docs, GitHub examples)
Plus direct tools: Grep, ripgrep (rg), ast-grep (sg)
NEVER stop at first result - be exhaustive.`,
};

function buildFaceIdentityAnchor(result: DecomposeResult): string {
  const normalizedSubject = result.subject_type?.trim() || '';
  const normalizedAppearance = result.appearance?.trim() || '';

  const anchorParts = [
    normalizedSubject,
    normalizedAppearance,
    'consistent facial identity, same person',
  ].filter(Boolean);

  return anchorParts.join(', ');
}

function applyWorkModePreamble(prompt: string, mode: WorkMode): string {
  const normalized = prompt.trim();
  if (!normalized) return '';
  if (mode === 'off') return normalized;

  if (normalized.includes('[search-mode]') || normalized.includes('[analyze-mode]')) {
    return normalized;
  }

  return `${WORK_MODE_PREAMBLE[mode]}\n\n---\n\n${normalized}`;
}

interface UploadedImageItem {
  id: string;
  file: File;
  preview: string;
  name: string;
}

export default function DecomposePage() {
  const [inputMode, setInputMode] = useState<'image' | 'text'>('image');
  const [textPrompt, setTextPrompt] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImageItem[]>([]);
  const [selectedAi, setSelectedAi] = useState<'gpt' | 'gemini'>('gpt');
  const [selectedModel, setSelectedModel] = useState('gpt-5.2');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DecomposeResult | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [batchResults, setBatchResults] = useState<BatchDecomposeItem[]>([]);
  const [batchProgress, setBatchProgress] = useState<BatchProgressState>(
    createBatchProgressState(0)
  );
  const [batchSelections, setBatchSelections] = useState<BatchSelectionMap>({});
  const [selectedBlocks, setSelectedBlocks] = useState<Set<BlockType>>(new Set());
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 컬렉션 관련 state
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [suggestedName, setSuggestedName] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [workMode, setWorkMode] = useState<WorkMode>('off');
  const [identityAppliedAnchor, setIdentityAppliedAnchor] = useState<string | null>(null);

  useEffect(() => {
    getCollections().then(setCollections);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(WORK_MODE_STORAGE_KEY) as WorkMode | null;
    if (saved === 'off' || saved === 'analyze' || saved === 'search') {
      setWorkMode(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(WORK_MODE_STORAGE_KEY, workMode);
  }, [workMode]);

  const suggestCollectionName = (res: DecomposeResult): string => {
    const subject = res.subject_type?.split(',')[0].trim();
    const style = res.style?.split(',')[0].trim();
    if (subject && style) return `${style} ${subject}`;
    return subject || style || `Analysis ${new Date().toLocaleDateString('ko-KR')}`;
  };

  const handleCreateNewCollection = async () => {
    const name = newCollectionName.trim();
    if (!name) return;
    try {
      const col = await createCollection(name);
      setCollections((prev) => [col, ...prev]);
      setSelectedCollectionId(col.id);
      setNewCollectionName('');
      toast.success(`"${name}" 컬렉션이 생성되었습니다.`);
    } catch {
      toast.error('컬렉션 생성에 실패했습니다.');
    }
  };

  const handleUseSuggested = async () => {
    if (!suggestedName) return;
    try {
      const col = await createCollection(suggestedName);
      setCollections((prev) => [col, ...prev]);
      setSelectedCollectionId(col.id);
      setSuggestedName('');
      toast.success(`"${col.name}" 컬렉션이 생성되었습니다.`);
    } catch {
      toast.error('컬렉션 생성에 실패했습니다.');
    }
  };

  const compressImage = (file: File): Promise<string> => {
    const MAX_DIMENSION = 2048;
    const MAX_BASE64_BYTES = 3 * 1024 * 1024; // base64 3MB 이하로 유지

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const originalBase64 = e.target?.result as string;

        // 작은 파일은 바로 반환
        if (file.size <= 2 * 1024 * 1024) {
          resolve(originalBase64);
          return;
        }

        const img = new Image();
        img.onload = () => {
          const { width, height } = img;
          const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height, 1);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(width * scale);
          canvas.height = Math.round(height * scale);
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // 품질을 낮추면서 크기 제한 맞추기
          let quality = 0.85;
          let result = canvas.toDataURL('image/jpeg', quality);

          while (result.length > MAX_BASE64_BYTES && quality > 0.3) {
            quality -= 0.1;
            result = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(result);
        };
        img.src = originalBase64;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const availableSlots = MAX_BATCH_IMAGES - uploadedImages.length;
    if (availableSlots <= 0) {
      toast.error(`이미지는 최대 ${MAX_BATCH_IMAGES}장까지 업로드할 수 있습니다.`);
      e.target.value = '';
      return;
    }

    if (files.length > availableSlots) {
      toast.warning(`최대 ${MAX_BATCH_IMAGES}장까지 가능하여 ${availableSlots}장만 추가합니다.`);
    }

    const acceptedFiles = files.slice(0, availableSlots);
    const nextImages: UploadedImageItem[] = [];

    for (const file of acceptedFiles) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name}: 이미지 파일만 업로드할 수 있습니다.`);
        continue;
      }

      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name}: 파일 크기는 20MB 이하만 가능합니다.`);
        continue;
      }

      const preview = await compressImage(file);
      nextImages.push({
        id: crypto.randomUUID(),
        file,
        preview,
        name: file.name,
      });
    }

    if (nextImages.length > 0) {
      setUploadedImages((prev) => [...prev, ...nextImages]);
    }

    e.target.value = '';
  };

  const handleRemoveImage = (imageId: string) => {
    setUploadedImages((prev) => prev.filter((image) => image.id !== imageId));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearImages = () => {
    setUploadedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (inputMode === 'image' && uploadedImages.length === 0) {
      toast.error('이미지를 업로드해주세요.');
      return;
    }

    if (inputMode === 'text' && !textPrompt.trim()) {
      toast.error('프롬프트를 입력해주세요.');
      return;
    }

    const requestedCalls = inputMode === 'image' ? uploadedImages.length : 1;
    const usageDecision = evaluateUsageDecision();
    if (!usageDecision.allowed) {
      toast.error(usageDecision.reason || '사용량 한도를 초과했습니다.');
      return;
    }

    const usageSnapshot = getUsageSnapshot();
    const dailyRemaining = usageSnapshot.settings.dailyLimit - usageSnapshot.dailyUsed;
    const monthlyRemaining = usageSnapshot.settings.monthlyLimit - usageSnapshot.monthlyUsed;

    if (requestedCalls > dailyRemaining) {
      toast.error(
        `일일 남은 호출 수(${Math.max(dailyRemaining, 0)}회)가 부족합니다. 배치 크기를 줄여주세요.`
      );
      return;
    }

    if (requestedCalls > monthlyRemaining) {
      toast.error(
        `월간 남은 호출 수(${Math.max(monthlyRemaining, 0)}회)가 부족합니다. 배치 크기를 줄여주세요.`
      );
      return;
    }

    if (usageDecision.warning) {
      toast.warning(usageDecision.warning);
    }

    const apiKey = await getApiKey(selectedAi);
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setIsLoading(true);
    setResult(null);
    setBatchResults([]);
    setBatchSelections({});
    setBatchProgress(createBatchProgressState(inputMode === 'image' ? uploadedImages.length : 0));
    setGeneratedPrompt(null);
    setAnalysisError(null);
    setIdentityAppliedAnchor(null);

    try {
      const modePreamble = workMode === 'off' ? null : WORK_MODE_PREAMBLE[workMode];

      if (inputMode === 'text') {
        const effectivePrompt = applyWorkModePreamble(textPrompt, workMode);

        const response = await fetch('/api/decompose', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
            'X-AI-Provider': selectedAi,
          },
          body: JSON.stringify({ prompt: effectivePrompt }),
        });

        let data;
        try {
          data = await response.json();
        } catch {
          throw new Error('서버 응답을 처리할 수 없습니다.');
        }

        if (!response.ok) {
          throw new Error(data.error || '분석에 실패했습니다.');
        }

        setResult(data.result);
        setGeneratedPrompt(applyWorkModePreamble(textPrompt, workMode));
        setSelectedBlocks(new Set(BLOCK_TYPES.filter((type) => data.result[type])));
        setSuggestedName(suggestCollectionName(data.result));

        registerUsageCall();
        completeOnboardingStep('first_decompose');
        trackProductEvent('decompose_success', {
          provider: selectedAi,
          mode: inputMode,
          workMode,
        });

        toast.success('프롬프트가 분해되었습니다!');
        return;
      }

      const batchResponse = await runBatchDecompose({
        images: uploadedImages.map((item) => ({
          id: item.id,
          image: item.preview,
          name: item.name,
        })),
        apiKey,
        aiProvider: selectedAi,
        aiModel: selectedModel,
        modePreamble,
        onProgress: (progress) => {
          setBatchProgress(progress);
        },
      });

      const nextResults = batchResponse.results;
      const nextSelections = createDefaultBatchSelection(nextResults);
      const successResults = nextResults.filter((item) => item.status === 'success');
      const failedCount = nextResults.length - successResults.length;
      const firstSuccess = successResults[0] || null;

      setBatchResults(nextResults);
      setBatchSelections(nextSelections);
      setBatchProgress(batchResponse.progress);
      setGeneratedPrompt(firstSuccess?.prompt ?? null);
      setResult(firstSuccess?.result ?? null);

      if (firstSuccess) {
        setSuggestedName(suggestCollectionName(firstSuccess.result));
      } else {
        setSuggestedName('');
      }

      if (uploadedImages.length === 1 && firstSuccess) {
        const faceAnchor = buildFaceIdentityAnchor(firstSuccess.result);
        const referenceImage = uploadedImages[0]?.preview;

        if (faceAnchor && referenceImage) {
          try {
            const identitySettings = await getIdentitySettings();
            if (identitySettings.identityAutoApply) {
              await saveIdentitySettings(
                faceAnchor,
                true,
                referenceImage,
                identitySettings.identityReferenceWeight,
                identitySettings.identityAutoApply
              );
              setIdentityAppliedAnchor(faceAnchor);
              toast.success('이미지 분석 완료! 얼굴 기준이 자동으로 업데이트되었습니다.');
            } else {
              toast.info(
                '이미지 분석 완료! 자동 저장이 꺼져 있어 얼굴 기준은 저장하지 않았습니다.'
              );
            }
          } catch {
            toast.warning(
              '분석은 완료됐지만 얼굴 기준 자동 저장에 실패했습니다. 수동 저장해주세요.'
            );
          }
        }
      }

      for (let i = 0; i < nextResults.length; i += 1) {
        registerUsageCall();
      }

      completeOnboardingStep('first_decompose');
      trackProductEvent('decompose_success', {
        provider: selectedAi,
        mode: inputMode,
        workMode,
        requested: nextResults.length,
        success: successResults.length,
        failed: failedCount,
      });

      if (successResults.length === 0) {
        toast.error('모든 이미지 분석이 실패했습니다. 각 결과의 에러를 확인해주세요.');
      } else if (failedCount > 0) {
        toast.warning(`${successResults.length}개 성공, ${failedCount}개 실패했습니다.`);
      } else {
        toast.success(`${successResults.length}개의 이미지가 분석되었습니다!`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '분석에 실패했습니다.';
      setAnalysisError(message);
      trackProductEvent('decompose_failed', {
        provider: selectedAi,
        mode: inputMode,
        workMode,
      });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockToggle = (blockType: BlockType) => {
    setSelectedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(blockType)) {
        next.delete(blockType);
      } else {
        next.add(blockType);
      }
      return next;
    });
  };

  const handleBlockContentChange = (blockType: BlockType, value: string) => {
    setResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [blockType]: value,
      };
    });
  };

  const handleSaveBlocks = async () => {
    if (selectedBlocks.size === 0 || !result) {
      toast.error('저장할 블록을 선택해주세요.');
      return;
    }

    const blocksToSave = Array.from(selectedBlocks)
      .filter((type) => result[type]?.trim())
      .map((type) => ({
        blockType: type,
        content: result[type].trim(),
      }));

    const quality = validateBlockContents(blocksToSave.map((item) => item.content));
    const hasBlockingIssue = quality.issues.some((issue) => issue.level === 'error');
    if (hasBlockingIssue) {
      toast.error(quality.issues[0]?.message || '저장 가능한 블록이 없습니다.');
      return;
    }

    if (quality.issues.length > 0) {
      toast.warning(`품질 점수 ${quality.score}점: ${quality.issues[0].message}`);
    }

    try {
      const saved = await saveBlocks(blocksToSave, undefined, selectedCollectionId || undefined);
      const newCount = saved.filter((b) =>
        blocksToSave.some((item) => item.content === b.content)
      ).length;

      if (newCount > 0) {
        toast.success(`${newCount}개의 블록이 라이브러리에 저장되었습니다.`);
        completeOnboardingStep('first_save');
        trackProductEvent('blocks_saved', {
          count: newCount,
          qualityScore: quality.score,
        });
      } else {
        toast.info('이미 저장된 블록입니다.');
      }
    } catch (error) {
      console.error('블록 저장 실패:', error);
      toast.error('블록 저장에 실패했습니다.');
    }
  };

  const selectedBatchCount = countSelectedBatchBlocks(batchResults, batchSelections);

  const handleBatchBlockToggle = (imageId: string, blockType: BlockType) => {
    setBatchSelections((prev) => toggleBatchBlockSelection(prev, imageId, blockType));
  };

  const handleBatchBlockContentChange = (imageId: string, blockType: BlockType, value: string) => {
    setBatchResults((prev) =>
      prev.map((item) => {
        if (item.id !== imageId || item.status !== 'success') return item;
        return {
          ...item,
          result: {
            ...item.result,
            [blockType]: value,
          },
        };
      })
    );
  };

  const handleSelectAllBatchBlocks = () => {
    setBatchSelections(selectAllBatchBlocks(batchResults));
  };

  const handleClearBatchSelections = () => {
    setBatchSelections(clearBatchSelection(batchResults));
  };

  const handleSelectAllBatchBlocksForImage = (imageId: string) => {
    setBatchSelections((prev) => selectAllBatchBlocksForImage(batchResults, prev, imageId));
  };

  const handleClearBatchBlocksForImage = (imageId: string) => {
    setBatchSelections((prev) => clearBatchBlocksForImage(prev, imageId));
  };

  const handleSaveBatchBlocks = async (saveAll: boolean = false) => {
    const effectiveSelection = saveAll ? selectAllBatchBlocks(batchResults) : batchSelections;
    if (saveAll) {
      setBatchSelections(effectiveSelection);
    }

    const blocksToSave = buildBatchBlocksToSave(batchResults, effectiveSelection);
    if (blocksToSave.length === 0) {
      toast.error('저장할 블록을 선택해주세요.');
      return;
    }

    const quality = validateBlockContents(blocksToSave.map((item) => item.content));
    const hasBlockingIssue = quality.issues.some((issue) => issue.level === 'error');
    if (hasBlockingIssue) {
      toast.error(quality.issues[0]?.message || '저장 가능한 블록이 없습니다.');
      return;
    }

    if (quality.issues.length > 0) {
      toast.warning(`품질 점수 ${quality.score}점: ${quality.issues[0].message}`);
    }

    try {
      const saved = await saveBatchSelectedBlocks(
        batchResults,
        effectiveSelection,
        selectedCollectionId || undefined
      );
      const newCount = saved.filter((block) =>
        blocksToSave.some(
          (item) => item.blockType === block.blockType && item.content === block.content
        )
      ).length;

      if (newCount > 0) {
        toast.success(`${newCount}개의 블록이 라이브러리에 저장되었습니다.`);
        completeOnboardingStep('first_save');
        trackProductEvent('blocks_saved', {
          count: newCount,
          qualityScore: quality.score,
          source: 'batch_decompose',
        });
      } else {
        toast.info('이미 저장된 블록입니다.');
      }
    } catch (error) {
      console.error('배치 블록 저장 실패:', error);
      toast.error('배치 블록 저장에 실패했습니다.');
    }
  };

  const handleApplyIdentityFromCurrentResult = async () => {
    const primaryPreview = uploadedImages[0]?.preview || null;
    if (!result || !primaryPreview) {
      toast.error('이미지 분석 결과가 필요합니다.');
      return;
    }

    const faceAnchor = buildFaceIdentityAnchor(result);
    if (!faceAnchor) {
      toast.error('얼굴 기준으로 사용할 정보가 부족합니다.');
      return;
    }

    try {
      const identitySettings = await getIdentitySettings();
      await saveIdentitySettings(
        faceAnchor,
        true,
        primaryPreview,
        identitySettings.identityReferenceWeight,
        identitySettings.identityAutoApply
      );
      setIdentityAppliedAnchor(faceAnchor);
      toast.success('현재 분석 결과를 얼굴 기준으로 저장했습니다.');
    } catch {
      toast.error('얼굴 기준 저장에 실패했습니다.');
    }
  };

  const collectionSelectorPanel = (
    <div className="bento-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <FolderOpen className="h-5 w-5 text-indigo-500" />
        <h3 className="font-bold text-gray-900">저장할 컬렉션</h3>
      </div>

      {suggestedName && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
          <Sparkles className="h-4 w-4 shrink-0 text-indigo-500" />
          <span className="text-sm text-gray-700">
            추천: <strong>{suggestedName}</strong>
          </span>
          <button
            onClick={handleUseSuggested}
            className="ml-auto shrink-0 text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            사용하기
          </button>
        </div>
      )}

      <div className="max-h-[180px] space-y-1.5 overflow-y-auto">
        <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50">
          <input
            type="radio"
            name="collection"
            checked={selectedCollectionId === null}
            onChange={() => setSelectedCollectionId(null)}
            className="accent-indigo-600"
          />
          <span className="text-sm text-gray-700">📁 미분류</span>
        </label>
        {collections.map((col) => (
          <label
            key={col.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
          >
            <input
              type="radio"
              name="collection"
              checked={selectedCollectionId === col.id}
              onChange={() => setSelectedCollectionId(col.id)}
              className="accent-indigo-600"
            />
            <span className="text-sm text-gray-700">
              {col.emoji || '📁'} {col.name}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Plus className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          placeholder="새 컬렉션 이름..."
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreateNewCollection();
          }}
          className="flex-1 border-b border-gray-200 bg-transparent py-1 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-indigo-500"
        />
        <button
          onClick={handleCreateNewCollection}
          disabled={!newCollectionName.trim()}
          className="shrink-0 text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-30"
        >
          만들기
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <div className="mb-2">
        <h1 className="mb-2 text-4xl font-black tracking-tight text-gray-900">
          프롬프트 분해 <span className="text-indigo-600">Studio</span>
        </h1>
        <p className="text-lg font-medium text-gray-500">
          {inputMode === 'image'
            ? '이미지를 업로드하여 AI가 사용한 프롬프트를 13가지 요소로 정밀 분석합니다.'
            : '텍스트 프롬프트를 입력하면 13가지 요소로 분해합니다.'}
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex w-fit gap-2 rounded-xl border border-[var(--color-border)] bg-white p-1">
        <button
          onClick={() => setInputMode('image')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
            inputMode === 'image'
              ? 'bg-indigo-50 text-indigo-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          이미지 분석
        </button>
        <button
          onClick={() => setInputMode('text')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
            inputMode === 'text'
              ? 'bg-indigo-50 text-indigo-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Type className="h-4 w-4" />
          텍스트 분해
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
        <span className="px-2 text-xs font-bold text-gray-500">작업 모드</span>
        <button
          onClick={() => setWorkMode('off')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
            workMode === 'off'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          기본
        </button>
        <button
          onClick={() => setWorkMode('analyze')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
            workMode === 'analyze'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Analyze
        </button>
        <button
          onClick={() => setWorkMode('search')}
          className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${
            workMode === 'search' ? 'bg-sky-100 text-sky-700' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Search className="h-3.5 w-3.5" />
          Search
        </button>
      </div>

      {workMode !== 'off' && (
        <p className="-mt-2 text-xs text-gray-500">
          선택한 모드 프리앰블이 요청 전에 자동으로 붙습니다. (이미지 분석 포함)
        </p>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Input Area */}
        <div className="lg:col-span-8">
          {inputMode === 'image' ? (
            <div className="upload-area group relative p-2">
              {uploadedImages.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="upload-inner relative flex h-full min-h-[400px] cursor-pointer flex-col items-center justify-center overflow-hidden p-12"
                >
                  {/* Animated Blobs */}
                  <div className="animate-blob absolute top-10 left-10 h-20 w-20 rounded-full bg-yellow-200 opacity-70 mix-blend-multiply blur-xl filter"></div>
                  <div className="animate-blob animation-delay-2000 absolute top-10 right-10 h-20 w-20 rounded-full bg-indigo-200 opacity-70 mix-blend-multiply blur-xl filter"></div>
                  <div className="animate-blob animation-delay-4000 absolute -bottom-8 left-20 h-20 w-20 rounded-full bg-pink-200 opacity-70 mix-blend-multiply blur-xl filter"></div>

                  <div className="z-10 mb-6 flex h-24 w-24 transform items-center justify-center rounded-3xl bg-white shadow-lg transition-transform duration-300 group-hover:-translate-y-2">
                    <Upload className="h-12 w-12 text-indigo-500" />
                  </div>
                  <h2 className="z-10 mb-2 text-2xl font-bold text-gray-900">
                    이미지를 끌어다 놓으세요
                  </h2>
                  <p className="z-10 font-medium text-gray-500">
                    또는 클릭하여 업로드 (최대 20MB, 5장)
                  </p>
                </div>
              ) : (
                <div className="upload-inner min-h-[400px] rounded-[2rem] p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        선택된 이미지 {uploadedImages.length}/{MAX_BATCH_IMAGES}
                      </h2>
                      <p className="text-sm text-gray-500">
                        배치는 순차 분석되어 Rate Limit을 안정적으로 회피합니다.
                      </p>
                    </div>
                    <button
                      onClick={handleClearImages}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-600 shadow-sm hover:bg-gray-100"
                    >
                      전체 삭제
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {uploadedImages.map((image) => (
                      <div key={image.id} className="space-y-1.5">
                        <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                          <NextImage
                            src={image.preview}
                            alt={image.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRemoveImage(image.id);
                            }}
                            className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-gray-700 shadow-sm transition hover:bg-red-500 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p
                          className="truncate text-xs font-medium text-gray-600"
                          title={image.name}
                        >
                          {image.name}
                        </p>
                      </div>
                    ))}

                    {uploadedImages.length < MAX_BATCH_IMAGES && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-100"
                      >
                        <Plus className="mb-1 h-5 w-5" />
                        <span className="text-xs font-semibold">이미지 추가</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          ) : (
            /* Text Input Mode */
            <div className="bento-card flex min-h-[400px] flex-col p-8">
              <div className="mb-4 flex items-center gap-2">
                <Type className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900">텍스트 프롬프트 입력</h3>
              </div>

              <textarea
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                placeholder={
                  '예시: A beautiful Korean woman in a flowing white dress, standing in a field of lavender at golden hour, cinematic lighting, shot with 85mm lens, shallow depth of field, photorealistic style'
                }
                className="w-full flex-1 resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 text-sm leading-relaxed font-medium text-gray-700 transition-all outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
              <p className="mt-3 text-xs text-gray-400">
                💡 Midjourney, DALL·E, Stable Diffusion 등에 사용하는 프롬프트를 붙여넣으세요.
              </p>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          {/* AI Model Selection Card */}
          <div className="bento-card flex flex-grow flex-col justify-center gap-6 p-8">
            <div>
              <label className="mb-2 ml-1 block text-sm font-bold text-gray-700">
                AI 모델 선택
              </label>
              <div className="relative">
                <select
                  value={selectedAi}
                  onChange={(e) => {
                    const ai = e.target.value as 'gpt' | 'gemini';
                    setSelectedAi(ai);
                    setSelectedModel(AI_MODELS[ai][0].id);
                  }}
                  className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-5 py-4 font-medium text-gray-700 transition-all outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="gpt">OpenAI</option>
                  <option value="gemini">Google Gemini</option>
                </select>
                <svg
                  className="pointer-events-none absolute top-4 right-4 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <div>
              <label className="mb-2 ml-1 block text-sm font-bold text-gray-700">모델 버전</label>
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-5 py-4 font-medium text-gray-700 transition-all outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                >
                  {AI_MODELS[selectedAi].map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute top-4 right-4 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={
              (inputMode === 'image' ? uploadedImages.length === 0 : !textPrompt.trim()) ||
              isLoading
            }
            className="flex w-full transform items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 py-5 text-base font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-300 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-white"></div>
                <span>{inputMode === 'text' ? '분해 중...' : '분석 중...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-6 w-6" />
                <span>{inputMode === 'text' ? '프롬프트 분해 시작' : '이미지 분석 시작'}</span>
              </>
            )}
          </button>

          {isLoading && inputMode === 'image' && batchProgress.total > 0 && (
            <div className="bento-card space-y-3 p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                <span>배치 진행률</span>
                <span>
                  {batchProgress.completed}/{batchProgress.total}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${batchProgress.percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {batchProgress.currentName
                  ? `${batchProgress.currentName} 분석 중...`
                  : '이미지 분석 준비 중...'}
              </p>
            </div>
          )}

          {/* 에러 재시도 */}
          {analysisError && !isLoading && (
            <div className="bento-card flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <p className="flex-1 text-sm text-gray-600">{analysisError}</p>
              <button
                onClick={handleAnalyze}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-200"
              >
                <RefreshCw className="h-4 w-4" />
                재시도
              </button>
            </div>
          )}
        </div>

        {/* Feature Cards */}
        {!result && batchResults.length === 0 && (
          <>
            <div className="bento-card group p-8 lg:col-span-4">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 transition-transform group-hover:scale-105">
                <Brain className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">정교한 분석</h3>
              <p className="text-sm leading-relaxed font-medium text-gray-500">
                화풍, 구도, 조명 등 13가지 전문 프롬프트 요소를 AI가 정밀 추출합니다.
              </p>
            </div>
            <div className="bento-card group p-8 lg:col-span-4">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition-transform group-hover:scale-105">
                <Save className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">즉시 저장</h3>
              <p className="text-sm leading-relaxed font-medium text-gray-500">
                추출된 각 요소들을 개별 블록으로 라이브러리에 바로 저장하세요.
              </p>
            </div>
            <div className="bento-card group p-8 lg:col-span-4">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 transition-transform group-hover:scale-105">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">빠른 워크플로우</h3>
              <p className="text-sm leading-relaxed font-medium text-gray-500">
                분해한 요소들을 드래그 앤 드롭으로 재조합하여 새 이미지를 만드세요.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Generated Prompt */}
      {generatedPrompt && inputMode === 'text' && (
        <div className="bento-card p-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">생성된 프롬프트</h2>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedPrompt);
                toast.success('프롬프트가 복사되었습니다!');
              }}
              className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800"
            >
              복사
            </button>
          </div>
          <p className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm whitespace-pre-wrap text-gray-600">
            {generatedPrompt}
          </p>
        </div>
      )}

      {/* Analysis Results (Text) */}
      {inputMode === 'text' && result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">13개 요소로 분해</h2>
            <Button onClick={handleSaveBlocks} disabled={selectedBlocks.size === 0}>
              선택한 블록 저장 ({selectedBlocks.size})
            </Button>
          </div>
          <p className="-mt-3 text-xs text-gray-500">
            각 요소 텍스트를 직접 수정한 뒤 저장할 수 있습니다.
          </p>

          {collectionSelectorPanel}

          <div className="grid gap-4 sm:grid-cols-2">
            {BLOCK_TYPES.map((blockType) => {
              const content = result[blockType];
              if (!content) return null;

              return (
                <BlockCard
                  key={blockType}
                  blockType={blockType}
                  content={content}
                  editable
                  isSelected={selectedBlocks.has(blockType)}
                  onToggle={() => handleBlockToggle(blockType)}
                  onContentChange={(value) => handleBlockContentChange(blockType, value)}
                  selectable
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Analysis Results (Image Batch) */}
      {inputMode === 'image' && batchResults.length > 0 && (
        <div className="space-y-6">
          {uploadedImages.length === 1 && result && (
            <div className="bento-card border-rose-100 bg-rose-50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-rose-700">얼굴 일관성 자동 연결</h3>
                  <p className="mt-1 text-xs text-rose-600">
                    분석된 얼굴 특징과 reference 이미지가 얼굴 앵커로 저장되어, 조립/무작위에서도
                    일관성을 유지합니다.
                  </p>
                  {identityAppliedAnchor && (
                    <p className="mt-1 line-clamp-2 text-[11px] text-rose-500">
                      적용된 앵커: {identityAppliedAnchor}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handleApplyIdentityFromCurrentResult}>
                    얼굴 기준 다시 저장
                  </Button>
                  <Button onClick={() => (window.location.href = '/assemble')}>
                    조립으로 이동
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="bento-card p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">배치 분석 결과</h2>
                <p className="text-sm text-gray-500">
                  {batchProgress.succeeded}개 성공 / {batchProgress.failed}개 실패
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={handleSelectAllBatchBlocks}>
                  전체 선택
                </Button>
                <Button variant="secondary" onClick={handleClearBatchSelections}>
                  선택 해제
                </Button>
                <Button onClick={() => handleSaveBatchBlocks()} disabled={selectedBatchCount === 0}>
                  선택 저장 ({selectedBatchCount})
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleSaveBatchBlocks(true)}
                  disabled={batchResults.every((item) => item.status !== 'success')}
                >
                  전체 저장
                </Button>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${batchProgress.percentage}%` }}
              />
            </div>
          </div>

          {collectionSelectorPanel}

          <div className="space-y-4">
            {batchResults.map((item) => (
              <div
                key={item.id}
                className={`bento-card p-5 ${
                  item.status === 'success' ? 'border border-emerald-100' : 'border border-red-100'
                }`}
              >
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      #{item.index} {item.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {item.status === 'success' ? '분석 완료' : '분석 실패'}
                    </p>
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-bold ${
                      item.status === 'success'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.status === 'success' ? '성공' : '실패'}
                  </span>
                </div>

                {item.status === 'success' ? (
                  <>
                    {item.prompt && (
                      <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-500">생성 프롬프트</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.prompt || '');
                              toast.success('프롬프트가 복사되었습니다!');
                            }}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            복사
                          </button>
                        </div>
                        <p className="max-h-24 overflow-y-auto text-xs whitespace-pre-wrap text-gray-600">
                          {item.prompt}
                        </p>
                      </div>
                    )}

                    <div className="mb-3 flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleSelectAllBatchBlocksForImage(item.id)}
                      >
                        이미지 전체 선택
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleClearBatchBlocksForImage(item.id)}
                      >
                        선택 해제
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {BLOCK_TYPES.map((blockType) => {
                        const content = item.result[blockType];
                        if (!content) return null;

                        return (
                          <BlockCard
                            key={`${item.id}-${blockType}`}
                            blockType={blockType}
                            content={content}
                            editable
                            isSelected={batchSelections[item.id]?.has(blockType) ?? false}
                            onToggle={() => handleBatchBlockToggle(item.id, blockType)}
                            onContentChange={(value) =>
                              handleBatchBlockContentChange(item.id, blockType, value)
                            }
                            selectable
                          />
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-700">{item.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Key Modal */}
      <Modal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        title="API 키 설정 필요"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
            <p className="text-sm text-gray-700">
              {selectedAi === 'gpt' ? 'OpenAI' : 'Gemini'} API 키가 설정되지 않았습니다.
              <br />
              설정 페이지에서 API 키를 입력해주세요.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowApiKeyModal(false)}>
              취소
            </Button>
            <Button onClick={() => (window.location.href = '/settings')}>설정으로 이동</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
