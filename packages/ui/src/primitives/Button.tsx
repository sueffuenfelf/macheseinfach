import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    children: ReactNode;
};

const variantClass: Record<ButtonVariant, string> = {
    primary:
        'bg-[var(--color-ink)] text-[var(--color-surface)] hover:bg-[#3a3a38] focus-visible:ring-[var(--color-accent)]',
    secondary:
        'bg-[var(--color-accent-soft)] text-[var(--color-ink)] border border-[var(--color-accent)] hover:bg-[var(--color-accent)] focus-visible:ring-[var(--color-accent-strong)]',
    ghost: 'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-border)] focus-visible:ring-[var(--color-ink-muted)]',
};

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
    return (
        <button
            type="button"
            className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 ${variantClass[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
