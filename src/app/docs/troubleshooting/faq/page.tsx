import { DocsContent, DocSection } from '@/components/docs/DocsContent';

const faqs = [
  {
    q: 'PromptBlocks는 어떤 AI 이미지 생성 도구와 함께 사용하나요?',
    a: 'Midjourney, DALL-E 3, Stable Diffusion 등 텍스트 기반 이미지 생성 AI 모두와 함께 사용할 수 있습니다. PromptBlocks는 프롬프트를 체계적으로 관리하는 도구로, 어떤 AI 도구를 사용하든 완성된 프롬프트를 복사해서 사용하기만 하면 됩니다.',
  },
  {
    q: '묣로 사용할 수 있나요?',
    a: '네, 묣 플랜으로 시작할 수 있습니다. 묣 플랜에서는 월 20회 이미지/텍스트 분해, 최대 50개 블록 저장, 기본 기능 모두 사용 가능합니다. 더 많은 사용량이 필요하시면 Pro 플랜으로 업그레이드하세요.',
  },
  {
    q: 'API 키는 어디서 설정하나요?',
    a: '좌측 메뉴의 설정 페이지에서 OpenAI(GPT) 또는 Google Gemini API 키를 입력할 수 있습니다. API 키는 브라우저의 로컬 스토리지에 안전하게 저장되며, 서버에는 저장되지 않습니다.',
  },
  {
    q: '비로그인 상태에서도 사용할 수 있나요?',
    a: '네, 비로그인 상태에서도 블록과 프리셋을 localStorage에 저장하여 사용할 수 있습니다. 다만 브라우저 데이터를 삭제하면 저장된 내용이 사라지므로, 중요한 데이터는 로그인하여 클라우드에 저장하시는 것을 권장합니다.',
  },
  {
    q: '분석 결과가 부정확해요. 어떻게 개선할 수 있나요?',
    a: '1) 더 나은 이미지 사용: 선명하고 복잡하지 않은 이미지 선택 2) 수동 편집: 분핸된 블록 내용을 직접 수정 3) 다른 AI 모델 시도: GPT와 Gemini 중 다른 모델로 테스트 4) 텍스트 모드 사용: 이미지 대신 텍스트로 직접 입력',
  },
  {
    q: '배치 분석은 어떻게 하나요?',
    a: 'Decompose 페이지에서 여러 이미지를 동시에 업로드할 수 있습니다 (최대 5개). 각 이미지는 순차적으로 분석되며, 진행 상태를 실시간으로 확인할 수 있습니다.',
  },
  {
    q: '무작위(randomize) 기능은 어떻게 작동하나요?',
    a: '무작위 버튼을 클릭하면: 1) 잠금되지 않은 블록만 대상이 됩니다 2) 선택된 컬렉션 범위 내에서만 후보가 선택됩니다 3) 같은 블록 타입 내에서만 교첸됩니다.',
  },
  {
    q: '프리셋과 스냅샷의 차이는 무엇인가요?',
    a: '프리셋은 재사용 가능한 블록 조합 템플릿으로, 이름을 붙여 저장하고 나중에 불러올 수 있습니다. 스냅샷은 특정 시점의 조립 상태를 저장하여 히스토리처럼 사용하며, 과거 상태로 되돌아갈 수 있습니다.',
  },
];

export default function FAQPage() {
  return (
    <DocsContent
      title="자주 묻는 질문 (FAQ)"
      description="PromptBlocks 사용 중 자주 묻는 질문과 답변"
    >
      <DocSection title="일반 질문">
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <h3 className="font-semibold text-[var(--color-text-primary)]">Q: {faq.q}</h3>
              <p className="mt-2 text-[var(--color-text-secondary)]">A: {faq.a}</p>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection title="추가 지원">
        <p className="text-[var(--color-text-secondary)]">
          더 많은 질문이 있으신가요? 카카오톡 오픈채팅으로 문의해주세요.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <a
            href="https://open.kakao.com/o/sSPHn33g"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-primary)] hover:underline"
          >
            키보드 단축키 문의
          </a>
          <a
            href="https://open.kakao.com/o/sSPHn33g"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-primary)] hover:underline"
          >
            그 외 모든 문의 (PromptBlocks 오픈톡)
          </a>
        </div>
      </DocSection>
    </DocsContent>
  );
}
