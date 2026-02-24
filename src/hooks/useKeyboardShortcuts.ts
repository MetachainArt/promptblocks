import { useEffect, useCallback } from 'react';

export interface KeyboardShortcutsConfig {
  onDecompose?: () => void;
  onSave?: () => void;
  onCopy?: () => void;
  onCloseModal?: () => void;
  onShowHelp?: () => void;
  isModalOpen?: boolean;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea (except Escape)
      const target = e.target as HTMLElement;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        if (e.key !== 'Escape') return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + D: Decompose
      if (modifier && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        config.onDecompose?.();
      }

      // Ctrl/Cmd + S: Save
      if (modifier && e.key.toLowerCase() === 's') {
        e.preventDefault();
        config.onSave?.();
      }

      // Ctrl/Cmd + C: Copy (only if no text selected)
      if (modifier && e.key.toLowerCase() === 'c' && !window.getSelection()?.toString()) {
        e.preventDefault();
        config.onCopy?.();
      }

      // Escape: Close modal
      if (e.key === 'Escape' && config.isModalOpen) {
        config.onCloseModal?.();
      }

      // ?: Show help
      if (e.key === '?' && !config.isModalOpen) {
        e.preventDefault();
        config.onShowHelp?.();
      }
    },
    [config]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export const KEYBOARD_SHORTCUTS = [
  { key: 'Ctrl/Cmd + D', action: '분해 실행', page: 'Decompose' },
  { key: 'Ctrl/Cmd + S', action: '블록 저장', page: 'Decompose' },
  { key: 'Ctrl/Cmd + C', action: '프롬프트 복사', page: 'Assemble' },
  { key: 'Esc', action: '모달 닫기', page: '전체' },
  { key: '?', action: '단축키 도움말', page: '전체' },
];
