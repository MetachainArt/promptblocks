import { DocsContent, DocSection } from '@/components/docs/DocsContent';

const glossary = [
  {
    term: 'AI 이미지 생성',
    english: 'AI Image Generation',
    def: '인공지능이 텍스트 프롬프트를 기반으로 이미지를 생성하는 기술',
  },
  {
    term: 'Assemble (조립)',
    english: 'Assemble',
    def: '저장된 블록을 조합하여 완성된 프롬프트를 만드는 기능',
  },
  {
    term: 'Batch Decomposition (배치 분해)',
    english: 'Batch Decomposition',
    def: '여러 이미지를 한 번에 분석하는 기능',
  },
  {
    term: 'Block (블록)',
    english: 'Block',
    def: '프롬프트의 의미 단위로 분하된 요소',
  },
  {
    term: 'Collection (컬렉션)',
    english: 'Collection',
    def: '블록을 그룹화하여 관리하는 단위',
  },
  {
    term: 'Decompose (분해)',
    english: 'Decompose',
    def: '이미지나 텍스트를 13개 블록으로 분석하는 기능',
  },
  {
    term: 'Face Consistency (얼굴 일관성)',
    english: 'Face Consistency',
    def: '같은 캐릭터의 외형을 유지하면서 다른 상황의 이미지를 생성하는 기능',
  },
  {
    term: 'Negative Prompt (네거티브 프롬프트)',
    english: 'Negative Prompt',
    def: '이미지에서 제외하고 싶은 요소를 지정하는 프롬프트',
  },
  {
    term: 'Preset (프리셋)',
    english: 'Preset',
    def: '자주 사용하는 블록 조합을 저장한 템플릿',
  },
  {
    term: 'Prompt Engineering (프롬프트 엔지니어링)',
    english: 'Prompt Engineering',
    def: 'AI에게 원하는 결과를 얻기 위해 프롬프트를 체계적으로 설계하는 기술',
  },
  {
    term: 'SREF (Style Reference)',
    english: 'Style Reference',
    def: 'Midjourney에서 특정 이미지의 스타일을 참조하는 파라미터',
  },
  {
    term: 'Style Weight (스타일 웨이트)',
    english: 'Style Weight',
    def: 'SREF 스타일의 강도를 조절하는 파라미터',
  },
  {
    term: 'Tag (태그)',
    english: 'Tag',
    def: '블록에 부여되는 키워드로 검색과 필터링에 사용',
  },
];

export default function GlossaryPage() {
  return (
    <DocsContent
      title="용어집"
      description="PromptBlocks와 프롬프트 엔지니어링 관련 용어를 정리합니다"
    >
      <DocSection title="용어 목록">
        <div className="space-y-4">
          {glossary.map((item) => (
            <div
              key={item.term}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <h3 className="font-semibold text-[var(--color-text-primary)]">{item.term}</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">{item.english}</p>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{item.def}</p>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection title="자주 쓰는 영어 용어">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="py-3 text-left font-semibold">영어</th>
                <th className="py-3 text-left font-semibold">한국어</th>
                <th className="py-3 text-left font-semibold">설명</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              <tr className="border-b border-[var(--color-border)]/50">
                <td className="py-2">Prompt</td>
                <td className="py-2">프롬프트</td>
                <td className="py-2">AI에게 주는 명령/설명 텍스트</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]/50">
                <td className="py-2">Seed</td>
                <td className="py-2">시드값</td>
                <td className="py-2">재현 가능한 결과를 위한 랜덤값</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]/50">
                <td className="py-2">Upscaling</td>
                <td className="py-2">업스케일링</td>
                <td className="py-2">이미지 해상도 향상</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]/50">
                <td className="py-2">Inference</td>
                <td className="py-2">추론</td>
                <td className="py-2">AI가 이미지를 생성하는 과정</td>
              </tr>
              <tr>
                <td className="py-2">Token</td>
                <td className="py-2">토큰</td>
                <td className="py-2">AI가 처리하는 텍스트 단위</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocSection>
    </DocsContent>
  );
}
