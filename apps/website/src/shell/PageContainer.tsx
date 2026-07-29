import { useRef, useState, type ReactNode } from 'react';
import { BackButtonCompact } from './components/Primitives';
import { useDismissLayer } from './useDismissLayer';

type PageContainerProps = {
    children: ReactNode;
    /** Wider layout for tool grids */
    wide?: boolean;
    /** Fill parent height (flow/tool workspaces) */
    fill?: boolean;
    className?: string;
};

export function PageContainer({
    children,
    wide = false,
    fill = false,
    className = '',
}: PageContainerProps) {
    return (
        <div
            className={`mx-auto w-full px-5 py-5 md:px-6 md:py-6 ${
                wide ? 'max-w-[1040px]' : 'max-w-[840px]'
            } ${fill ? 'flex min-h-0 flex-1 flex-col' : ''} ${className}`.trim()}
        >
            {children}
        </div>
    );
}

export type PageHeaderMenuItem = {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
};

type PageHeaderMenuProps = {
    items: PageHeaderMenuItem[];
    'aria-label'?: string;
};

/** Overflow actions for dense page headers — neo-brutalist ··· popover. */
export function PageHeaderMenu({
    items,
    'aria-label': ariaLabel = 'Weitere Aktionen',
}: PageHeaderMenuProps) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useDismissLayer(open, () => setOpen(false));

    if (items.length === 0) return null;

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                aria-label={ariaLabel}
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={() => setOpen((value) => !value)}
                className="ms-focus inline-flex h-9 w-9 items-center justify-center rounded-[8px] border-2 border-black bg-white font-display text-[15px] font-bold leading-none shadow-[1px_1px_0_#000] transition hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-brutal"
            >
                ···
            </button>
            {open ? (
                <div
                    role="menu"
                    className="absolute top-full right-0 z-50 mt-1.5 min-w-[180px] rounded-[10px] border-2 border-black bg-white py-1 shadow-brutal"
                >
                    {items.map((item) => (
                        <button
                            key={item.label}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                item.onClick();
                                setOpen(false);
                            }}
                            className="ms-focus flex w-full items-center gap-2 px-3 py-2 text-left font-display text-[13px] font-semibold transition hover:bg-[var(--color-chip)]"
                        >
                            {item.icon ? (
                                <span className="inline-flex shrink-0">{item.icon}</span>
                            ) : null}
                            {item.label}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

export type AppPageHeaderProps = {
    title: string;
    subtitle?: ReactNode;
    /** Show inline back control (nested pages only). */
    showBack?: boolean;
    onBack?: () => void;
    actions?: ReactNode;
    /** Extra content below the title row (links, filters, …). */
    children?: ReactNode;
    className?: string;
    /** Sticky within scrollable main — tool/flow workspaces. */
    sticky?: boolean;
};

/**
 * Shared page chrome inside main: `[Back?] Title (+ subtitle) [actions…]`.
 * Top-level routes omit `showBack`; nested drill-down pages set it.
 */
export function AppPageHeader({
    title,
    subtitle,
    showBack = false,
    onBack,
    actions,
    children,
    className = '',
    sticky = false,
}: AppPageHeaderProps) {
    return (
        <header
            className={`mb-5 border-b-2 border-black pb-4 ${
                sticky
                    ? 'sticky top-0 z-10 -mx-5 bg-[var(--color-canvas)] px-5 md:-mx-6 md:px-6'
                    : ''
            } ${className}`.trim()}
        >
            <div className="flex min-h-[44px] items-start gap-2 sm:gap-3">
                {showBack ? (
                    <div className="shrink-0 pt-0.5">
                        <BackButtonCompact onClick={onBack} />
                    </div>
                ) : null}
                <div className="min-w-0 flex-1">
                    <h1 className="font-display text-[22px] leading-[1.1] font-bold tracking-[-0.02em] text-[var(--color-ink)] sm:text-[24px]">
                        {title}
                    </h1>
                    {subtitle ? (
                        <p className="mt-1 max-w-[56ch] text-[14px] leading-relaxed text-[var(--color-ink-soft)]">
                            {subtitle}
                        </p>
                    ) : null}
                </div>
                {actions ? (
                    <div className="flex shrink-0 items-center gap-2 pt-0.5">{actions}</div>
                ) : null}
            </div>
            {children}
        </header>
    );
}

/** @deprecated Use `AppPageHeader` — kept for incremental migration. */
export const PageHeader = AppPageHeader;
