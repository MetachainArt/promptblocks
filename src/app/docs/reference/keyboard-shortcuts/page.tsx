import { DocsContent, DocSection } from '@/components/docs/DocsContent';

const shortcuts = [
  { key: 'Ctrl/Cmd + D', action: '분해 실행', page: 'Decompose' },
  { key: 'Ctrl/Cmd + S', action: '블록 저장', page: 'Decompose' },
  { key: 'Ctrl/Cmd + C', action: '프롬프트 복사', page: 'Assemble' },
  { key: 'Esc', action: '모달 닫기', page: '전체' },
  { key: '?', action: '단축키 도움말 표시', page: '전체' },
  { key: '/', action: '검색창 포커스', page: 'Library' },
  { key: 'Ctrl/Cmd + Shift + N', action: '새 컬렉션 생성', page: 'Library' },
  { key: 'Ctrl/Cmd + R', action: '블록 무작위 교체', page: 'Assemble' },
  { key: 'Ctrl/Cmd + P', action: '현재 조합 프리셋으로 저장', page: 'Assemble' },
];

export default function KeyboardShortcutsPage() {
  return (
    <DocsContent title="키보드 단축키" description="PromptBlocks의 모든 키보드 단축키 목록">
      <DocSection title="단축키 목록">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="py-3 text-left font-semibold">단축키</th>
                <th className="py-3 text-left font-semibold">Mac</th>
                <th className="py-3 text-left font-semibold">Windows/Linux</th>
                <th className="py-3 text-left font-semibold">기능</th>
                <th className="py-3 text-left font-semibold">페이지</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              {shortcuts.map((shortcut) => (
                <tr key={shortcut.key} className="border-b border-[var(--color-border)]/50">
                  <td className="py-3 font-mono text-xs">{shortcut.key}</td>
                  <td className="py-3">{shortcut.key.replace('Ctrl/Cmd', '⌘')}</td>
                  <td className="py-3">{shortcut.key.replace('Ctrl/Cmd', 'Ctrl')}</td>
                  <td className="py-3">{shortcut.action}</td>
                  <td className="py-3">{shortcut.page}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection title="상세 설명">
        <div className="space-y-4">
          <div className="rounded-lg bg-[var(--color-surface)] p-4">
            <h3 className="font-semibold text-[var(--color-text-primary)]">
              ⌘/Ctrl + D: 분해 실행
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Decompose 페이지에서 이미지/텍스트 분석을 즉시 시작합니다. API 키가 설정되어 있어야
              합니다.
            </p>
          </div>
          <div className="rounded-lg bg-[var(--color-surface)] p-4">
            <h3 className="font-semibold text-[var(--color-text-primary)]">
              ⌘/Ctrl + S: 블록 저장
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              선택된 블록들을 라이브러리에 저장합니다. 저장 전 컬렉션 선택 모달이 열립니다.
            </p>
          </div>
          <div className="rounded-lg bg-[var(--color-surface)] p-4">
            <h3 className="font-semibold text-[var(--color-text-primary)]">
              ⌘/Ctrl + C: 프롬프트 복사
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              완성된 프롬프트를 클립보드에 복사합니다. 텍스트 선택 상태에서는 일반 복사 동작을
              합니다.
            </p>
          </div>
          <div className="rounded-lg bg-[var(--color-surface)] p-4">
            <h3 className="font-semibold text-[var(--color-text-primary)]">Esc: 모달 닫기</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              열린 모달, 다이얼로그, 드롭다운을 닫습니다. 모달이 없을 때는 아무 동작도 하지
              않습니다.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="사용 팁">
        <ul className="list-inside list-disc space-y-2 text-[var(--color-text-secondary)]">
          <li>텍스트 입력 중(입력란에 포커스)에는 단축키가 비활성화됩니다.</li>
          <li>일부 단축키는 브라우저 기본 단축키와 충돌할 수 있습니다.</li>
          <li>Mac에서는 ⌘(Command), Windows/Linux에서는 Ctrl를 사용합니다.</li>
        </ul>
      </DocSection>
    </DocsContent>
  );
}
