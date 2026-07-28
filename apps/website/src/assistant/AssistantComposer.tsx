import { useRef, useState, type FormEvent } from 'react';
import { useAssistant } from './AssistantProvider';

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

export function AssistantComposer() {
    const { sendMessage, attachFiles, isRunning, settings } = useAssistant();
    const [draft, setDraft] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const disabled = isRunning || !settings.openRouterApiKey.trim();

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        const text = draft;
        setDraft('');
        await sendMessage(text);
    }

    return (
        <form
            onSubmit={onSubmit}
            className="shrink-0 border-t-2 border-black bg-white p-3"
            aria-label="Nachricht senden"
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
                    disabled={disabled}
                    onClick={() => fileInputRef.current?.click()}
                    className="ms-btn ms-focus h-[44px] shrink-0 self-end px-3 disabled:opacity-50"
                    aria-label="Datei anhängen"
                    title="Datei anhängen"
                >
                    📎
                </button>
                <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (!disabled && draft.trim()) {
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
                <button
                    type="submit"
                    disabled={disabled || !draft.trim()}
                    className="ms-btn ms-focus h-[44px] shrink-0 self-end px-4 disabled:opacity-50"
                >
                    Senden
                </button>
            </div>
            <p className="mt-2 text-[10px] leading-snug text-[var(--color-ink-muted)]">
                Chat geht an OpenRouter; Dateien bleiben lokal außer du fügst Text ein.
            </p>
        </form>
    );
}
