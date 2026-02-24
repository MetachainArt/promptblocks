// This component renders markdown-like content as formatted JSX
// Since we're using Next.js without react-markdown, we format the content directly

interface DocsContentProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function DocsContent({ title, description, children }: DocsContentProps) {
  return (
    <article className="prose prose-slate max-w-none">
      {/* Header */}
      <header className="not-prose mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-lg text-[var(--color-text-secondary)]">{description}</p>
        )}
      </header>

      {/* Content */}
      <div className="docs-content">{children}</div>
    </article>
  );
}

// Helper components for doc formatting
export function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function DocSubsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function DocStep({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white">
        {number}
      </div>
      <div>
        <h4 className="font-semibold text-[var(--color-text-primary)]">{title}</h4>
        <div className="mt-2 text-[var(--color-text-secondary)]">{children}</div>
      </div>
    </div>
  );
}

export function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-lg border-l-4 border-blue-500 bg-blue-500/10 p-4">
      <div className="flex items-center gap-2 font-semibold text-blue-600">
        <span>💡</span> 팁
      </div>
      <div className="mt-2 text-[var(--color-text-secondary)]">{children}</div>
    </div>
  );
}

export function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-lg border-l-4 border-amber-500 bg-amber-500/10 p-4">
      <div className="flex items-center gap-2 font-semibold text-amber-600">
        <span>⚠️</span> 주의
      </div>
      <div className="mt-2 text-[var(--color-text-secondary)]">{children}</div>
    </div>
  );
}

export function Info({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-lg border-l-4 border-emerald-500 bg-emerald-500/10 p-4">
      <div className="flex items-center gap-2 font-semibold text-emerald-600">
        <span>ℹ️</span> 참고
      </div>
      <div className="mt-2 text-[var(--color-text-secondary)]">{children}</div>
    </div>
  );
}
