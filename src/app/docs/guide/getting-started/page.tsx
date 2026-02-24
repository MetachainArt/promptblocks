import {
  DocsContent,
  DocSection,
  DocSubsection,
  Tip,
  Warning,
} from '@/components/docs/DocsContent';
import Link from 'next/link';
import Image from 'next/image';

export default function GettingStartedPage() {
  return (
    <DocsContent
      title="PromptBlocks 시작하기"
      description="PromptBlocks의 핵심 개념과 효과적인 사용법을 알아봅니다"
    >
      <DocSection title="🎯 PromptBlocks란?">
        <p className="text-[var(--color-text-secondary)]">
          PromptBlocks는 다음과 같은 문제를 해결합니다:
        </p>
        <ul className="mt-4 list-inside list-disc space-y-2 text-[var(--color-text-secondary)]">
          <li>
            <strong>긴 프롬프트 관리</strong>: 복잡한 프롬프트를 의미 단위로 분해
          </li>
          <li>
            <strong>재사용성</strong>: 잘 작동하는 프롬프트 구성요소를 라이브러리화
          </li>
          <li>
            <strong>일관성</strong>: 캐릭터나 스타일의 일관된 결과물 생성
          </li>
          <li>
            <strong>협업</strong>: 팀 단위 프롬프트 자산 공유
          </li>
        </ul>
      </DocSection>

      <DocSection title="🧩 핵심 개념: 3단계 워크플로우">
        <div className="mt-4 rounded-lg border border-[var(--color-border)] overflow-hidden">
          <Image
            src="/images/app-assemble-with-blocks.png"
            alt="PromptBlocks 워크플로우"
            width={1200}
            height={800}
            className="w-full h-auto"
          />
        </div>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          블록을 조합하여 완성된 프롬프트를 만드는 Assemble 페이지
        </p>
        <div className="my-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center md:flex-row">
            <div className="rounded-lg bg-[var(--color-primary)]/10 px-6 py-4">
              <div className="font-bold text-[var(--color-primary)]">Decompose</div>
              <div className="text-sm text-[var(--color-text-secondary)]">분해</div>
            </div>
            <div className="text-2xl text-[var(--color-text-secondary)]">→</div>
            <div className="rounded-lg bg-[var(--color-primary)]/10 px-6 py-4">
              <div className="font-bold text-[var(--color-primary)]">Library</div>
              <div className="text-sm text-[var(--color-text-secondary)]">라이브러리</div>
            </div>
            <div className="text-2xl text-[var(--color-text-secondary)]">→</div>
            <div className="rounded-lg bg-[var(--color-primary)]/10 px-6 py-4">
              <div className="font-bold text-[var(--color-primary)]">Assemble</div>
              <div className="text-sm text-[var(--color-text-secondary)]">조립</div>
            </div>
          </div>
        </div>

        <DocSubsection title="1️⃣ Decompose (분해)">
          <p className="text-[var(--color-text-secondary)]">
            이미지나 텍스트를 13개의 구조적 블록으로 분해합니다.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="py-2 text-left font-semibold text-[var(--color-text-primary)]">
                    블록
                  </th>
                  <th className="py-2 text-left font-semibold text-[var(--color-text-primary)]">
                    설명
                  </th>
                  <th className="py-2 text-left font-semibold text-[var(--color-text-primary)]">
                    예시
                  </th>
                </tr>
              </thead>
              <tbody className="text-[var(--color-text-secondary)]">
                <tr className="border-b border-[var(--color-border)]/50">
                  <td className="py-2">주제 유형</td>
                  <td className="py-2">피사체 종류</td>
                  <td className="py-2">portrait, landscape</td>
                </tr>
                <tr className="border-b border-[var(--color-border)]/50">
                  <td className="py-2">스타일</td>
                  <td className="py-2">시각적 스타일</td>
                  <td className="py-2">photorealistic, anime</td>
                </tr>
                <tr className="border-b border-[var(--color-border)]/50">
                  <td className="py-2">인물 외형</td>
                  <td className="py-2">외모 특징</td>
                  <td className="py-2">long hair, blue eyes</td>
                </tr>
                <tr>
                  <td className="py-2" colSpan={3}>
                    <Link
                      href="/docs/reference/block-types"
                      className="text-[var(--color-primary)] hover:underline"
                    >
                      → 13개 블록 타입 전체 보기
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Tip>
            모든 이미지가 13개 블록을 모두 가지는 것은 아닙니다. 이미지에 따라 일부 블록은 비어있을
            수 있습니다.
          </Tip>
        </DocSubsection>

        <DocSubsection title="2️⃣ Library (라이브러리)">
          <p className="text-[var(--color-text-secondary)]">
            분핸된 블록을 저장하고 관리하는 공간입니다.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-[var(--color-background)] p-4">
              <h4 className="font-semibold text-[var(--color-text-primary)]">컬렉션</h4>
              <p className="text-sm text-[var(--color-text-secondary)]">블록을 주제별로 그룹화</p>
            </div>
            <div className="rounded-lg bg-[var(--color-background)] p-4">
              <h4 className="font-semibold text-[var(--color-text-primary)]">태그</h4>
              <p className="text-sm text-[var(--color-text-secondary)]">
                블록에 키워드 추가하여 검색 용이
              </p>
            </div>
            <div className="rounded-lg bg-[var(--color-background)] p-4">
              <h4 className="font-semibold text-[var(--color-text-primary)]">즐겨찾기</h4>
              <p className="text-sm text-[var(--color-text-secondary)]">자주 사용하는 블록 표시</p>
            </div>
            <div className="rounded-lg bg-[var(--color-background)] p-4">
              <h4 className="font-semibold text-[var(--color-text-primary)]">검색</h4>
              <p className="text-sm text-[var(--color-text-secondary)]">
                내용이나 태그로 빠르게 찾기
              </p>
            </div>
          </div>
        </DocSubsection>

        <DocSubsection title="3️⃣ Assemble (조립)">
          <p className="text-[var(--color-text-secondary)]">
            라이브러리의 블록을 조합하여 완성된 프롬프트를 만듭니다.
          </p>
          <ul className="mt-4 list-inside list-disc space-y-2 text-[var(--color-text-secondary)]">
            <li>
              <strong>드래그앤드롭</strong>: 블록 순서 변경
            </li>
            <li>
              <strong>잠금</strong>: 고정할 블록 보호 (무작위 교체 시 유지)
            </li>
            <li>
              <strong>무작위 조합</strong>: 선택된 범위 내에서 블록 랜덤 교체
            </li>
            <li>
              <strong>작가 스타일</strong>: 50+ 아티스트 스타일 적용
            </li>
            <li>
              <strong>Midjourney 파라미터</strong>: --sref, --sw 등 고급 설정
            </li>
          </ul>
        </DocSubsection>
      </DocSection>

      <DocSection title="🔄 실제 사용 시나리오">
        <DocSubsection title="시나리오 1: 이미지 분석 및 재생산">
          <p className="text-[var(--color-text-secondary)]">
            "Pinterest에서 본 이미지를 비슷하게 만들고 싶어요"
          </p>
          <ol className="mt-4 list-inside list-decimal space-y-2 text-[var(--color-text-secondary)]">
            <li>
              <strong>Decompose</strong>: 이미지 업로드 → AI가 13개 요소 분석
            </li>
            <li>
              <strong>Library</strong>: 분핸된 블록 중 유용한 것 저장
            </li>
            <li>
              <strong>Assemble</strong>: 저장한 블록 조합 + 스타일 추가
            </li>
            <li>
              <strong>Copy</strong>: 완성된 프롬프트를 Midjourney에 붙여넣기
            </li>
          </ol>
        </DocSubsection>

        <DocSubsection title="시나리오 2: 캐릭터 일관성 유지">
          <p className="text-[var(--color-text-secondary)]">
            "같은 캐릭터를 다른 상황에서 여러 장 만들고 싶어요"
          </p>
          <ol className="mt-4 list-inside list-decimal space-y-2 text-[var(--color-text-secondary)]">
            <li>
              <strong>Reference 설정</strong>: 기준이 될 캐릭터 이미지 분석
            </li>
            <li>
              <strong>얼굴 앵커 저장</strong>: "한국 여성, 긴 검은 머리, 갈색 눈" 등 저장
            </li>
            <li>
              <strong>블록 잠금</strong>: Subject Type, Appearance 블록 고정
            </li>
            <li>
              <strong>무작위 조합</strong>: 배경, 의상, 포즈만 변경하여 다양한 상황 생성
            </li>
          </ol>
        </DocSubsection>
      </DocSection>

      <DocSection title="💡 모범사례">
        <DocSubsection title="블록 저장 기준">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-emerald-600">✅ 저장하면 좋은 것</h4>
              <ul className="mt-2 list-inside list-disc text-sm text-[var(--color-text-secondary)]">
                <li>재사용 가능한 구성요소</li>
                <li>프로젝트별 핵심 스타일</li>
                <li>잘 작동하는 조합</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-600">❌ 저장하지 않아도 되는 것</h4>
              <ul className="mt-2 list-inside list-disc text-sm text-[var(--color-text-secondary)]">
                <li>한 번만 쓰이는 특정 상황</li>
                <li>테스트용 블록</li>
                <li>품질이 낮은 추출 결과</li>
              </ul>
            </div>
          </div>
        </DocSubsection>

        <DocSubsection title="효과적인 컬렉션 구성">
          <div className="rounded-lg bg-[var(--color-background)] p-4">
            <pre className="text-sm text-[var(--color-text-secondary)]">
              {`📁 프로젝트별
├── 📁 클라이언트 A 캠페인
├── 📁 남성복 브랜드
└── 📁 시즌 2024 Spring

📁 주제별
├── 📁 인물 초상화
├── 📁 제품 사진
├── 📁 풍경
└── 📁 추상적 이미지`}
            </pre>
          </div>
        </DocSubsection>

        <DocSubsection title="프롬프트 조립 팁">
          <p className="font-semibold text-[var(--color-text-primary)]">순서 중요성:</p>
          <ol className="mt-2 list-inside list-decimal text-[var(--color-text-secondary)]">
            <li>주제 유형 (누구/무엇인가)</li>
            <li>외형/의상 (어떤 모습인가)</li>
            <li>포즈/표정 (무엇을 하는가)</li>
            <li>배경/환경 (어디에서)</li>
            <li>조명/카메라 (어떻게 촬영)</li>
            <li>스타일/색감 (어떤 느낌)</li>
          </ol>
          <Tip>Midjourney 팁: 주제는 앞에, 스타일은 뒤에. 중요한 키워드는 ::weight로 강조.</Tip>
        </DocSubsection>
      </DocSection>

      <DocSection title="🚀 다음 단계">
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/docs/how-to/extract-from-image"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-primary)]"
          >
            <h3 className="font-semibold text-[var(--color-text-primary)]">
              이미지에서 프롬프트 추출하기
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">상세한 분석 가이드</p>
          </Link>
          <Link
            href="/docs/how-to/manage-library"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-primary)]"
          >
            <h3 className="font-semibold text-[var(--color-text-primary)]">
              블록 라이브러리 관리하기
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">효율적인 정리 방법</p>
          </Link>
        </div>
      </DocSection>
    </DocsContent>
  );
}
