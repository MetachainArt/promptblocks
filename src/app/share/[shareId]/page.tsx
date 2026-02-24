'use client';

import { useParams } from 'next/navigation';
import { Copy, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { getShareById, type SharedPromptPayload } from '@/lib/shareLinks';
import { Button } from '@/components/ui';

export default function SharePage() {
  const params = useParams<{ shareId: string }>();
  const shareId = params?.shareId;
  const payload: SharedPromptPayload | null = shareId ? getShareById(shareId) : null;

  if (!payload) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-black text-gray-900">공유 링크를 찾을 수 없습니다</h1>
          <p className="mt-2 text-sm text-gray-500">만료되었거나 삭제된 링크일 수 있습니다.</p>
        </div>
      </div>
    );
  }

  const fullPrompt = payload.negativePrompt
    ? `${payload.prompt}\n\nNegative prompt: ${payload.negativePrompt}`
    : payload.prompt;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black text-gray-900">공유된 프롬프트 (읽기 전용)</h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {new Date(payload.createdAt).toLocaleString()}
          </span>
          <span>블록 {payload.blockCount}개</span>
          <span>만료: {new Date(payload.expiresAt).toLocaleDateString()}</span>
        </div>

        <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-sm whitespace-pre-wrap text-gray-700">{fullPrompt}</p>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={async () => {
              await navigator.clipboard.writeText(fullPrompt);
              toast.success('프롬프트를 복사했습니다.');
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            프롬프트 복사
          </Button>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {payload.blocks.map((block) => (
            <div
              key={`${block.type}-${block.content}`}
              className="rounded-xl border border-gray-100 bg-gray-50 p-3"
            >
              <p className="text-xs font-bold text-purple-600">{block.type}</p>
              <p className="mt-1 text-sm text-gray-700">{block.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
