import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { AssistantThread } from '@macheseinfach/assistant-core';
import { useToast } from '../shell/toast';
import { useAssistant } from './AssistantProvider';
import { useAnchoredPopover } from './useAnchoredPopover';

const attachBtn =
    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] text-[var(--color-ink)] hover:bg-[var(--color-chip)] disabled:cursor-not-allowed disabled:opacity-40';

const menuItemBtn =
    'ms-focus flex w-full items-center gap-2.5 rounded-[8px] border-2 border-transparent px-2.5 py-2 text-left text-[13px] font-medium hover:border-black/20 hover:bg-[var(--color-chip)] disabled:cursor-not-allowed disabled:opacity-40';

function MenuIcon({ children }: { children: ReactNode }) {
    return (
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-black/20 bg-white">
            {children}
        </span>
    );
}

function formatThreadAsMarkdown(thread: AssistantThread): string {
    const lines = [`# ${thread.title || 'Chat'}\n`];
    for (const msg of thread.messages) {
        if (msg.role === 'tool') continue;
        const label = msg.role === 'user' ? 'Du' : 'Assistent';
        const body = msg.content?.trim();
        if (!body) continue;
        lines.push(`## ${label}\n\n${body}\n`);
    }
    return lines.join('\n').trim();
}

export function ComposerAttachMenu({
    disabled,
    isRunning,
}: {
    disabled: boolean;
    isRunning: boolean;
}) {
    const {
        attachFiles,
        attachFromClipboard,
        thread,
    } = useAssistant();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const { open, setOpen, menuId, rootRef, triggerRef, menuRef, menuStyle } = useAnchoredPopover({
        width: 260,
        placement: 'top',
    });

    const menuDisabled = disabled || isRunning;
    const hasMessages = thread.messages.some(
        (m) => m.role === 'user' || m.role === 'assistant',
    );

    async function onFilesSelected(files: FileList | null, input?: HTMLInputElement | null) {
        if (!files?.length) return;
        await attachFiles(files);
        if (input) input.value = '';
        setOpen(false);
    }

    async function copyThread() {
        const markdown = formatThreadAsMarkdown(thread);
        if (!markdown) {
            toast({ message: 'Noch nichts zum Kopieren', variant: 'error' });
            return;
        }
        try {
            await navigator.clipboard.writeText(markdown);
            toast({ message: 'Gespräch kopiert', variant: 'success' });
            setOpen(false);
        } catch {
            toast({ message: 'Kopieren fehlgeschlagen', variant: 'error' });
        }
    }

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
                <p className="px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--color-ink-muted)]">
                    Anhänge
                </p>
                <button
                    type="button"
                    role="menuitem"
                    className={menuItemBtn}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <MenuIcon>
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                        </svg>
                    </MenuIcon>
                    Datei auswählen
                </button>
                <button
                    type="button"
                    role="menuitem"
                    className={menuItemBtn}
                    onClick={() => imageInputRef.current?.click()}
                >
                    <MenuIcon>
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <circle cx="8.5" cy="10.5" r="1.5" />
                            <path d="M21 17l-5.5-5.5a1.5 1.5 0 0 0-2.12 0L7 18" />
                        </svg>
                    </MenuIcon>
                    Bild auswählen
                </button>
                <button
                    type="button"
                    role="menuitem"
                    className={menuItemBtn}
                    onClick={() => cameraInputRef.current?.click()}
                >
                    <MenuIcon>
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                            <path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
                            <circle cx="12" cy="13" r="3.5" />
                        </svg>
                    </MenuIcon>
                    Foto aufnehmen
                </button>
                <button
                    type="button"
                    role="menuitem"
                    className={menuItemBtn}
                    onClick={() => void attachFromClipboard().then(() => setOpen(false))}
                >
                    <MenuIcon>
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                            <rect x="8" y="2" width="8" height="4" rx="1" />
                            <path d="M16 4h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1" />
                        </svg>
                    </MenuIcon>
                    Aus Zwischenablage
                </button>

                <div className="my-1 border-t border-black/10" />

                <p className="px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--color-ink-muted)]">
                    Teilen
                </p>
                <button
                    type="button"
                    role="menuitem"
                    disabled={!hasMessages}
                    className={menuItemBtn}
                    onClick={() => void copyThread()}
                >
                    <MenuIcon>
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                    </MenuIcon>
                    Gespräch kopieren
                </button>
            </div>
        ) : null;

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="sr-only"
                onChange={(e) => void onFilesSelected(e.target.files, e.target)}
            />
            <input
                ref={imageInputRef}
                type="file"
                multiple
                accept="image/*"
                className="sr-only"
                onChange={(e) => void onFilesSelected(e.target.files, e.target)}
            />
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => void onFilesSelected(e.target.files, e.target)}
            />

            <div className="relative" ref={rootRef}>
                <button
                    ref={triggerRef}
                    type="button"
                    disabled={menuDisabled}
                    onClick={() => setOpen((v) => !v)}
                    className={`${attachBtn} ${open ? 'bg-[var(--color-chip)]' : ''}`}
                    aria-expanded={open}
                    aria-controls={menuId}
                    aria-label="Inhalt hinzufügen"
                    title="Inhalt hinzufügen"
                >
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        aria-hidden="true"
                    >
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                </button>
                {menu && typeof document !== 'undefined' ? createPortal(menu, document.body) : null}
            </div>
        </>
    );
}
