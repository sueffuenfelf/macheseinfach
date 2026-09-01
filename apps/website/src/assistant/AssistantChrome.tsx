import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { settingsPath } from '../routing/paths';
import { useAssistant } from './AssistantProvider';
import { useAnchoredPopover } from './useAnchoredPopover';

type AssistantChromeProps = {
    compact?: boolean;
    /** Hide sidebar/floating toggle (mobile fullscreen overlay). */
    hideLayoutToggle?: boolean;
};

const chromeIconBtn =
    'ms-focus inline-flex h-10 w-10 items-center justify-center rounded-[6px] border-2 border-black bg-white shadow-[1px_1px_0_#000] md:h-8 md:w-8';

function HistoryIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden="true"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </svg>
    );
}

function SidebarLayoutIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden="true"
        >
            <rect x="3" y="3" width="18" height="18" rx="1" />
            <path d="M15 3v18" />
        </svg>
    );
}

function FloatingLayoutIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden="true"
        >
            <rect x="5" y="7" width="14" height="12" rx="1" />
            <path d="M9 7V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v4" />
        </svg>
    );
}

type ThreadMenuProps = {
    entry: { id: string; title: string };
    active: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onRename: (title: string) => void;
};

function ThreadMenuItem({ entry, active, onSelect, onDelete, onRename }: ThreadMenuProps) {
    const [editing, setEditing] = useState(false);
    const [draftTitle, setDraftTitle] = useState(entry.title || 'Neuer Chat');
    const inputRef = useRef<HTMLInputElement>(null);
    const displayTitle = entry.title || 'Neuer Chat';

    useEffect(() => {
        if (!editing) {
            setDraftTitle(displayTitle);
        }
    }, [displayTitle, editing]);

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [editing]);

    function commitRename() {
        const trimmed = draftTitle.trim();
        if (trimmed && trimmed !== displayTitle) {
            onRename(trimmed);
        }
        setEditing(false);
    }

    if (editing) {
        return (
            <li className="flex items-stretch gap-1">
                <input
                    ref={inputRef}
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            commitRename();
                        }
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            setDraftTitle(displayTitle);
                            setEditing(false);
                        }
                    }}
                    className="ms-input ms-focus min-w-0 flex-1 rounded-[6px] px-2 py-2 text-[12px]"
                    aria-label="Chat umbenennen"
                />
            </li>
        );
    }

    return (
        <li className="flex items-stretch gap-1">
            <button
                type="button"
                role="menuitem"
                onClick={onSelect}
                className={`ms-focus min-w-0 flex-1 truncate rounded-[6px] border-2 px-2 py-2 text-left text-[12px] ${
                    active
                        ? 'border-black bg-[var(--color-chip)] font-semibold'
                        : 'border-transparent hover:border-black/30'
                }`}
            >
                {displayTitle}
            </button>
            <button
                type="button"
                aria-label={`Chat „${displayTitle}“ umbenennen`}
                onClick={(e) => {
                    e.stopPropagation();
                    setEditing(true);
                }}
                className="ms-focus shrink-0 rounded-[6px] border-2 border-black bg-white px-2 text-[12px] font-bold shadow-[1px_1px_0_#000]"
            >
                <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    aria-hidden="true"
                >
                    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
            </button>
            <button
                type="button"
                aria-label={`Chat „${displayTitle}“ löschen`}
                onClick={onDelete}
                className="ms-focus inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border-2 border-black bg-white shadow-[1px_1px_0_#000]"
            >
                <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    aria-hidden="true"
                >
                    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M10 11v6M14 11v6M6 7l1 13a1 1 0 0 0 1 .9h8a1 1 0 0 0 1-.9L18 7" />
                </svg>
            </button>
        </li>
    );
}

function ThreadMenu() {
    const {
        threads,
        thread,
        newThread,
        selectThread,
        deleteThread,
        renameThread,
        canCreateNewThread,
        isRunning,
    } = useAssistant();
    const { open, setOpen, menuId, rootRef, triggerRef, menuRef, menuStyle } = useAnchoredPopover();

    const menu =
        open && menuStyle ? (
            <div
                ref={menuRef}
                id={menuId}
                role="menu"
                style={{
                    position: 'fixed',
                    top: menuStyle.top,
                    left: menuStyle.left,
                    width: menuStyle.width,
                    zIndex: 60,
                }}
                className="max-h-[min(50vh,320px)] overflow-y-auto rounded-[10px] border-2 border-black bg-white p-2 shadow-brutal-lg"
            >
                <button
                    type="button"
                    role="menuitem"
                    disabled={isRunning || !canCreateNewThread}
                    onClick={() => {
                        newThread();
                        setOpen(false);
                    }}
                    title={
                        canCreateNewThread
                            ? undefined
                            : 'Schreibe zuerst in den aktuellen Chat, bevor du einen neuen startest.'
                    }
                    className="ms-focus mb-2 flex w-full items-center justify-center rounded-[8px] border-2 border-black bg-[var(--color-accent)] px-3 py-2 font-display text-[13px] font-semibold shadow-[1px_1px_0_#000] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Neuer Chat
                </button>
                <ul className="space-y-1">
                    {threads.map((entry) => (
                        <ThreadMenuItem
                            key={entry.id}
                            entry={entry}
                            active={entry.id === thread.id}
                            onSelect={() => {
                                selectThread(entry.id);
                                setOpen(false);
                            }}
                            onDelete={() => deleteThread(entry.id)}
                            onRename={(title) => renameThread(entry.id, title)}
                        />
                    ))}
                </ul>
            </div>
        ) : null;

    return (
        <div className="relative" ref={rootRef}>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={chromeIconBtn}
                aria-expanded={open}
                aria-controls={menuId}
                aria-label="Chat-Verlauf"
                title="Chat-Verlauf"
            >
                <HistoryIcon />
            </button>
            {menu && typeof document !== 'undefined' ? createPortal(menu, document.body) : null}
        </div>
    );
}

function AssistantLayoutSettingsMenu() {
    const { settings, updateSettings } = useAssistant();
    const isSidebar = settings.layoutMode === 'sidebar';
    const { open, setOpen, menuId, rootRef, triggerRef, menuRef, menuStyle } =
        useAnchoredPopover(120);

    const menu =
        open && menuStyle ? (
            <div
                ref={menuRef}
                id={menuId}
                role="menu"
                style={{
                    position: 'fixed',
                    top: menuStyle.top,
                    left: menuStyle.left,
                    width: menuStyle.width,
                    zIndex: 60,
                }}
                className="rounded-[10px] border-2 border-black bg-white p-1.5 shadow-brutal-lg"
            >
                <div className="flex gap-1">
                    <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={isSidebar}
                        onClick={() => {
                            updateSettings({ layoutMode: 'sidebar' });
                            setOpen(false);
                        }}
                        className={`ms-focus inline-flex h-9 w-9 items-center justify-center rounded-[8px] border-2 ${
                            isSidebar
                                ? 'border-black bg-[var(--color-chip)]'
                                : 'border-transparent hover:border-black/30'
                        }`}
                        aria-label="Sidebar"
                        title="Sidebar"
                    >
                        <SidebarLayoutIcon />
                    </button>
                    <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={!isSidebar}
                        onClick={() => {
                            updateSettings({ layoutMode: 'floating' });
                            setOpen(false);
                        }}
                        className={`ms-focus inline-flex h-9 w-9 items-center justify-center rounded-[8px] border-2 ${
                            !isSidebar
                                ? 'border-black bg-[var(--color-chip)]'
                                : 'border-transparent hover:border-black/30'
                        }`}
                        aria-label="Schwebendes Fenster"
                        title="Schwebend"
                    >
                        <FloatingLayoutIcon />
                    </button>
                </div>
            </div>
        ) : null;

    return (
        <div className="relative" ref={rootRef}>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={chromeIconBtn}
                aria-expanded={open}
                aria-controls={menuId}
                aria-label="Assistent-Einstellungen"
                title="Einstellungen"
            >
                <SettingsIcon />
            </button>
            {menu && typeof document !== 'undefined' ? createPortal(menu, document.body) : null}
        </div>
    );
}

export function AssistantChrome({
    compact = false,
    hideLayoutToggle = false,
}: AssistantChromeProps) {
    const { toggleMinimized, closePanel, isMinimized } = useAssistant();

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
                {!hideLayoutToggle ? <AssistantLayoutSettingsMenu /> : null}
                <button
                    type="button"
                    onClick={toggleMinimized}
                    className={chromeIconBtn}
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
                    className={chromeIconBtn}
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
