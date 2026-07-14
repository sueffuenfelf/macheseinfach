import type { HTMLAttributes, ReactNode } from 'react';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
    children: ReactNode;
    padded?: boolean;
};

export function Card({ children, padded = true, className = '', ...props }: CardProps) {
    return (
        <div
            className={`rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] ${padded ? 'p-5' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
