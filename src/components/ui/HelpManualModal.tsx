'use client';

import { Modal } from './Modal';
import {
  Sparkles,
  Search,
  Grid,
  Puzzle,
  Image as ImageIcon,
  Palette,
  Camera,
  Sun,
  Monitor,
  User,
  MoreHorizontal,
} from 'lucide-react';

interface HelpManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpManualModal({ isOpen, onClose }: HelpManualModalProps) {
  const sections = [
    {
      title: 'PromptBlocks란?',
      icon: <Sparkles className="h-5 w-5 text-purple-500" />,
      content:
        'PromptBlocks는 이미지 프롬프트를 레고 블록처럼 분해하고 조립할 수 있는 도구입니다. 13가지 요소로 세분화된 블록을 통해 AI 이미지 생성을 위한 완벽한 프롬프트를 만들어보세요.',
    },
    {
      title: '프롬프트 분해 (Decompose)',
      icon: <Search className="h-5 w-5 text-cyan-500" />,
      content:
        '이미지를 업로드하면 AI가 자동으로 프롬프트를 분석하여 13가지 요소의 블록으로 분해합니다.\n• 생성된 블록은 라이브러리에 개별적으로 저장할 수 있습니다.\n• OpenAI(GPT)와 Google(Gemini) 모델을 모두 지원합니다.',
    },
    {
      title: '블록 라이브러리 (Library)',
      icon: <Grid className="h-5 w-5 text-green-500" />,
      content:
        '분해하거나 직접 생성한 블록들을 관리하는 공간입니다.\n• 블록을 종류별로 필터링하고 검색할 수 있습니다.\n• 자주 쓰는 블록은 즐겨찾기에 추가하여 쉽게 찾을 수 있습니다.',
    },
    {
      title: '블록 조립 (Assemble)',
      icon: <Puzzle className="h-5 w-5 text-orange-500" />,
      content:
        '저장된 블록들을 드래그 앤 드롭으로 조합하여 새로운 프롬프트를 만듭니다.\n• 여러 블록을 조합하여 나만의 프리셋(Preset)으로 저장할 수 있습니다.\n• 완성된 프롬프트는 바로 복사하여 Midjourney나 Stable Diffusion에서 사용할 수 있습니다.',
    },
  ];

  const blockTypes = [
    { name: 'Subject', desc: '주제/피사체', icon: <User className="h-4 w-4" /> },
    { name: 'Style', desc: '화풍/스타일', icon: <Palette className="h-4 w-4" /> },
    { name: 'Action', desc: '동작/행동', icon: <MoreHorizontal className="h-4 w-4" /> },
    { name: 'Object', desc: '사물/오브젝트', icon: <Grid className="h-4 w-4" /> },
    { name: 'Background', desc: '배경/환경', icon: <ImageIcon className="h-4 w-4" /> },
    { name: 'Lighting', desc: '조명/빛', icon: <Sun className="h-4 w-4" /> },
    { name: 'Camera', desc: '카메라 앵글/샷', icon: <Camera className="h-4 w-4" /> },
    { name: 'Quality', desc: '화질/해상도', icon: <Monitor className="h-4 w-4" /> },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="PromptBlocks 사용 설명서" className="max-w-4xl">
      <div className="custom-scrollbar max-h-[70vh] space-y-8 overflow-y-auto pr-2">
        {/* Intro Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-5 transition-colors hover:bg-gray-100/80"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm">
                  {section.icon}
                </div>
                <h3 className="font-bold text-gray-900">{section.title}</h3>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line text-gray-600">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Block Types Reference */}
        <div className="rounded-3xl border border-purple-100 bg-purple-50 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-purple-900">
            <Sparkles className="h-5 w-5 text-purple-500" />
            13가지 블록 요소 가이드
          </h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {blockTypes.map((block, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 rounded-xl border border-purple-100 bg-white/80 p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  {block.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">{block.name}</div>
                  <div className="text-[10px] text-gray-500">{block.desc}</div>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center rounded-xl border border-dashed border-purple-200 bg-white/40 p-3 text-xs font-medium text-purple-400">
              + 5 More...
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="rounded-r-xl border-l-4 border-cyan-400 bg-cyan-50 p-4">
          <div className="flex gap-3">
            <div className="shrink-0 pt-1">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-600">
                !
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm font-bold text-cyan-900">Tip: API 키 설정이 필요해요!</p>
              <p className="text-sm text-cyan-800">
                이미지 자동 분석 기능을 사용하려면 [설정] 메뉴에서 OpenAI 또는 Gemini API 키를
                등록해야 합니다. API 키는 브라우저에만 안전하게 저장됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
