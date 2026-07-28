import type { ReactNode } from 'react';

export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
    return (
        <label
            htmlFor={htmlFor}
            className="mb-1 block font-display text-[12px] font-bold uppercase tracking-[0.05em]"
        >
            {children}
        </label>
    );
}

export function FieldHint({ children }: { children: ReactNode }) {
    return <p className="mt-1 text-[12.5px] text-[var(--color-ink-soft)]">{children}</p>;
}

export function FieldError({ children }: { children: ReactNode }) {
    return (
        <p className="mt-1 text-[12.5px] font-semibold text-[var(--color-danger-ink)]">
            {children}
        </p>
    );
}
