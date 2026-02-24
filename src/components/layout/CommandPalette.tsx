'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui';

interface CommandItem {
  id: string;
  label: string;
  description: string;
  action: () => void;
}

interface CommandPaletteProps {
  onOpenHelp: () => void;
}

export function CommandPalette({ onOpenHelp }: CommandPaletteProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: 'decompose',
        label: '프롬프트 분해로 이동',
        description: '이미지/텍스트 프롬프트를 분해합니다.',
        action: () => router.push('/decompose'),
      },
      {
        id: 'assemble',
        label: '블록 조립으로 이동',
        description: '블록을 조합해 프롬프트를 만듭니다.',
        action: () => router.push('/assemble'),
      },
      {
        id: 'library',
        label: '블록 라이브러리로 이동',
        description: '저장한 블록을 검색/관리합니다.',
        action: () => router.push('/library'),
      },
      {
        id: 'collections',
        label: '컬렉션으로 이동',
        description: '컬렉션을 정리하고 블록을 이동합니다.',
        action: () => router.push('/collections'),
      },
      {
        id: 'analytics',
        label: '분석 대시보드로 이동',
        description: '퍼널/사용량 지표를 확인합니다.',
        action: () => router.push('/analytics'),
      },
      {
        id: 'settings',
        label: '설정으로 이동',
        description: 'API 키, 한도, 기본 모델을 설정합니다.',
        action: () => router.push('/settings'),
      },
      {
        id: 'help',
        label: '사용 설명서 열기',
        description: '도움말 모달을 엽니다.',
        action: onOpenHelp,
      },
    ],
    [onOpenHelp, router]
  );

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return commands;
    return commands.filter((item) => {
      return (
        item.label.toLowerCase().includes(text) || item.description.toLowerCase().includes(text)
      );
    });
  }, [commands, query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          if (next) {
            setSelectedIndex(0);
          }
          return next;
        });
      }

      if (!isOpen) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, Math.max(filtered.length - 1, 0)));
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        const selected = filtered[selectedIndex];
        if (selected) {
          selected.action();
          setIsOpen(false);
          setQuery('');
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [filtered, isOpen, selectedIndex]);

  const runCommand = (item: CommandItem) => {
    item.action();
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      <button
        onClick={() => {
          setSelectedIndex(0);
          setIsOpen(true);
        }}
        className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 hover:text-gray-800 lg:inline-flex"
        title="커맨드 팔레트 (Ctrl/Cmd + K)"
      >
        <Search className="h-4 w-4" />
        <span>빠른 실행</span>
        <span className="rounded border border-gray-200 px-1.5 py-0.5 text-xs">Ctrl+K</span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="커맨드 팔레트"
        className="max-w-2xl"
      >
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedIndex(0);
              }}
              placeholder="명령 검색..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-3 pl-10 text-sm outline-none focus:border-purple-500"
            />
          </div>

          <div className="max-h-[360px] space-y-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">검색 결과가 없습니다.</p>
            ) : (
              filtered.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => runCommand(item)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    index === selectedIndex
                      ? 'border-purple-300 bg-purple-50'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{item.description}</p>
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
