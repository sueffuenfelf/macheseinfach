import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { usePlatformNav } from '../../routing/usePlatformNav';

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

/** Einheitlicher Zurück-Button — `history.back()` mit Fallback (siehe `usePlatformNav`). */
export function BackButton({ className = '' }: { className?: string }) {
    const { goBack } = usePlatformNav();

    return (
        <button
            type="button"
            onClick={goBack}
            className={`ms-focus inline-flex items-center gap-2 rounded-[8px] border-2 border-black bg-white px-3 py-2 font-display text-[14px] font-semibold shadow-[2px_2px_0_#000] transition hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#000] ${className}`.trim()}
        >
            <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                aria-hidden
            >
                <path d="M15 5l-7 7 7 7" />
            </svg>
            Zurück
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

type SectionLabelProps = {
    children: ReactNode;
    className?: string;
};

export function SectionLabel({ children, className = '' }: SectionLabelProps) {
    return (
        <p
            className={`font-display text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--color-ink-muted)] ${className}`.trim()}
        >
            {children}
        </p>
    );
}
