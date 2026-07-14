import type { InputHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    hint?: string;
};

export function Input({ label, hint, className = '', id, ...props }: InputProps) {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <label htmlFor={inputId} className="flex flex-col gap-1.5">
            {label ? (
                <span className="text-sm font-medium text-[var(--color-ink)]">{label}</span>
            ) : null}
            <input
                id={inputId}
                className={`rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus-visible:border-[var(--color-accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-soft)] ${className}`}
                {...props}
            />
            {hint ? <span className="text-xs text-[var(--color-ink-muted)]">{hint}</span> : null}
        </label>
    );
}
