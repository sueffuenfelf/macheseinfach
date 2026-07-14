import { useMemo, useState, type ReactNode } from 'react';

type ResultTone = 'success' | 'warn' | 'danger' | 'info';

const RESULT_TONES: Record<ResultTone, string> = {
    success: 'var(--color-success)',
    warn: 'var(--color-warn)',
    danger: 'var(--color-danger)',
    info: 'var(--color-info)',
};

type ResultCardProps = {
    tone: ResultTone;
    heading?: ReactNode;
    children: ReactNode;
};

export function ResultCard({ tone, heading, children }: ResultCardProps) {
    return (
        <section
            className="ms-animate-pop rounded-xl border-2 border-black p-4 shadow-brutal-lg md:p-5"
            style={{ background: RESULT_TONES[tone] }}
        >
            {heading ? (
                <h3 className="mb-2 font-display text-[20px] leading-tight font-bold tracking-[-0.02em]">
                    {heading}
                </h3>
            ) : null}
            <div className="space-y-3">{children}</div>
        </section>
    );
}

type InfoGridItem = {
    label: string;
    value: ReactNode;
};

export function InfoGrid({ items }: { items: InfoGridItem[] }) {
    return (
        <div className="grid gap-2 sm:grid-cols-2">
            {items.map((item) => (
                <div key={item.label} className="rounded-md border-2 border-black bg-white p-3">
                    <p className="font-display text-[11px] font-bold tracking-[0.05em] uppercase text-[var(--color-ink-soft)]">
                        {item.label}
                    </p>
                    <p className="mt-1 text-[14px] leading-tight">{item.value}</p>
                </div>
            ))}
        </div>
    );
}

export function ProgressBar({ value, max = 1 }: { value: number; max?: number }) {
    const ratio = useMemo(() => {
        const safeMax = max <= 0 ? 1 : max;
        const clamped = Math.max(0, Math.min(value / safeMax, 1));
        return clamped;
    }, [max, value]);

    return (
        <div className="h-6 overflow-hidden rounded-[999px] border-2 border-black bg-white">
            <div
                className="ms-progress-stripes h-full bg-black transition-[width] duration-200"
                style={{ width: `${ratio * 100}%` }}
                aria-hidden="true"
            />
        </div>
    );
}

export function StateHint({ children }: { children: ReactNode }) {
    return (
        <p className="inline-flex items-center gap-2 text-[12.5px] text-[var(--color-ink-soft)]">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="#000" strokeWidth="2.2">
                <rect x="4" y="11" width="16" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 118 0v3" />
            </svg>
            <span>{children}</span>
        </p>
    );
}
