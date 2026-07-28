import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { settingsPath } from '../routing/paths';
import { useAssistant } from './AssistantProvider';

type AssistantChromeProps = {
    compact?: boolean;
    /** Hide sidebar/floating toggle (mobile fullscreen overlay). */
    hideLayoutToggle?: boolean;
};

function ThreadMenu() {
    const { threads, thread, newThread, selectThread, deleteThread, isRunning } = useAssistant();
    const [open, setOpen] = useState(false);
    const menuId = useId();
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function onPointer(e: MouseEvent) {
            if (!rootRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false);
        }
        window.addEventListener('mousedown', onPointer);
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('mousedown', onPointer);
            window.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return (
        <div className="relative" ref={rootRef}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="ms-focus inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-[6px] border-2 border-black bg-white px-2 font-display text-[11px] font-semibold shadow-[1px_1px_0_#000] md:h-8"
                aria-expanded={open}
                aria-controls={menuId}
                aria-label="Chats"
                title="Chats"
            >
                Chats
            </button>
            {open ? (
                <div
                    id={menuId}
                    role="menu"
                    className="absolute right-0 z-20 mt-1 max-h-[min(50vh,320px)] w-[min(calc(100vw-2rem),280px)] overflow-y-auto rounded-[10px] border-2 border-black bg-white p-2 shadow-brutal-lg"
                >
                    <button
                        type="button"
                        role="menuitem"
                        disabled={isRunning}
                        onClick={() => {
                            newThread();
                            setOpen(false);
                        }}
                        className="ms-focus mb-2 flex w-full items-center justify-center rounded-[8px] border-2 border-black bg-[var(--color-accent)] px-3 py-2 font-display text-[13px] font-semibold shadow-[1px_1px_0_#000] disabled:opacity-50"
                    >
                        Neuer Chat
                    </button>
                    <ul className="space-y-1">
                        {threads.map((entry) => {
                            const active = entry.id === thread.id;
                            return (
                                <li key={entry.id} className="flex items-stretch gap-1">
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => {
                                            selectThread(entry.id);
                                            setOpen(false);
                                        }}
                                        className={`ms-focus min-w-0 flex-1 truncate rounded-[6px] border-2 px-2 py-2 text-left text-[12px] ${
                                            active
                                                ? 'border-black bg-[var(--color-chip)] font-semibold'
                                                : 'border-transparent hover:border-black/30'
                                        }`}
                                    >
                                        {entry.title || 'Neuer Chat'}
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={`Chat „${entry.title || 'Neuer Chat'}“ löschen`}
                                        onClick={() => {
                                            deleteThread(entry.id);
                                        }}
                                        className="ms-focus shrink-0 rounded-[6px] border-2 border-black bg-white px-2 text-[12px] font-bold shadow-[1px_1px_0_#000]"
                                    >
                                        ×
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ) : null}
        </div>
    );
}

export function AssistantChrome({
    compact = false,
    hideLayoutToggle = false,
}: AssistantChromeProps) {
    const { toggleMinimized, closePanel, isMinimized, settings, updateSettings } = useAssistant();
    const isSidebar = settings.layoutMode === 'sidebar';

    function toggleLayout() {
        updateSettings({
            layoutMode: isSidebar ? 'floating' : 'sidebar',
        });
    }

    return (
        <header
            className={`flex shrink-0 items-center justify-between gap-2 border-b-2 border-black bg-[var(--color-chip)] px-3 pt-[max(0.5rem,env(safe-area-inset-top))] ${
                compact ? 'pb-2' : 'pb-3'
            }`}
        >
            <div className="min-w-0">
                <p className="font-display text-[14px] font-bold tracking-[-0.01em]">Assistent</p>
                {!compact ? (
                    <p className="text-[11px] text-[var(--color-ink-soft)]">
                        Chat geht an OpenRouter; Dateien bleiben lokal außer du fügst Text ein
                    </p>
                ) : null}
            </div>
            <div className="flex items-center gap-1">
                <ThreadMenu />
                {!hideLayoutToggle ? (
                    <button
                        type="button"
                        onClick={toggleLayout}
                        className="ms-focus inline-flex h-10 items-center gap-1 rounded-[6px] border-2 border-black bg-white px-2 font-display text-[10px] font-semibold uppercase tracking-[0.04em] shadow-[1px_1px_0_#000] md:h-8"
                        aria-label={
                            isSidebar ? 'Schwebendes Fenster aktivieren' : 'Sidebar aktivieren'
                        }
                        title={isSidebar ? 'Schwebend' : 'Sidebar'}
                    >
                        {isSidebar ? '▣' : '▤'}
                        <span className="hidden sm:inline">
                            {isSidebar ? 'Schwebend' : 'Sidebar'}
                        </span>
                    </button>
                ) : null}
                <button
                    type="button"
                    onClick={toggleMinimized}
                    className="ms-focus inline-flex h-10 w-10 items-center justify-center rounded-[6px] border-2 border-black bg-white shadow-[1px_1px_0_#000] md:h-8 md:w-8"
                    aria-label={isMinimized ? 'Assistent erweitern' : 'Assistent minimieren'}
                >
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        aria-hidden="true"
                    >
                        <path d={isMinimized ? 'M7 14l5-5 5 5' : 'M7 10l5 5 5-5'} />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={closePanel}
                    className="ms-focus inline-flex h-10 w-10 items-center justify-center rounded-[6px] border-2 border-black bg-white shadow-[1px_1px_0_#000] md:h-8 md:w-8"
                    aria-label="Assistent schließen"
                >
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        aria-hidden="true"
                    >
                        <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                </button>
            </div>
        </header>
    );
}

export function AssistantEmptyKeyState() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
            <p className="font-display text-[15px] font-bold">OpenRouter API-Key fehlt</p>
            <p className="max-w-[280px] text-[13px] leading-relaxed text-[var(--color-ink-soft)]">
                Der Assistent nutzt OpenRouter für KI-Antworten. Dein Key wird nur lokal im Browser
                gespeichert.
            </p>
            <Link
                to={settingsPath()}
                className="ms-focus mt-1 inline-flex items-center rounded-[8px] border-2 border-black bg-white px-4 py-2 font-display text-[13px] font-semibold shadow-[2px_2px_0_#000] transition hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-brutal-sm"
            >
                Zu den Einstellungen
            </Link>
        </div>
    );
}
