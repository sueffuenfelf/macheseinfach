import type { HTMLAttributes, ReactNode } from 'react';

type BadgeTone = 'neutral' | 'accent' | 'success';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
    children: ReactNode;
    tone?: BadgeTone;
};

const toneClass: Record<BadgeTone, string> = {
    neutral: 'bg-[var(--color-border)] text-[var(--color-ink)]',
    accent: 'bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]',
    success: 'bg-[#dcfce7] text-[#166534]',
};

export function Badge({ children, tone = 'neutral', className = '', ...props }: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${toneClass[tone]} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
}
