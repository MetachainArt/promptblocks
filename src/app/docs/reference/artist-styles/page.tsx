import { DocsContent, DocSection } from '@/components/docs/DocsContent';

const artistCategories = [
  {
    category: '📷 Photographer',
    artists: [
      {
        name: 'Annie Leibovitz',
        style: '드라마틱한 조명, 유명인 초상화',
        bestFor: '고급스러운 인물 사진',
      },
      { name: 'Helmut Newton', style: '대비가 강한 흑백, 패션', bestFor: '패션/에디터리얼' },
      { name: 'Peter Lindbergh', style: '자연스러운 미학, 미니멀', bestFor: '내추럴 뷰티' },
      { name: 'Richard Avedon', style: '심플한 배경, 강렬한 인상', bestFor: '클래식 초상화' },
      { name: 'Tim Walker', style: '환상적, 동화적인', bestFor: '환상적 컨셉' },
    ],
  },
  {
    category: '🎨 Illustrator',
    artists: [
      { name: 'Hayao Miyazaki', style: '지브리, 따뜻한', bestFor: '판타지/어드벤처' },
      { name: 'James Jean', style: '미묘한, 꿈같은', bestFor: '아트/컨셉' },
      { name: 'WLOP', style: '게임 아트, 아름다운', bestFor: '판타지 캐릭터' },
      { name: 'Ross Tran', style: '극적인 조명, 색채', bestFor: '다이나믹 아트' },
    ],
  },
  {
    category: '🌸 Anime',
    artists: [
      { name: 'Makoto Shinkai', style: '신카이 마코토, 빛/하늘', bestFor: '로맨스/풍경' },
      { name: 'Mamoru Hosoda', style: '호소다 마모루, 따뜻한', bestFor: '가족/성장' },
      { name: 'Ilya Kuvshinov', style: '일러스트, 세련된', bestFor: '현대 캐릭터' },
    ],
  },
];

export default function ArtistStylesPage() {
  return (
    <DocsContent
      title="작가 스타일 목록"
      description="PromptBlocks에서 사용 가능한 스타일 아티스트 목록"
    >
      {artistCategories.map((category) => (
        <DocSection key={category.category} title={category.category}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="py-3 text-left font-semibold">작가명</th>
                  <th className="py-3 text-left font-semibold">스타일 설명</th>
                  <th className="py-3 text-left font-semibold">추천 사용처</th>
                </tr>
              </thead>
              <tbody className="text-[var(--color-text-secondary)]">
                {category.artists.map((artist) => (
                  <tr key={artist.name} className="border-b border-[var(--color-border)]/50">
                    <td className="py-3 font-medium text-[var(--color-text-primary)]">
                      {artist.name}
                    </td>
                    <td className="py-3">{artist.style}</td>
                    <td className="py-3">{artist.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocSection>
      ))}

      <DocSection title="사용 팁">
        <ul className="list-inside list-disc space-y-2 text-[var(--color-text-secondary)]">
          <li>
            <strong>단일 작가:</strong> 한 명의 스타일을 명확하게
          </li>
          <li>
            <strong>혼합:</strong> 2-3명의 작가 스타일 조합 (예: &quot;by Hayao Miyazaki and James
            Jean&quot;)
          </li>
          <li>
            <strong>시대별:</strong> 클래식 + 현대 조합
          </li>
        </ul>
      </DocSection>
    </DocsContent>
  );
}
