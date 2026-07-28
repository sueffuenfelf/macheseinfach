import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAssistant } from './AssistantProvider';

const DRAFT_KEY = 'msf.assistant.draft';

function AttachmentChips() {
    const { attachments, removeAttachment } = useAssistant();
    if (!attachments.length) return null;

    return (
        <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((att) => (
                <span
                    key={att.id}
                    className="inline-flex max-w-full items-center gap-1 rounded-[999px] border-2 border-black bg-[var(--color-chip)] px-2 py-1 text-[11px] font-medium"
                >
                    <span className="truncate" title={att.name}>
                        {att.name}
                    </span>
                    <span className="text-[var(--color-ink-muted)]">
                        {att.kind === 'file' ? 'Datei' : 'Text'}
                    </span>
                    <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="ms-focus rounded-full px-1 font-bold leading-none"
                        aria-label={`${att.name} entfernen`}
                    >
                        ×
                    </button>
                </span>
            ))}
        </div>
    );
}

function readDraft(): string {
    try {
        return sessionStorage.getItem(DRAFT_KEY) ?? '';
    } catch {
        return '';
    }
}

function writeDraft(value: string): void {
    try {
        if (value) {
            sessionStorage.setItem(DRAFT_KEY, value);
        } else {
            sessionStorage.removeItem(DRAFT_KEY);
        }
    } catch {
        /* private mode */
    }
}

export function AssistantComposer() {
    const { sendMessage, attachFiles, isRunning, settings, stopGeneration } = useAssistant();
    const [draft, setDraft] = useState(() => readDraft());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const disabled = !settings.openRouterApiKey.trim();
    const canSend = !disabled && !isRunning && draft.trim().length > 0;

    useEffect(() => {
        writeDraft(draft);
    }, [draft]);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (!canSend) return;
        const text = draft;
        setDraft('');
        writeDraft('');
        await sendMessage(text);
    }

    return (
        <form
            onSubmit={onSubmit}
            className="shrink-0 border-t-2 border-black bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            aria-label="Nachricht senden"
            style={{
                paddingBottom:
                    'max(0.75rem, calc(env(safe-area-inset-bottom) + var(--assistant-keyboard-inset, 0px)))',
            }}
        >
            <AttachmentChips />
            <div className="flex gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                        void attachFiles(e.target.files);
                        e.target.value = '';
                    }}
                />
                <button
                    type="button"
                    disabled={disabled || isRunning}
                    onClick={() => fileInputRef.current?.click()}
                    className="ms-btn ms-focus h-[44px] shrink-0 self-end px-3 disabled:opacity-50"
                    aria-label="Datei anhängen"
                    title="Datei anhängen"
                >
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        aria-hidden="true"
                    >
                        <path d="M21.4 11.6l-8.5 8.5a5 5 0 0 1-7.1-7.1l9.2-9.2a3.2 3.2 0 0 1 4.5 4.5L10 17.8" />
                    </svg>
                </button>
                <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onFocus={() => {
                        window.requestAnimationFrame(() => {
                            textareaRef.current?.scrollIntoView({
                                block: 'nearest',
                                behavior: 'smooth',
                            });
                        });
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (canSend) {
                                void onSubmit(e as unknown as FormEvent);
                            }
                        }
                    }}
                    rows={2}
                    disabled={disabled}
                    placeholder={
                        settings.openRouterApiKey.trim()
                            ? 'Nachricht an den Assistenten …'
                            : 'API-Key in Einstellungen hinterlegen'
                    }
                    className="ms-input ms-focus min-h-[44px] flex-1 resize-none py-2 text-[14px]"
                    aria-label="Nachricht"
                />
                {isRunning ? (
                    <button
                        type="button"
                        onClick={stopGeneration}
                        className="ms-btn ms-focus h-[44px] shrink-0 self-end border-[var(--color-danger)] px-4 text-[var(--color-danger)]"
                        aria-label="Antwort abbrechen"
                    >
                        Stop
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={!canSend}
                        className="ms-btn ms-focus h-[44px] shrink-0 self-end px-4 disabled:opacity-50"
                    >
                        Senden
                    </button>
                )}
            </div>
            <p className="mt-2 text-[10px] leading-snug text-[var(--color-ink-muted)]">
                Chat geht an OpenRouter; Dateien bleiben lokal außer du fügst Text ein. Enter
                sendet, Shift+Enter neue Zeile.
            </p>
        </form>
    );
}
