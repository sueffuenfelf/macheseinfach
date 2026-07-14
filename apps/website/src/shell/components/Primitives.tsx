import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

type BrutalButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
};

export function BrutalButton({ className = '', children, ...props }: BrutalButtonProps) {
    return (
        <button type="button" className={`ms-btn ms-focus ${className}`.trim()} {...props}>
            {children}
        </button>
    );
}

type BrutalInputProps = InputHTMLAttributes<HTMLInputElement>;

export function BrutalInput({ className = '', ...props }: BrutalInputProps) {
    return <input className={`ms-input ms-focus ${className}`.trim()} {...props} />;
}

type BadgeProps = {
    children: ReactNode;
    className?: string;
};

export function Badge({ children, className = '' }: BadgeProps) {
    return <span className={`ms-badge ${className}`.trim()}>{children}</span>;
}

export function TrustBadge({ label = 'Lokal · kein Konto' }: { label?: string } = {}) {
    return (
        <span className="ms-badge border-2 border-black bg-[var(--color-success)] text-[11px] font-semibold tracking-[0.01em]">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 1 1 8 0v3" />
            </svg>
            {label}
        </span>
    );
}

type SectionLabelProps = {
    children: ReactNode;
    className?: string;
};

export function SectionLabel({ children, className = '' }: SectionLabelProps) {
    return (
        <p className={`font-display text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--color-ink-muted)] ${className}`.trim()}>
            {children}
        </p>
    );
}
