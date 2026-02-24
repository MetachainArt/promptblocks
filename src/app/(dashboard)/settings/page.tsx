'use client';

import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import {
  Check,
  Shield,
  Save,
  Trash2,
  HelpCircle,
  Key,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui';
import {
  getUserSettings,
  saveOpenaiKey,
  saveGeminiKey,
  savePreferredAi,
  deleteOpenaiKey,
  deleteGeminiKey,
  saveIdentitySettings,
} from '@/lib/userSettings';
import {
  getUsageSettings,
  saveUsageSettings,
  getUsageSnapshot,
  type UsageSettings,
} from '@/lib/usageLimits';

export default function SettingsPage() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [hasOpenaiKey, setHasOpenaiKey] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [preferredAi, setPreferredAi] = useState<'gpt' | 'gemini'>('gpt');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [usageSettings, setUsageSettings] = useState<UsageSettings>({
    dailyLimit: 30,
    monthlyLimit: 400,
    warningThreshold: 0.8,
  });
  const [usageSummary, setUsageSummary] = useState(getUsageSnapshot());
  const [identityAnchor, setIdentityAnchor] = useState('');
  const [identityEnabled, setIdentityEnabled] = useState(false);
  const [identityReferenceImage, setIdentityReferenceImage] = useState<string | null>(null);
  const [identityReferenceWeight, setIdentityReferenceWeight] = useState(0.75);
  const [identityAutoApply, setIdentityAutoApply] = useState(true);

  const readImageAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('이미지 파일을 읽을 수 없습니다.'));
      reader.readAsDataURL(file);
    });

  const resizeReferenceImage = async (file: File): Promise<string> => {
    const source = await readImageAsDataUrl(file);
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('이미지 로드에 실패했습니다.'));
      img.src = source;
    });

    const maxSize = 768;
    const ratio = Math.min(maxSize / image.width, maxSize / image.height, 1);
    const targetWidth = Math.max(1, Math.round(image.width * ratio));
    const targetHeight = Math.max(1, Math.round(image.height * ratio));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('이미지 처리 컨텍스트를 생성할 수 없습니다.');
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);
    return canvas.toDataURL('image/jpeg', 0.82);
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getUserSettings();
        setHasOpenaiKey(!!settings.openaiKey);
        setHasGeminiKey(!!settings.geminiKey);
        setPreferredAi(settings.preferredAi);
        setUsageSettings(getUsageSettings());
        setUsageSummary(getUsageSnapshot());
        setIdentityAnchor(settings.identityAnchor || '');
        setIdentityEnabled(settings.identityEnabled || false);
        setIdentityReferenceImage(settings.identityReferenceImage || null);
        setIdentityReferenceWeight(settings.identityReferenceWeight || 0.75);
        setIdentityAutoApply(settings.identityAutoApply !== false);
      } catch (error) {
        console.error('설정 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveOpenaiKey = async () => {
    if (!openaiKey.trim()) {
      toast.error('API 키를 입력해주세요.');
      return;
    }
    setIsSaving(true);
    try {
      await saveOpenaiKey(openaiKey);
      setHasOpenaiKey(true);
      setOpenaiKey('');
      toast.success('OpenAI API 키가 저장되었습니다.');
    } catch {
      toast.error('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGeminiKey = async () => {
    if (!geminiKey.trim()) {
      toast.error('API 키를 입력해주세요.');
      return;
    }
    setIsSaving(true);
    try {
      await saveGeminiKey(geminiKey);
      setHasGeminiKey(true);
      setGeminiKey('');
      toast.success('Gemini API 키가 저장되었습니다.');
    } catch {
      toast.error('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOpenaiKey = async () => {
    setIsSaving(true);
    try {
      await deleteOpenaiKey();
      setHasOpenaiKey(false);
      toast.success('OpenAI API 키가 삭제되었습니다.');
    } catch {
      toast.error('삭제에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGeminiKey = async () => {
    setIsSaving(true);
    try {
      await deleteGeminiKey();
      setHasGeminiKey(false);
      toast.success('Gemini API 키가 삭제되었습니다.');
    } catch {
      toast.error('삭제에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferredAiChange = async (ai: 'gpt' | 'gemini') => {
    setPreferredAi(ai);
    try {
      await savePreferredAi(ai);
      toast.success(`기본 AI가 ${ai === 'gpt' ? 'GPT' : 'Gemini'}로 변경되었습니다.`);
    } catch {
      toast.error('저장에 실패했습니다.');
    }
  };

  const handleSaveUsageSettings = () => {
    if (usageSettings.dailyLimit < 1 || usageSettings.monthlyLimit < 1) {
      toast.error('일/월 한도는 1 이상이어야 합니다.');
      return;
    }

    if (usageSettings.warningThreshold < 0.5 || usageSettings.warningThreshold > 0.95) {
      toast.error('임계치는 0.50 ~ 0.95 사이로 설정해주세요.');
      return;
    }

    saveUsageSettings(usageSettings);
    setUsageSummary(getUsageSnapshot());
    toast.success('비용/사용량 가드레일이 저장되었습니다.');
  };

  const handleSaveIdentityAnchor = async () => {
    if (identityEnabled && !identityAnchor.trim()) {
      toast.error('얼굴 고정 활성화 시 앵커 설명을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      await saveIdentitySettings(
        identityAnchor.trim(),
        identityEnabled,
        identityReferenceImage,
        identityReferenceWeight,
        identityAutoApply
      );
      toast.success('얼굴 일관성 앵커 설정이 저장되었습니다.');
    } catch {
      toast.error('얼굴 앵커 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadReferenceImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드할 수 있습니다.');
      event.target.value = '';
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error('8MB 이하 이미지를 업로드해주세요.');
      event.target.value = '';
      return;
    }

    try {
      const resized = await resizeReferenceImage(file);
      setIdentityReferenceImage(resized);
      toast.success('Reference 이미지가 적용되었습니다. 저장 버튼을 눌러 반영하세요.');
    } catch {
      toast.error('이미지 처리에 실패했습니다. 다른 이미지로 시도해주세요.');
    } finally {
      event.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500"></div>
          <p className="mt-3 text-gray-500">설정 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <div className="mb-2">
        <h1 className="mb-2 text-4xl font-black tracking-tight text-gray-900">
          앱 <span className="text-indigo-600">설정</span>
        </h1>
        <p className="text-lg font-medium text-gray-500">API 키와 기본 AI 모델을 설정합니다.</p>
      </div>

      {/* Security Notice */}
      <div className="bento-card flex gap-5 border-indigo-100 bg-indigo-50 p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-indigo-700">보안 및 프라이버시 안내</h4>
          <p className="mt-1 text-sm leading-relaxed text-indigo-600">
            API 키는 브라우저의 로컬 스토리지 또는 Supabase에 안전하게 저장됩니다. 서버로 절대
            전송되지 않으며, 오직 AI 요청 발생 시에만 해당 서비스로 안전하게 라우팅됩니다.
          </p>
        </div>
      </div>

      {/* AI Model Selection */}
      <div className="bento-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <span className="h-6 w-1 rounded-full bg-indigo-500"></span>
            기본 AI 모델 설정
          </h3>
          <span className="rounded-lg bg-indigo-100 px-2 py-1 font-mono text-xs text-indigo-600">
            V 2.4.0
          </span>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          {/* GPT Option */}
          <button
            onClick={() => handlePreferredAiChange('gpt')}
            disabled={isSaving}
            className={`group relative cursor-pointer rounded-2xl border-2 p-6 text-left transition-all ${
              preferredAi === 'gpt'
                ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="relative">
              {preferredAi === 'gpt' && (
                <div className="absolute top-0 right-0">
                  <Check className="h-6 w-6 text-indigo-500" />
                </div>
              )}
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 transition-transform group-hover:scale-110">
                <span className="text-2xl font-black text-gray-900">G</span>
              </div>
              <h4
                className={`text-xl font-bold ${preferredAi === 'gpt' ? 'text-indigo-700' : 'text-gray-900'}`}
              >
                GPT (OpenAI)
              </h4>
              <p className="mt-2 text-sm text-gray-500">
                GPT-4o Turbo 모델 {preferredAi === 'gpt' ? '활성화됨' : '대기중'}
              </p>
              {preferredAi === 'gpt' && (
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-indigo-200">
                  <div className="h-full w-full bg-indigo-500"></div>
                </div>
              )}
            </div>
          </button>

          {/* Gemini Option */}
          <button
            onClick={() => handlePreferredAiChange('gemini')}
            disabled={isSaving}
            className={`group relative cursor-pointer rounded-2xl border-2 p-6 text-left transition-all ${
              preferredAi === 'gemini'
                ? 'border-cyan-500 bg-cyan-50 shadow-lg shadow-cyan-100'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="relative">
              {preferredAi === 'gemini' && (
                <div className="absolute top-0 right-0">
                  <Check className="h-6 w-6 text-cyan-500" />
                </div>
              )}
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 transition-transform group-hover:scale-110">
                <span className="text-2xl font-black text-gray-900">✦</span>
              </div>
              <h4
                className={`text-xl font-bold ${preferredAi === 'gemini' ? 'text-cyan-700' : 'text-gray-900'}`}
              >
                Gemini (Google)
              </h4>
              <p className="mt-2 text-sm text-gray-500">
                Gemini 1.5 Pro 모델 {preferredAi === 'gemini' ? '활성화됨' : '대기중'}
              </p>
              {preferredAi === 'gemini' && (
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-cyan-200">
                  <div className="h-full w-full bg-cyan-500"></div>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* OpenAI API Key */}
      <div className="bento-card overflow-hidden">
        <div className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
              <Shield className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">비용/사용량 가드레일</h3>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <p className="mb-1 text-xs font-bold text-gray-500">일일 한도</p>
              <input
                type="number"
                min={1}
                value={usageSettings.dailyLimit}
                onChange={(event) =>
                  setUsageSettings((prev) => ({
                    ...prev,
                    dailyLimit: Number(event.target.value || 1),
                  }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
              />
            </div>
            <div>
              <p className="mb-1 text-xs font-bold text-gray-500">월간 한도</p>
              <input
                type="number"
                min={1}
                value={usageSettings.monthlyLimit}
                onChange={(event) =>
                  setUsageSettings((prev) => ({
                    ...prev,
                    monthlyLimit: Number(event.target.value || 1),
                  }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
              />
            </div>
            <div>
              <p className="mb-1 text-xs font-bold text-gray-500">경고 임계치</p>
              <input
                type="number"
                min={0.5}
                max={0.95}
                step={0.05}
                value={usageSettings.warningThreshold}
                onChange={(event) =>
                  setUsageSettings((prev) => ({
                    ...prev,
                    warningThreshold: Number(event.target.value || 0.8),
                  }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">오늘 사용량</p>
              <p className="text-lg font-bold text-gray-900">
                {usageSummary.dailyUsed} / {usageSummary.settings.dailyLimit}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">이번 달 사용량</p>
              <p className="text-lg font-bold text-gray-900">
                {usageSummary.monthlyUsed} / {usageSummary.settings.monthlyLimit}
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveUsageSettings}>가드레일 저장</Button>
          </div>
        </div>
      </div>

      <div className="bento-card overflow-hidden">
        <div className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
              <Shield className="h-5 w-5 text-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">얼굴 일관성 앵커</h3>
          </div>

          <p className="mb-4 text-sm text-gray-500">
            얼굴의 고정 특징을 1줄로 정의해두면 조립 프롬프트에 자동으로 주입됩니다. (예: oval face,
            monolid almond eyes, short philtrum, black bob hair)
          </p>

          <label className="mb-3 flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={identityEnabled}
              onChange={(event) => setIdentityEnabled(event.target.checked)}
              className="h-4 w-4 accent-indigo-600"
            />
            얼굴 일관성 앵커 사용
          </label>

          <label className="mb-3 flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={identityAutoApply}
              onChange={(event) => setIdentityAutoApply(event.target.checked)}
              className="h-4 w-4 accent-rose-600"
            />
            이미지 분석 후 얼굴 기준 자동 저장
          </label>

          <textarea
            value={identityAnchor}
            onChange={(event) => setIdentityAnchor(event.target.value)}
            placeholder="고정할 얼굴 특징을 입력하세요"
            className="min-h-[110px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 transition-all outline-none focus:border-indigo-500"
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="mb-2 text-xs font-bold text-gray-500">Reference 이미지</p>
              {identityReferenceImage ? (
                <div className="flex items-start gap-3">
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <NextImage
                      src={identityReferenceImage}
                      alt="Face reference"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <label
                      htmlFor="face-reference-upload"
                      className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      변경
                    </label>
                    <button
                      type="button"
                      onClick={() => setIdentityReferenceImage(null)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="face-reference-upload"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-3 py-6 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  <ImageIcon className="h-4 w-4" />
                  얼굴 기준 이미지 업로드
                </label>
              )}
              <input
                id="face-reference-upload"
                type="file"
                accept="image/*"
                onChange={handleUploadReferenceImage}
                className="hidden"
              />
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="mb-2 text-xs font-bold text-gray-500">Reference 가중치</p>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={identityReferenceWeight}
                onChange={(event) => setIdentityReferenceWeight(Number(event.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                <span>낮음(유연)</span>
                <span className="font-bold text-gray-800">
                  {Math.round(identityReferenceWeight * 100)}%
                </span>
                <span>높음(고정)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveIdentityAnchor} disabled={isSaving}>
              앵커 저장
            </Button>
          </div>
        </div>
      </div>

      {/* OpenAI API Key */}
      <div className="bento-card overflow-hidden">
        <div className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <Key className="h-5 w-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">OpenAI API Access</h3>
          </div>

          {hasOpenaiKey ? (
            <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-center gap-3 text-green-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <span className="block font-bold">인증됨</span>
                  <span className="text-sm text-green-500">
                    API 연결이 정상적으로 설정되었습니다.
                  </span>
                </div>
              </div>
              <button
                onClick={handleDeleteOpenaiKey}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-500 transition-all hover:bg-red-100 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                삭제
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <input
                type="password"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 font-medium text-gray-700 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSaveOpenaiKey}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-8 py-4 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-300"
              >
                저장
                <Save className="h-4 w-4" />
              </button>
            </div>
          )}

          <p className="mt-4 flex items-center gap-1 text-sm text-gray-400">
            <HelpCircle className="h-4 w-4" />
            OpenAI API 키는{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-500 hover:underline"
            >
              개발자 대시보드
            </a>
            에서 발급받을 수 있습니다.
          </p>
        </div>
      </div>

      {/* Gemini API Key */}
      <div className="bento-card overflow-hidden">
        <div className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <Key className="h-5 w-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Gemini API Access</h3>
          </div>

          {hasGeminiKey ? (
            <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-center gap-3 text-green-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <span className="block font-bold">인증됨</span>
                  <span className="text-sm text-green-500">
                    API 연결이 정상적으로 설정되었습니다.
                  </span>
                </div>
              </div>
              <button
                onClick={handleDeleteGeminiKey}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-500 transition-all hover:bg-red-100 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                삭제
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <input
                type="password"
                placeholder="AI..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 font-medium text-gray-700 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={handleSaveGeminiKey}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-8 py-4 font-bold text-white shadow-lg shadow-cyan-200 transition-all hover:shadow-xl hover:shadow-cyan-300"
              >
                저장
                <Save className="h-4 w-4" />
              </button>
            </div>
          )}

          <p className="mt-4 flex items-center gap-1 text-sm text-gray-400">
            <HelpCircle className="h-4 w-4" />
            Gemini API 키는{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-cyan-500 hover:underline"
            >
              Google AI Studio
            </a>
            에서 발급받을 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
