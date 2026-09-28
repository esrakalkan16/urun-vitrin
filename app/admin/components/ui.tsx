'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { IconArrowLeft } from '@/app/components/icons';

/* ───────────── Sayfa başlığı ───────────── */

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
          >
            <IconArrowLeft className="h-4 w-4" />
            {back.label}
          </Link>
        )}
        <h1 className="font-display text-gradient text-3xl font-semibold md:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/* ───────────── Bölüm kartı (başlık solda, içerik sağda) ───────────── */

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card grid gap-6 p-5 md:grid-cols-[220px_1fr] md:gap-10 md:p-8">
      <div>
        <h2 className="text-base font-medium text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/* ───────────── Bildirimler ───────────── */

type Toast = { id: number; message: string; tone: 'success' | 'error' };

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}

export function ToastViewport({ toasts }: { toasts: Toast[] }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.tone === 'error' ? 'alert' : 'status'}
          className={`pointer-events-auto max-w-sm rounded-xl px-4 py-3 text-sm shadow-lg ${
            t.tone === 'success' ? 'glass text-ink' : 'btn-danger'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ───────────── İki adımlı onay butonu (confirm() yerine) ───────────── */

export function ConfirmButton({
  children,
  confirmLabel,
  onConfirm,
  className,
  confirmClassName,
  disabled,
  title,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  confirmLabel: React.ReactNode;
  onConfirm: () => void;
  className: string;
  confirmClassName: string;
  disabled?: boolean;
  title?: string;
  'aria-label'?: string;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3500);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      aria-label={armed ? undefined : ariaLabel}
      onBlur={() => setArmed(false)}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else {
          setArmed(true);
        }
      }}
      className={armed ? confirmClassName : className}
    >
      {armed ? confirmLabel : children}
    </button>
  );
}

/* ───────────── Boş durum ───────────── */

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card px-6 py-16 text-center">
      <p className="font-display text-xl font-semibold text-ink">{title}</p>
      {text && <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="card divide-y divide-line" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <div className="skeleton h-14 w-14 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-3 w-1/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
