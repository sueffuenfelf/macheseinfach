import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useAssistant } from './AssistantProvider';
import { AssistantChrome, AssistantEmptyKeyState } from './AssistantChrome';
import { AssistantComposer } from './AssistantComposer';
import { AssistantThreadView } from './AssistantThreadView';

function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(
        () => typeof window !== 'undefined' && window.matchMedia(query).matches,
    );

    useEffect(() => {
        const mq = window.matchMedia(query);
        const onChange = () => setMatches(mq.matches);
        onChange();
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, [query]);

    return matches;
}

function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, active: boolean) {
    useEffect(() => {
        if (!active || !containerRef.current) return;
        const root = containerRef.current;
        const selector =
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

        function onKeyDown(e: KeyboardEvent) {
            if (e.key !== 'Tab') return;
            const focusable = [...root.querySelectorAll<HTMLElement>(selector)];
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
            }
        }

        root.addEventListener('keydown', onKeyDown);
        return () => root.removeEventListener('keydown', onKeyDown);
    }, [active, containerRef]);
}

/** Keep composer above soft keyboard on mobile via visualViewport. */
function useKeyboardInset(active: boolean) {
    useEffect(() => {
        if (!active || typeof window === 'undefined' || !window.visualViewport) return;
        const vv = window.visualViewport;

        function sync() {
            const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
            document.documentElement.style.setProperty(
                '--assistant-keyboard-inset',
                `${Math.round(inset)}px`,
            );
        }

        sync();
        vv.addEventListener('resize', sync);
        vv.addEventListener('scroll', sync);
        return () => {
            vv.removeEventListener('resize', sync);
            vv.removeEventListener('scroll', sync);
            document.documentElement.style.removeProperty('--assistant-keyboard-inset');
        };
    }, [active]);
}

function useBodyScrollLock(locked: boolean) {
    useEffect(() => {
        if (!locked) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [locked]);
}

function AssistantErrorBanner() {
    const { error, clearError, canRetry, retryTurn } = useAssistant();
    if (!error) return null;

    return (
        <div
            className="shrink-0 border-b-2 border-[var(--color-danger)] bg-[#fff5f5] px-3 py-2 text-[13px]"
            role="alert"
        >
            <p className="leading-snug">{error}</p>
            <div className="mt-2 flex flex-wrap gap-2">
                {canRetry ? (
                    <button
                        type="button"
                        onClick={() => void retryTurn()}
                        className="ms-focus rounded-[6px] border-2 border-black bg-white px-2.5 py-1 font-display text-[12px] font-semibold shadow-[1px_1px_0_#000]"
                    >
                        Erneut versuchen
                    </button>
                ) : null}
                <button
                    type="button"
                    onClick={clearError}
                    className="ms-focus font-display text-[12px] font-semibold underline"
                >
                    Schließen
                </button>
            </div>
        </div>
    );
}

function AssistantPanelBody() {
    const { settings } = useAssistant();

    if (!settings.openRouterApiKey.trim()) {
        return <AssistantEmptyKeyState />;
    }

    return (
        <>
            <AssistantErrorBanner />
            <AssistantThreadView />
            <AssistantComposer />
        </>
    );
}

function AssistantPanel({
    compact,
    hideLayoutToggle,
}: {
    compact?: boolean;
    hideLayoutToggle?: boolean;
}) {
    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <AssistantChrome compact={compact} hideLayoutToggle={hideLayoutToggle} />
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <AssistantPanelBody />
            </div>
        </div>
    );
}

function AssistantPortal({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || typeof document === 'undefined') return null;
    return createPortal(children, document.body);
}

export function AssistantLauncher() {
    const { isOpen, isMinimized, openPanel, closePanel, toggleMinimized, settings } =
        useAssistant();
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const panelRef = useRef<HTMLDivElement>(null);
    const layoutMode = settings.layoutMode;
    const overlayOpen = isOpen && !isMinimized;
    const mobileOverlay = overlayOpen && !isDesktop;
    const trapFocus = overlayOpen && (layoutMode === 'floating' || !isDesktop);

    useFocusTrap(panelRef, trapFocus);
    useBodyScrollLock(mobileOverlay);
    useKeyboardInset(mobileOverlay);

    useEffect(() => {
        if (!overlayOpen) return;
        const focusTarget = panelRef.current?.querySelector<HTMLElement>(
            'textarea, input:not([type="file"]), button',
        );
        focusTarget?.focus();
    }, [overlayOpen]);

    useEffect(() => {
        const sidebarOpen =
            settings.enabled && overlayOpen && layoutMode === 'sidebar' && isDesktop;
        if (sidebarOpen) {
            document.documentElement.dataset.assistantSidebar = 'open';
        } else {
            delete document.documentElement.dataset.assistantSidebar;
        }

        if (mobileOverlay) {
            document.documentElement.dataset.assistantOverlay = 'open';
        } else {
            delete document.documentElement.dataset.assistantOverlay;
        }

        return () => {
            delete document.documentElement.dataset.assistantSidebar;
            delete document.documentElement.dataset.assistantOverlay;
        };
    }, [settings.enabled, overlayOpen, layoutMode, isDesktop, mobileOverlay]);

    useEffect(() => {
        if (!isOpen) return;
        function onKey(e: KeyboardEvent) {
            if (e.key !== 'Escape') return;
            if (isMinimized) {
                closePanel();
            } else if (!isDesktop) {
                // Mobile main chat: Escape closes fully (toggle feel).
                closePanel();
            } else {
                toggleMinimized();
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, isMinimized, isDesktop, closePanel, toggleMinimized]);

    if (!settings.enabled) {
        return null;
    }

    const ui = !isOpen ? (
        <button
                type="button"
                onClick={openPanel}
                className="ms-focus fixed bottom-4 right-4 z-50 inline-flex min-h-11 items-center gap-2 rounded-[999px] border-2 border-black bg-[var(--color-accent)] px-4 py-2.5 font-display text-[14px] font-bold shadow-brutal-lg transition hover:-translate-x-[1px] hover:-translate-y-[1px] max-md:bottom-[max(1rem,env(safe-area-inset-bottom))] max-md:right-[max(1rem,env(safe-area-inset-right))]"
                aria-label="Assistent öffnen"
            >
                <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    aria-hidden="true"
                >
                    <path d="M12 3a7 7 0 0 0-4 12.7V21l4-2 4 2v-5.3A7 7 0 0 0 12 3z" />
                </svg>
                Assistent
            </button>
    ) : isMinimized ? (
        <button
            type="button"
            onClick={openPanel}
            className="ms-focus fixed bottom-4 right-4 z-50 inline-flex min-h-11 items-center gap-2 rounded-[999px] border-2 border-black bg-white px-4 py-2 font-display text-[13px] font-semibold shadow-brutal-lg max-md:bottom-[max(1rem,env(safe-area-inset-bottom))] max-md:right-[max(1rem,env(safe-area-inset-right))]"
            aria-label="Assistent erweitern"
        >
            Assistent
        </button>
    ) : !isDesktop ? (
        <div
            ref={panelRef}
            className="assistant-mobile-panel fixed inset-0 z-50 flex flex-col bg-white"
            role="dialog"
            aria-label="Assistent"
            aria-modal="true"
            data-testid="assistant-mobile-overlay"
        >
            <AssistantPanel compact hideLayoutToggle />
        </div>
    ) : layoutMode === 'sidebar' ? (
        <aside
            ref={panelRef}
            className="fixed top-0 right-0 z-40 flex h-dvh max-h-dvh w-[min(100%,420px)] flex-col border-l-2 border-black bg-white shadow-brutal-lg transition-all duration-200"
            role="dialog"
            aria-label="Assistent"
        >
            <AssistantPanel />
        </aside>
    ) : (
        <div
            ref={panelRef}
            className="fixed bottom-4 right-4 z-40 flex h-[min(70dvh,560px)] w-[min(calc(100%-2rem),400px)] flex-col overflow-hidden rounded-xl border-2 border-black bg-white shadow-brutal-lg transition-all duration-200"
            role="dialog"
            aria-label="Assistent"
            aria-modal
        >
            <AssistantPanel compact />
        </div>
    );

    return <AssistantPortal>{ui}</AssistantPortal>;
}

export function AssistantHost() {
    return <AssistantLauncher />;
}
