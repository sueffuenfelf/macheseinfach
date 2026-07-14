import type { HTMLAttributes, ReactNode } from 'react';

type TextVariant = 'display' | 'title' | 'body' | 'caption';

export type TextProps = HTMLAttributes<HTMLParagraphElement> & {
    as?: 'p' | 'span' | 'h1' | 'h2' | 'h3';
    variant?: TextVariant;
    children: ReactNode;
};

const variantClass: Record<TextVariant, string> = {
    display: 'font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--color-ink)]',
    title: 'text-xl font-semibold text-[var(--color-ink)]',
    body: 'text-base leading-relaxed text-[var(--color-ink-muted)]',
    caption: 'text-xs uppercase tracking-[0.12em] text-[var(--color-ink-muted)]',
};

export function Text({ as: Tag = 'p', variant = 'body', className = '', children, ...props }: TextProps) {
    return (
        <Tag className={`${variantClass[variant]} ${className}`} {...props}>
            {children}
        </Tag>
    );
}
