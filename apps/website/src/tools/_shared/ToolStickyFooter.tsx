import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from 'react';

/** Gap between tool content and docked action bar */
const DOCK_GAP_CLASS = 'mt-5';

type ToolStickyFooterProps = {
    children: ReactNode;
    background?: string;
    className?: string;
    innerClassName?: string;
};

/** Visual shell only — positioning handled by `ToolStickyFooterLayout`. */
export function ToolStickyFooter({
    children,
    background = '#ffd0f0',
    className = '',
    innerClassName = '',
}: ToolStickyFooterProps) {
    const safeAreaStyle: CSSProperties = {
        background,
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
    };

    return (
        <section
            className={`border-t-2 border-black shadow-[0_-4px_0_#000] ${className}`}
            style={safeAreaStyle}
        >
            <div
                className={`mx-auto flex w-full max-w-[1040px] flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6 ${innerClassName}`}
            >
                {children}
            </div>
        </section>
    );
}

type ToolStickyFooterLayoutProps = {
    children: ReactNode;
    footer?: ReactNode;
    maxWidthClass?: string;
    className?: string;
    /** Tailwind margin-top before dock slot, e.g. `mt-5` */
    dockGapClass?: string;
};

/**
 * Single fixed footer bar that animates `bottom` between viewport edge (floating)
 * and the tool's dock slot (end of tool content). One DOM node — no swap/portal.
 */
export function ToolStickyFooterLayout({
    children,
    footer,
    maxWidthClass = 'max-w-5xl',
    className = '',
    dockGapClass = DOCK_GAP_CLASS,
}: ToolStickyFooterLayoutProps) {
    const sentinelRef = useRef<HTMLDivElement>(null);
    const dockRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const [isFloating, setIsFloating] = useState(true);
    const [dockBottomPx, setDockBottomPx] = useState(0);
    const [footerHeight, setFooterHeight] = useState(88);

    const measureDock = useCallback(() => {
        const dock = dockRef.current;
        if (!dock) return;
        const dockBottom = dock.getBoundingClientRect().bottom;
        setDockBottomPx(Math.max(0, window.innerHeight - dockBottom));
    }, []);

    useEffect(() => {
        if (!footer) return;
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry) setIsFloating(!entry.isIntersecting);
            },
            { threshold: 0 },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [footer]);

    useEffect(() => {
        if (isFloating) return;
        measureDock();
        window.addEventListener('scroll', measureDock, { passive: true });
        window.addEventListener('resize', measureDock);
        return () => {
            window.removeEventListener('scroll', measureDock);
            window.removeEventListener('resize', measureDock);
        };
    }, [isFloating, measureDock]);

    useEffect(() => {
        const node = footerRef.current;
        if (!node) return;

        const observer = new ResizeObserver(([entry]) => {
            const height = entry?.contentRect.height;
            if (height && height > 0) setFooterHeight(height);
        });

        observer.observe(node);
        return () => observer.disconnect();
    }, [footer]);

    if (!footer) {
        return (
            <div className={`mx-auto w-full ${maxWidthClass} px-4 py-6 md:px-6 ${className}`}>
                <div className="ms-animate-fade">{children}</div>
            </div>
        );
    }

    const bottomPx = isFloating ? 0 : dockBottomPx;

    return (
        <>
            <div
                className={`mx-auto w-full ${maxWidthClass} px-4 py-6 md:px-6 ${className}`}
                style={{ paddingBottom: isFloating ? footerHeight : 0 }}
            >
                <div className="ms-animate-fade">{children}</div>
                <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
                <div
                    ref={dockRef}
                    className={dockGapClass}
                    style={{ height: footerHeight }}
                    aria-hidden="true"
                />
            </div>

            <div
                ref={footerRef}
                className="fixed inset-x-0 z-40 transition-[bottom] duration-300 ease-out motion-reduce:transition-none"
                style={{ bottom: bottomPx }}
            >
                {footer}
            </div>
        </>
    );
}

type ToolStickyFooterMetaProps = {
    title: ReactNode;
    hint?: ReactNode;
};

export function ToolStickyFooterMeta({ title, hint }: ToolStickyFooterMetaProps) {
    return (
        <div className="min-w-0 shrink">
            <p className="font-display text-[14px] font-bold tracking-[-0.02em] md:text-[16px]">
                {title}
            </p>
            {hint ? (
                <p className="mt-0.5 hidden text-[11px] text-[var(--color-ink-soft)] sm:block">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}

export function ToolStickyFooterActions({ children }: { children: ReactNode }) {
    return (
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            {children}
        </div>
    );
}
