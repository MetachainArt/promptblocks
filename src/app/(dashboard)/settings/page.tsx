'use client';

import { useState, useEffect } from 'react';
import { Check, Shield, Save, Trash2, HelpCircle, Key } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui';
import {
  getUserSettings,
  saveOpenaiKey,
  saveGeminiKey,
  savePreferredAi,
  deleteOpenaiKey,
  deleteGeminiKey,
} from '@/lib/userSettings';

export default function SettingsPage() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [hasOpenaiKey, setHasOpenaiKey] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [preferredAi, setPreferredAi] = useState<'gpt' | 'gemini'>('gpt');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getUserSettings();
        setHasOpenaiKey(!!settings.openaiKey);
        setHasGeminiKey(!!settings.geminiKey);
        setPreferredAi(settings.preferredAi);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-3 text-gray-500">설정 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <div className="mb-2">
        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
          앱 <span className="text-purple-500">설정</span>
        </h1>
        <p className="text-gray-500 font-medium text-lg">
          API 키와 기본 AI 모델을 설정합니다.
        </p>
      </div>

      {/* Security Notice */}
      <div className="bento-card p-6 flex gap-5 bg-purple-50 border-purple-100">
        <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-bold text-purple-700 text-lg">보안 및 프라이버시 안내</h4>
          <p className="text-sm text-purple-600 mt-1 leading-relaxed">
            API 키는 브라우저의 로컬 스토리지 또는 Supabase에 안전하게 저장됩니다.
            서버로 절대 전송되지 않으며, 오직 AI 요청 발생 시에만 해당 서비스로 안전하게 라우팅됩니다.
          </p>
        </div>
      </div>

      {/* AI Model Selection */}
      <div className="bento-card overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
            기본 AI 모델 설정
          </h3>
          <span className="text-xs font-mono text-purple-600 bg-purple-100 px-2 py-1 rounded-lg">
            V 2.4.0
          </span>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GPT Option */}
          <button
            onClick={() => handlePreferredAiChange('gpt')}
            disabled={isSaving}
            className={`relative cursor-pointer group rounded-2xl p-6 transition-all text-left border-2 ${
              preferredAi === 'gpt'
                ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="relative">
              {preferredAi === 'gpt' && (
                <div className="absolute top-0 right-0">
                  <Check className="h-6 w-6 text-purple-500" />
                </div>
              )}
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-black text-gray-900">G</span>
              </div>
              <h4 className={`font-bold text-xl ${preferredAi === 'gpt' ? 'text-purple-700' : 'text-gray-900'}`}>
                GPT (OpenAI)
              </h4>
              <p className="text-sm mt-2 text-gray-500">
                GPT-4o Turbo 모델 {preferredAi === 'gpt' ? '활성화됨' : '대기중'}
              </p>
              {preferredAi === 'gpt' && (
                <div className="mt-4 w-full h-2 bg-purple-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-full"></div>
                </div>
              )}
            </div>
          </button>

          {/* Gemini Option */}
          <button
            onClick={() => handlePreferredAiChange('gemini')}
            disabled={isSaving}
            className={`relative cursor-pointer group rounded-2xl p-6 transition-all text-left border-2 ${
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
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-black text-gray-900">✦</span>
              </div>
              <h4 className={`font-bold text-xl ${preferredAi === 'gemini' ? 'text-cyan-700' : 'text-gray-900'}`}>
                Gemini (Google)
              </h4>
              <p className="text-sm mt-2 text-gray-500">
                Gemini 1.5 Pro 모델 {preferredAi === 'gemini' ? '활성화됨' : '대기중'}
              </p>
              {preferredAi === 'gemini' && (
                <div className="mt-4 w-full h-2 bg-cyan-200 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-full"></div>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* OpenAI API Key */}
      <div className="bento-card overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Key className="h-5 w-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">OpenAI API Access</h3>
          </div>
          
          {hasOpenaiKey ? (
            <div className="flex items-center justify-between p-5 bg-green-50 border border-green-200 rounded-2xl">
              <div className="flex items-center gap-3 text-green-600">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold block">인증됨</span>
                  <span className="text-sm text-green-500">API 연결이 정상적으로 설정되었습니다.</span>
                </div>
              </div>
              <button
                onClick={handleDeleteOpenaiKey}
                disabled={isSaving}
                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 hover:text-red-600 px-5 py-2.5 font-semibold rounded-xl transition-all text-sm flex items-center gap-2"
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
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-700 font-medium outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <button
                onClick={handleSaveOpenaiKey}
                disabled={isSaving}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 transition-all flex items-center gap-2"
              >
                저장
                <Save className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <p className="mt-4 text-sm text-gray-400 flex items-center gap-1">
            <HelpCircle className="h-4 w-4" />
            OpenAI API 키는{' '}
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-500 font-medium hover:underline">
              개발자 대시보드
            </a>
            에서 발급받을 수 있습니다.
          </p>
        </div>
      </div>

      {/* Gemini API Key */}
      <div className="bento-card overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Key className="h-5 w-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Gemini API Access</h3>
          </div>
          
          {hasGeminiKey ? (
            <div className="flex items-center justify-between p-5 bg-green-50 border border-green-200 rounded-2xl">
              <div className="flex items-center gap-3 text-green-600">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold block">인증됨</span>
                  <span className="text-sm text-green-500">API 연결이 정상적으로 설정되었습니다.</span>
                </div>
              </div>
              <button
                onClick={handleDeleteGeminiKey}
                disabled={isSaving}
                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 hover:text-red-600 px-5 py-2.5 font-semibold rounded-xl transition-all text-sm flex items-center gap-2"
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
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-700 font-medium outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
              <button
                onClick={handleSaveGeminiKey}
                disabled={isSaving}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-cyan-200 hover:shadow-xl hover:shadow-cyan-300 transition-all flex items-center gap-2"
              >
                저장
                <Save className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <p className="mt-4 text-sm text-gray-400 flex items-center gap-1">
            <HelpCircle className="h-4 w-4" />
            Gemini API 키는{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-500 font-medium hover:underline">
              Google AI Studio
            </a>
            에서 발급받을 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
