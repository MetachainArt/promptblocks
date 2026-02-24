import { DocsContent, DocSection } from '@/components/docs/DocsContent';

const blockTypes = [
  {
    type: 'subject_type',
    name: '주제 유형',
    desc: '이미지의 주요 피사체 유형',
    examples: ['portrait of a woman', 'landscape scenery', 'product photography'],
    tip: '가장 기본이 되는 블록입니다. 인물, 풍경, 제품 등 큰 카테고리를 정의합니다.',
  },
  {
    type: 'style',
    name: '스타일',
    desc: '이미지의 시각적 스타일',
    examples: ['photorealistic', 'anime style', 'oil painting', 'watercolor illustration'],
    tip: '전체적인 느낌을 결정합니다. Midjourney의 --sref와 함께 사용하면 효과적입니다.',
  },
  {
    type: 'appearance',
    name: '인물 외형',
    desc: '인물의 외모적 특징',
    examples: ['long black hair', 'blue eyes', 'freckles across cheeks', 'muscular build'],
    tip: '캐릭터 일관성 유지에 필수적인 블록입니다. 구체적일수록 좋습니다.',
  },
  {
    type: 'outfit',
    name: '의상',
    desc: '착용한 의상과 액세서리',
    examples: ['white summer dress', 'business suit with tie', 'traditional hanbok'],
    tip: '스타일 전환 시 이 블록만 변경하면 같은 인물에 다양한 룩을 줄 수 있습니다.',
  },
  {
    type: 'pose_expression',
    name: '포즈/표정',
    desc: '자세와 감정 표현',
    examples: ['sitting on a bench', 'smiling warmly', 'looking over shoulder'],
    tip: '캐릭터의 성격과 상황을 전달합니다. 동적인 포즈는 생동감을 줍니다.',
  },
  {
    type: 'props_objects',
    name: '소품/오브젝트',
    desc: '함께 등장하는 소품과 오브젝트',
    examples: ['holding a book', 'vintage camera on table', 'cup of coffee'],
    tip: '스토리텔링에 중요합니다. 무작위 조합 시 재미있는 조합이 나옵니다.',
  },
  {
    type: 'background_environment',
    name: '배경/환경',
    desc: '배경 환경 설정',
    examples: ['cozy coffee shop interior', 'busy city street', 'serene mountain lake'],
    tip: '전체적인 분위기를 좌우합니다. 인물 블록과 조합해 다양한 상황 연출.',
  },
  {
    type: 'lighting',
    name: '조명',
    desc: '조명 설정과 빛의 특성',
    examples: ['golden hour sunlight', 'soft studio lighting', 'dramatic side light'],
    tip: '분위기 결정의 핵심입니다. Rembrandt lighting, butterfly lighting 등 전문 용어 활용.',
  },
  {
    type: 'camera_lens',
    name: '칩처/렌즈',
    desc: '촬영 기법과 장비 설정',
    examples: ['85mm lens portrait', 'wide angle shot', 'shallow depth of field'],
    tip: '전문적인 느낌을 줍니다. focal length와 aperture 명시 시 효과적.',
  },
  {
    type: 'color_mood',
    name: '색감/분위기',
    desc: '색감과 전체적인 분위기',
    examples: ['warm earthy tones', 'cool blue palette', 'cinematic color grading'],
    tip: '색온도와 채도를 조절합니다. warm/cool contrast 활용.',
  },
  {
    type: 'text_in_image',
    name: '이미지 내 텍스트',
    desc: '이미지에 포함될 텍스트나 타이포그래피',
    examples: ['neon sign "OPEN"', 'handwritten letter', 'vintage poster text'],
    tip: '주의해서 사용하세요. AI 텍스트 생성은 아직 불완전할 수 있습니다.',
  },
  {
    type: 'composition',
    name: '구도',
    desc: '화면 구도와 배치',
    examples: ['rule of thirds', 'centered composition', 'leading lines'],
    tip: '시각적 균형을 잡습니다. 전통적인 구도법 용어 활용.',
  },
  {
    type: 'tech_params',
    name: '기술 파라미터',
    desc: '기술적 설정과 출력 옵션',
    examples: ['8k resolution', 'highly detailed', 'octane render', 'sharp focus'],
    tip: '최종 품질에 영향을 줍니다. Midjourney의 --q, --hd 등과 유사한 역할.',
  },
];

export default function BlockTypesPage() {
  return (
    <DocsContent
      title="13개 블록 타입"
      description="PromptBlocks의 13개 블록 타입에 대한 상세 설명"
    >
      <DocSection title="블록 타입 목록">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="py-3 text-left font-semibold">블록 타입</th>
                <th className="py-3 text-left font-semibold">한글명</th>
                <th className="py-3 text-left font-semibold">주요 용도</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              {blockTypes.map((block) => (
                <tr key={block.type} className="border-b border-[var(--color-border)]/50">
                  <td className="py-3 font-mono text-xs">{block.type}</td>
                  <td className="py-3 font-medium text-[var(--color-text-primary)]">
                    {block.name}
                  </td>
                  <td className="py-3">{block.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection title="상세 설명">
        <div className="space-y-6">
          {blockTypes.map((block, index) => (
            <div
              key={block.type}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-sm font-bold text-[var(--color-primary)]">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)]">{block.name}</h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">{block.type}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{block.desc}</p>
              <div className="mt-3">
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                  예시:
                </span>
                <ul className="mt-1 list-inside list-disc text-sm text-[var(--color-text-secondary)]">
                  {block.examples.map((example, i) => (
                    <li key={i}>{example}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 rounded bg-[var(--color-background)] p-2 text-xs text-[var(--color-text-secondary)]">
                <strong>💡 팁:</strong> {block.tip}
              </div>
            </div>
          ))}
        </div>
      </DocSection>
    </DocsContent>
  );
}
