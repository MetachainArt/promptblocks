# 문서 구조 가이드

## 디렉토리 구조

```
docs/
├── README.md              # 문서 홈 (한국어)
├── guide/                 # 시작 가이드
│   ├── quickstart.md     # 퀵스타트
│   └── getting-started.md # 기본 개념
├── how-to/               # 작업별 가이드
│   ├── extract-from-image.md
│   ├── manage-library.md
│   ├── assemble-prompt.md
│   ├── face-consistency.md
│   ├── midjourney-params.md
│   └── save-share-presets.md
├── reference/            # 참조 문서
│   ├── block-types.md
│   ├── artist-styles.md
│   ├── keyboard-shortcuts.md
│   └── glossary.md
├── troubleshooting/      # 문제 해결
│   ├── faq.md
│   └── errors.md
└── assets/              # 이미지, 첨부파일
    └── images/
```

## Markdown 작성 규칙

### 1. 헤딩 구조

- `#` - 페이지 제목 (한 번만)
- `##` - 주요 섹션
- `###` - 하위 섹션
- `####` - 세부 항목

### 2. 링크 형식

```markdown
[링크 텍스트](./파일명.md)
[외부 링크](https://example.com)
```

### 3. 이미지 삽입

```markdown
![설명](./assets/images/이미지명.png)
```

### 4. 단계별 안내

```markdown
1. 첫 번째 단계
2. 두 번째 단계
   - 세부 항목
   - 세부 항목
3. 세 번째 단계
```

### 5. 팁/주의사항

```markdown
> 💡 **팁**: 유용한 조언

> ⚠️ **주의**: 주의해야 할 사항

> 🚨 **중요**: 반드시 지켜야 할 사항
```

### 6. 코드 블록

````markdown
```typescript
// TypeScript 코드
const example = 'Hello';
```

```bash
# 터미널 명령어
npm run dev
```
````

### 7. 표

```markdown
| 컬럼1 | 컬럼2 | 컬럼3 |
| ----- | ----- | ----- |
| 값1   | 값2   | 값3   |
| 값4   | 값5   | 값6   |
```

## 작성 스타일

1. **명확한 제목**: "어떻게 ~하는가" 형식 사용
2. **단계별 설명**: 숫자로 순서 명시
3. **스크린샷**: 중요한 UI 단계마다 포함
4. **실제 예시**: 이론보다 실제 사용 예시
5. **검색 가능한 키워드**: 주요 용어 포함

## 번역 가이드

- 한국어 원본 작성
- 영어는 별도 `/en/` 디렉토리에 동일 구조로 작성
- 문화적 차이 고려 (예: "이메일" vs "Email")
