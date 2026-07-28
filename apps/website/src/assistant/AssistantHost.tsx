import { useEffect, useRef, useState } from 'react';
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

function AssistantPanel({ compact }: { compact?: boolean }) {
    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <AssistantChrome compact={compact} />
            <AssistantPanelBody />
        </div>
    );
}

export function AssistantLauncher() {
    const {
        isOpen,
        isMinimized,
        openPanel,
        closePanel,
        toggleMinimized,
        settings,
    } = useAssistant();
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const panelRef = useRef<HTMLDivElement>(null);
    const layoutMode = settings.layoutMode;
    const trapFocus = layoutMode === 'floating' && isOpen && !isMinimized;

    useFocusTrap(panelRef, trapFocus);

    useEffect(() => {
        if (!isOpen || isMinimized) return;
        const focusTarget = panelRef.current?.querySelector<HTMLElement>(
            'textarea, input:not([type="file"]), button',
        );
        focusTarget?.focus();
    }, [isOpen, isMinimized, layoutMode]);

    useEffect(() => {
        const sidebarOpen =
            settings.enabled && isOpen && !isMinimized && layoutMode === 'sidebar' && isDesktop;
        if (sidebarOpen) {
            document.documentElement.dataset.assistantSidebar = 'open';
        } else {
            delete document.documentElement.dataset.assistantSidebar;
        }
        return () => {
            delete document.documentElement.dataset.assistantSidebar;
        };
    }, [settings.enabled, isOpen, isMinimized, layoutMode, isDesktop]);

    useEffect(() => {
        if (!isOpen) return;
        function onKey(e: KeyboardEvent) {
            if (e.key !== 'Escape') return;
            if (isMinimized) {
                closePanel();
            } else {
                toggleMinimized();
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, isMinimized, closePanel, toggleMinimized]);

    if (!settings.enabled) {
        return null;
    }

    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={openPanel}
                className="ms-focus fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-[999px] border-2 border-black bg-[var(--color-accent)] px-4 py-2.5 font-display text-[14px] font-bold shadow-brutal-lg transition hover:-translate-x-[1px] hover:-translate-y-[1px] max-md:bottom-[max(1rem,env(safe-area-inset-bottom))]"
                aria-label="Assistent öffnen"
            >
                <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                >
                    <path d="M12 3a7 7 0 0 0-4 12.7V21l4-2 4 2v-5.3A7 7 0 0 0 12 3z" />
                </svg>
                Assistent
            </button>
        );
    }

    if (isMinimized) {
        return (
            <button
                type="button"
                onClick={openPanel}
                className="ms-focus fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-[999px] border-2 border-black bg-white px-4 py-2 font-display text-[13px] font-semibold shadow-brutal-lg"
                aria-label="Assistent erweitern"
            >
                Assistent
            </button>
        );
    }

    if (layoutMode === 'sidebar') {
        return (
            <aside
                ref={panelRef}
                className={
                    isDesktop
                        ? 'fixed inset-y-0 right-0 z-40 flex w-[min(100%,420px)] flex-col border-l-2 border-black bg-white shadow-brutal-lg transition-all duration-200'
                        : 'fixed inset-0 z-50 flex flex-col bg-white'
                }
                role="dialog"
                aria-label="Assistent"
                aria-modal={!isDesktop}
            >
                <AssistantPanel compact={!isDesktop} />
            </aside>
        );
    }

    return (
        <div
            ref={panelRef}
            className={
                isDesktop
                    ? 'fixed bottom-4 right-4 z-40 flex h-[min(70vh,560px)] w-[min(calc(100%-2rem),400px)] flex-col overflow-hidden rounded-xl border-2 border-black bg-white shadow-brutal-lg transition-all duration-200'
                    : 'fixed inset-x-0 bottom-0 z-40 flex h-[min(85vh,560px)] w-full flex-col overflow-hidden rounded-t-xl border-2 border-black bg-white pb-[env(safe-area-inset-bottom)] shadow-brutal-lg'
            }
            role="dialog"
            aria-label="Assistent"
            aria-modal
        >
            <AssistantPanel compact />
        </div>
    );
}

export function AssistantHost() {
    return <AssistantLauncher />;
}
