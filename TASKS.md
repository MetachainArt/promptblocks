# PromptBlocks 병행 작업 계획

## 개요

- 기능 업그레이드 + 사용설명서 작성 병행
- 총 예상 소요시간: 4-6시간
- 작업 단위: 독립적 태스크로 분할하여 병렬 처리

---

## 파트 A: 기능 업그레이드

### A1. 배치 분석 기능 (Batch Decompose)

**담당**: backend-specialist + frontend-specialist
**예상시간**: 2시간
**의존성**: 없음

**작업 내용**:

1. [ ] API 엔드포인트 `/api/batch-decompose` 생성
2. [ ] 여러 이미지 동시 업로드 UI (최대 5개)
3. [ ] 배치 진행 상태 표시 (progress indicator)
4. [ ] 결과 일괯 저장 기능

**파일 수정**:

- `src/app/api/batch-decompose/route.ts` (신규)
- `src/app/(dashboard)/decompose/page.tsx` (수정)
- `src/lib/batchDecompose.ts` (신규)

---

### A2. 블록 태그 필터링

**담당**: frontend-specialist
**예상시간**: 1시간
**의존성**: 없음

**작업 내용**:

1. [ ] Library 페이지에 태그 클라우드 추가
2. [ ] 태그 기반 필터링 기능
3. [ ] 인기 태그 자동 추출

**파일 수정**:

- `src/app/(dashboard)/library/page.tsx` (수정)
- `src/lib/blocks.ts` - getPopularTags() 추가

---

### A3. A/B 테스트 (프롬프트 비교)

**담당**: frontend-specialist
**예상시간**: 1.5시간
**의존성**: 없음

**작업 내용**:

1. [ ] Assemble 페이지에 A/B 모드 추가
2. [ ] 두 개 프롬프트 저장/비교 UI
3. [ ] 차이점 하이라이트 표시

**파일 수정**:

- `src/app/(dashboard)/assemble/page.tsx` (수정)
- `src/lib/abTest.ts` (신규)

---

### A4. 키보드 단축키

**담당**: frontend-specialist
**예상시간**: 1시간
**의존성**: 없음

**작업 내용**:

1. [ ] 단축키 매니저 훅 생성
2. [ ] 주요 작업 단축키 구현
   - Ctrl/Cmd + D: 분해 실행
   - Ctrl/Cmd + S: 블록 저장
   - Ctrl/Cmd + C: 프롬프트 복사
   - ESC: 모달 닫기
3. [ ] 단축키 도움말 모달

**파일 수정**:

- `src/hooks/useKeyboardShortcuts.ts` (신규)
- `src/app/(dashboard)/layout.tsx` (수정)
- `src/components/KeyboardShortcutsHelp.tsx` (신규)

---

## 파트 B: 사용설명서 작성

### B1. 문서 인프라 설정

**담당**: Sisyphus (메인)
**예상시간**: 30분
**의존성**: 없음

**작업 내용**:

1. [ ] docs/ 디렉토리 구조 생성
2. [ ] Markdown 템플릿 설정
3. [ ] README.md 업데이트

**파일 생성**:

- `docs/README.md`
- `docs/structure.md`
- `docs/.vitepress/config.ts` (선택사항)

---

### B2. 퀵스타트 가이드

**담당**: writing-specialist
**예상시간**: 1시간
**의존성**: B1 완료

**작업 내용**:

1. [ ] 1분 둘러보기
2. [ ] 첫 프롬프트 만들기 (Step-by-Step)
3. [ ] 핵심 개념 설명 (분해→라이브러리→조립)

**파일 생성**:

- `docs/guide/quickstart.md`
- `docs/guide/getting-started.md`

---

### B3. How-To 가이드

**담당**: writing-specialist
**예상시간**: 2시간
**의존성**: B1 완료

**작업 내용**:

1. [ ] 이미지에서 프롬프트 추출하기
2. [ ] 블록 라이브러리 관리하기
3. [ ] 효과적인 프롬프트 조립하기
4. [ ] 얼굴 일관성 유지하기
5. [ ] Midjourney 파라미터 사용하기
6. [ ] 프리셋 저장하고 공유하기

**파일 생성**:

- `docs/how-to/extract-from-image.md`
- `docs/how-to/manage-library.md`
- `docs/how-to/assemble-prompt.md`
- `docs/how-to/face-consistency.md`
- `docs/how-to/midjourney-params.md`
- `docs/how-to/save-share-presets.md`

---

### B4. 참조 문서

**담당**: Sisyphus (메인)
**예상시간**: 1시간
**의존성**: B1 완료

**작업 내용**:

1. [ ] 13개 블록 타입 설명표
2. [ ] 작가 스타일 목록
3. [ ] 키보드 단축키 목록
4. [ ] 용어집

**파일 생성**:

- `docs/reference/block-types.md`
- `docs/reference/artist-styles.md`
- `docs/reference/keyboard-shortcuts.md`
- `docs/reference/glossary.md`

---

### B5. 트러블슈팅 & FAQ

**담당**: writing-specialist
**예상시간**: 30분
**의존성**: B2, B3 완료

**작업 내용**:

1. [ ] 자주 묻는 질문 (FAQ)
2. [ ] 오류 메시지 해결법
3. [ ] 지원 연락처

**파일 생성**:

- `docs/troubleshooting/faq.md`
- `docs/troubleshooting/errors.md`

---

## 실행 순서

```
[시작]
  │
  ├──► 파트 A 태스크 (A1, A2, A3, A4) ──► 병렬 실행
  │                                      │
  ├──► 파트 B1 (인프라) ─────────────────► 선행
  │                                      │
  ├──► 파트 B2, B3, B4 (내용) ──────────► B1 완료 후 병렬
  │                                      │
  ├──► 파트 B5 (FAQ) ───────────────────► B2, B3 완료 후
  │                                      │
  ▼
[검증 및 통합]
```

---

## 검증 체크리스트

### 기능 업그레이드

- [ ] 배치 분석이 5개 이미지까지 동작
- [ ] 태그 필터링이 실시간으로 동작
- [ ] A/B 테스트가 두 프롬프트 저장/비교 가능
- [ ] 단축키가 모든 주요 브라우저에서 동작

### 문서

- [ ] 모든 Markdown 파일이 유효한 문법
- [ ] 이미지 경로가 올바르게 설정
- [ ] 한국어/영어 구분 명확
- [ ] 목차와 링크가 정상 작동

---

## 파일 구조 (예상)

```
promptblocks/
├── docs/
│   ├── README.md
│   ├── guide/
│   │   ├── quickstart.md
│   │   └── getting-started.md
│   ├── how-to/
│   │   ├── extract-from-image.md
│   │   ├── manage-library.md
│   │   ├── assemble-prompt.md
│   │   ├── face-consistency.md
│   │   ├── midjourney-params.md
│   │   └── save-share-presets.md
│   ├── reference/
│   │   ├── block-types.md
│   │   ├── artist-styles.md
│   │   ├── keyboard-shortcuts.md
│   │   └── glossary.md
│   └── troubleshooting/
│       ├── faq.md
│       └── errors.md
├── src/
│   ├── app/api/batch-decompose/
│   │   └── route.ts
│   ├── hooks/
│   │   └── useKeyboardShortcuts.ts
│   ├── lib/
│   │   ├── batchDecompose.ts
│   │   └── abTest.ts
│   └── components/
│       └── KeyboardShortcutsHelp.tsx
```
