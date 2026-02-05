'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, AlertCircle, Upload, X, Zap, Save, Brain, RefreshCw, FolderOpen, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Button } from '@/components/ui';
import { BlockCard } from '@/components/blocks/BlockCard';
import { BLOCK_TYPES, type BlockType, type DecomposeResult, type Collection } from '@/types';
import { saveBlocks } from '@/lib/blocks';
import { getApiKey } from '@/lib/userSettings';
import { getCollections, createCollection } from '@/lib/collections';

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

export default function DecomposePage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedAi, setSelectedAi] = useState<'gpt' | 'gemini'>('gpt');
  const [selectedModel, setSelectedModel] = useState('gpt-5.2');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DecomposeResult | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [selectedBlocks, setSelectedBlocks] = useState<Set<BlockType>>(new Set());
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 컬렉션 관련 state
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [suggestedName, setSuggestedName] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    getCollections().then(setCollections);
  }, []);

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
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('파일 크기는 20MB 이하만 가능합니다.');
      return;
    }

    setImageFile(file);
    const preview = await compressImage(file);
    setImagePreview(preview);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      toast.error('이미지를 업로드해주세요.');
      return;
    }

    const apiKey = await getApiKey(selectedAi);
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setIsLoading(true);
    setResult(null);
    setGeneratedPrompt(null);
    setAnalysisError(null);

    try {
      const base64 = imagePreview!;

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          'X-AI-Provider': selectedAi,
          'X-AI-Model': selectedModel,
        },
        body: JSON.stringify({ image: base64 }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('서버 응답을 처리할 수 없습니다. 이미지 크기를 줄여보세요.');
      }

      if (!response.ok) {
        throw new Error(data.error || '분석에 실패했습니다.');
      }

      setGeneratedPrompt(data.prompt);
      setResult(data.result);
      setSelectedBlocks(new Set(BLOCK_TYPES.filter((type) => data.result[type])));
      setSuggestedName(suggestCollectionName(data.result));
      toast.success('이미지가 분석되었습니다!');
    } catch (error) {
      const message = error instanceof Error ? error.message : '분석에 실패했습니다.';
      setAnalysisError(message);
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

  const handleSaveBlocks = async () => {
    if (selectedBlocks.size === 0 || !result) {
      toast.error('저장할 블록을 선택해주세요.');
      return;
    }

    const blocksToSave = Array.from(selectedBlocks)
      .filter((type) => result[type])
      .map((type) => ({
        blockType: type,
        content: result[type],
      }));

    try {
      const saved = await saveBlocks(blocksToSave, undefined, selectedCollectionId || undefined);
      const newCount = saved.filter((b) => blocksToSave.some((item) => item.content === b.content)).length;

      if (newCount > 0) {
        toast.success(`${newCount}개의 블록이 라이브러리에 저장되었습니다.`);
      } else {
        toast.info('이미 저장된 블록입니다.');
      }
    } catch (error) {
      console.error('블록 저장 실패:', error);
      toast.error('블록 저장에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <div className="mb-2">
        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
          프롬프트 분해 <span className="text-purple-500">Tool</span>
        </h1>
        <p className="text-gray-500 font-medium text-lg">
          이미지를 업로드하여 AI가 사용한 프롬프트를 13가지 요소로 정밀 분석합니다.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-8 upload-area p-2 relative group">
          {!imagePreview ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="upload-inner h-full flex flex-col items-center justify-center p-12 relative overflow-hidden cursor-pointer min-h-[400px]"
            >
              {/* Animated Blobs */}
              <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute top-10 right-10 w-20 h-20 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-20 h-20 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
              
              <div className="w-24 h-24 rounded-3xl bg-white shadow-lg flex items-center justify-center mb-6 transform group-hover:-translate-y-2 transition-transform duration-300 z-10">
                <Upload className="h-12 w-12 text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 z-10">이미지를 끌어다 놓으세요</h2>
              <p className="text-gray-500 font-medium z-10">또는 클릭하여 업로드 (최대 20MB)</p>
            </div>
          ) : (
            <div className="relative rounded-[2rem] overflow-hidden bg-gray-50 min-h-[400px] flex items-center justify-center">
              <img
                src={imagePreview}
                alt="업로드된 이미지"
                className="max-h-[400px] w-full object-contain"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute right-4 top-4 rounded-full bg-white shadow-lg p-2 hover:bg-red-500 hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* AI Model Selection Card */}
          <div className="bento-card p-8 flex flex-col gap-6 flex-grow justify-center">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">AI 모델 선택</label>
              <div className="relative">
                <select
                  value={selectedAi}
                  onChange={(e) => {
                    const ai = e.target.value as 'gpt' | 'gemini';
                    setSelectedAi(ai);
                    setSelectedModel(AI_MODELS[ai][0].id);
                  }}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium px-5 py-4 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="gpt">OpenAI</option>
                  <option value="gemini">Google Gemini</option>
                </select>
                <svg className="absolute right-4 top-4 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">모델 버전</label>
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium px-5 py-4 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  {AI_MODELS[selectedAi].map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-4 top-4 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!imageFile || isLoading}
            className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-bold text-lg shadow-xl shadow-purple-200 hover:shadow-2xl hover:shadow-purple-300 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>분석 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-6 w-6" />
                <span>이미지 분석 시작</span>
              </>
            )}
          </button>

          {/* 에러 재시도 */}
          {analysisError && !isLoading && (
            <div className="bento-card p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              <p className="flex-1 text-sm text-gray-600">{analysisError}</p>
              <button
                onClick={handleAnalyze}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-100 text-purple-700 font-medium text-sm hover:bg-purple-200 transition-colors shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
                재시도
              </button>
            </div>
          )}
        </div>

        {/* Feature Cards */}
        {!result && (
          <>
            <div className="lg:col-span-4 bento-card p-8 group feature-cyan">
              <div className="w-14 h-14 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">정교한 분석</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">화풍, 구도, 조명 등 13가지 전문 프롬프트 요소를 AI가 정밀 추출합니다.</p>
            </div>
            <div className="lg:col-span-4 bento-card p-8 group feature-green">
              <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Save className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">즉시 저장</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">추출된 각 요소들을 개별 블록으로 라이브러리에 바로 저장하세요.</p>
            </div>
            <div className="lg:col-span-4 bento-card p-8 group feature-orange">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">빠른 워크플로우</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">분해한 요소들을 드래그 앤 드롭으로 재조합하여 새 이미지를 만드세요.</p>
            </div>
          </>
        )}
      </div>

      {/* Generated Prompt */}
      {generatedPrompt && (
        <div className="bento-card p-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">생성된 프롬프트</h2>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedPrompt);
                toast.success('프롬프트가 복사되었습니다!');
              }}
              className="text-sm text-purple-500 font-medium hover:text-purple-700 transition-colors"
            >
              복사
            </button>
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border border-gray-100">
            {generatedPrompt}
          </p>
        </div>
      )}

      {/* Analysis Results */}
      {result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">13개 요소로 분해</h2>
            <Button variant="neon" onClick={handleSaveBlocks} disabled={selectedBlocks.size === 0}>
              선택한 블록 저장 ({selectedBlocks.size})
            </Button>
          </div>

          {/* 컬렉션 선택 */}
          <div className="bento-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="h-5 w-5 text-purple-500" />
              <h3 className="font-bold text-gray-900">저장할 컬렉션</h3>
            </div>

            {suggestedName && (
              <div className="mb-3 flex items-center gap-2 rounded-xl bg-purple-50 border border-purple-200 p-3">
                <Sparkles className="h-4 w-4 text-purple-500 shrink-0" />
                <span className="text-sm text-gray-700">추천: <strong>{suggestedName}</strong></span>
                <button
                  onClick={handleUseSuggested}
                  className="ml-auto text-xs text-purple-600 font-bold hover:text-purple-800 shrink-0"
                >
                  사용하기
                </button>
              </div>
            )}

            <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="collection"
                  checked={selectedCollectionId === null}
                  onChange={() => setSelectedCollectionId(null)}
                  className="accent-purple-600"
                />
                <span className="text-sm text-gray-700">📁 미분류</span>
              </label>
              {collections.map((col) => (
                <label key={col.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="collection"
                    checked={selectedCollectionId === col.id}
                    onChange={() => setSelectedCollectionId(col.id)}
                    className="accent-purple-600"
                  />
                  <span className="text-sm text-gray-700">{col.emoji || '📁'} {col.name}</span>
                </label>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Plus className="h-4 w-4 text-gray-400 shrink-0" />
              <input
                placeholder="새 컬렉션 이름..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateNewCollection(); }}
                className="flex-1 text-sm border-b border-gray-200 py-1 outline-none focus:border-purple-500 bg-transparent text-gray-700 placeholder-gray-400"
              />
              <button
                onClick={handleCreateNewCollection}
                disabled={!newCollectionName.trim()}
                className="text-xs text-purple-600 font-bold disabled:opacity-30 hover:text-purple-800 shrink-0"
              >
                만들기
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {BLOCK_TYPES.map((blockType) => {
              const content = result[blockType];
              if (!content) return null;

              return (
                <BlockCard
                  key={blockType}
                  blockType={blockType}
                  content={content}
                  isSelected={selectedBlocks.has(blockType)}
                  onToggle={() => handleBlockToggle(blockType)}
                  selectable
                />
              );
            })}
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
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
            <p className="text-sm text-gray-700">
              {selectedAi === 'gpt' ? 'OpenAI' : 'Gemini'} API 키가 설정되지 않았습니다.
              <br />설정 페이지에서 API 키를 입력해주세요.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowApiKeyModal(false)}>
              취소
            </Button>
            <Button variant="neon" onClick={() => (window.location.href = '/settings')}>
              설정으로 이동
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
