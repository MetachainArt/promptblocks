// 공통 유틸리티 함수 (블록, 컬렉션, 설정 등에서 공유)
import { createClient } from '@/lib/supabase/client';

/**
 * 현재 로그인한 사용자 ID를 반환합니다.
 * 비로그인 시 null을 반환합니다.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Supabase snake_case 행을 camelCase 객체로 변환합니다.
 * 매핑 규칙을 전달하면 해당 규칙에 따라 변환합니다.
 */
export function snakeToCamel<T>(
  row: Record<string, unknown>,
  mapping: Record<string, string>
): T {
  const result: Record<string, unknown> = {};
  for (const [snakeKey, camelKey] of Object.entries(mapping)) {
    result[camelKey] = row[snakeKey];
  }
  return result as T;
}

/**
 * camelCase 객체를 Supabase snake_case로 변환합니다.
 * 매핑 규칙을 전달하면 해당 규칙에 따라 변환합니다.
 */
export function camelToSnake(
  obj: Record<string, unknown>,
  mapping: Record<string, string>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [camelKey, snakeKey] of Object.entries(mapping)) {
    if (obj[camelKey] !== undefined) {
      result[snakeKey] = obj[camelKey];
    }
  }
  return result;
}
