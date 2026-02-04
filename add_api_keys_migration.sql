-- PromptBlocks 스키마 업데이트
-- user_settings 테이블에 API 키 컬럼 추가
-- Supabase SQL Editor에서 실행하세요

-- API 키 컬럼 추가
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS openai_api_key TEXT,
ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;

-- 보안: RLS 정책은 이미 설정되어 있으므로 추가 설정 불필요
-- (사용자는 자신의 설정만 접근 가능)
