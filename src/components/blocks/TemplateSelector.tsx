'use client';

import { useState } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { TEMPLATES, type Template } from '@/lib/templates';
import { BLOCK_TYPE_LABELS } from '@/types';

interface TemplateSelectorProps {
  onSelect: (template: Template) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      setIsOpen(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setIsOpen(true)} className="gap-2">
        <Sparkles className="h-4 w-4" />
        추천 템플릿
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSelectedTemplate(null);
        }}
        title="추천 블록 조립 템플릿"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            목적에 맞는 템플릿을 선택하면, 해당 블록 타입 구조가 자동으로 설정됩니다.
          </p>

          {/* 템플릿 목록 */}
          <div className="grid max-h-[400px] gap-3 overflow-y-auto">
            {TEMPLATES.map((template) => (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`cursor-pointer rounded-lg border p-4 transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 ring-2 ring-[var(--color-primary)]/20'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/50'
                } `}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[var(--color-text-primary)]">
                      {template.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
                      {template.description}
                    </p>

                    {/* 블록 타입 태그 */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {template.blockTypes.map((type) => (
                        <span
                          key={type}
                          className="inline-block rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs text-[var(--color-primary)]"
                        >
                          {BLOCK_TYPE_LABELS[type]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-5 w-5 text-[var(--color-text-secondary)] transition-transform ${
                      selectedTemplate?.id === template.id ? 'rotate-90' : ''
                    }`}
                  />
                </div>

                {/* 선택 시 예시 프롬프트 표시 */}
                {selectedTemplate?.id === template.id && (
                  <div className="mt-3 border-t border-[var(--color-border)] pt-3">
                    <p className="mb-1 text-xs text-[var(--color-text-secondary)]">
                      예시 프롬프트:
                    </p>
                    <p className="text-sm text-[var(--color-text-primary)] italic">
                      &quot;{template.examplePrompt}&quot;
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsOpen(false);
                setSelectedTemplate(null);
              }}
            >
              취소
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedTemplate}>
              이 템플릿으로 시작
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
