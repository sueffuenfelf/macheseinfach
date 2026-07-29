import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatformNav } from '../routing/usePlatformNav';
import {
    buildComposerSlashDraft,
    executeComposerSlash,
    isComposerSlashMode,
    type ComposerSlashCommand,
} from './composer-commands';
import { useAssistant } from './AssistantProvider';
import { ComposerAttachMenu } from './ComposerAttachMenu';
import { ComposerSlashPopover } from './ComposerSlashPopover';

const DRAFT_KEY = 'msf.assistant.draft';

const actionBtn =
    'ms-focus inline-flex h-9 shrink-0 items-center justify-center rounded-[6px] border-2 border-black px-3 font-display text-[12px] font-semibold shadow-[1px_1px_0_#000] disabled:cursor-not-allowed disabled:opacity-45';

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
    const navigate = useNavigate();
    const nav = usePlatformNav();
    const {
        sendMessage,
        attachments,
        isRunning,
        settings,
        stopGeneration,
        startFreshThread,
        injectLocalReply,
        attachFromClipboard,
    } = useAssistant();
    const [draft, setDraft] = useState(() => readDraft());
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const disabled = !settings.openRouterApiKey.trim();
    const canSend =
        !disabled && !isRunning && (draft.trim().length > 0 || attachments.length > 0);

    const commandContext = useCallback(
        () => ({
            startFreshThread,
            selectArea: nav.selectArea,
            selectStory: nav.selectStory,
            selectTool: nav.selectTool,
            listFavorites: () => nav.favorites,
            goToSearch: nav.goToSearch,
            goToVorhaben: nav.goToVorhaben,
            attachFromClipboard,
            injectAssistantReply: (text: string) => injectLocalReply(text, draft.trim() || undefined),
            navigate: (href: string) => navigate(href),
        }),
        [
            attachFromClipboard,
            draft,
            injectLocalReply,
            nav.favorites,
            nav.goToSearch,
            nav.goToVorhaben,
            nav.selectArea,
            nav.selectStory,
            nav.selectTool,
            navigate,
            startFreshThread,
        ],
    );

    const runSlashCommand = useCallback(
        async (text: string) => {
            const result = await executeComposerSlash(text, commandContext());
            if (!result.handled) return false;
            if (result.clearDraft) {
                setDraft('');
                writeDraft('');
            }
            return true;
        },
        [commandContext],
    );

    const onInstantCommand = useCallback(
        async (cmd: ComposerSlashCommand) => {
            const text = buildComposerSlashDraft(cmd);
            await runSlashCommand(text);
            setDraft('');
            writeDraft('');
        },
        [runSlashCommand],
    );

    useEffect(() => {
        writeDraft(draft);
    }, [draft]);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
    }, [draft]);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (!canSend) return;
        const text = draft;
        if (isComposerSlashMode(text.trim())) {
            const handled = await runSlashCommand(text.trim());
            if (handled) return;
        }
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
            <div className="relative flex items-end gap-1 rounded-[10px] border-2 border-black bg-white p-1.5 shadow-[2px_2px_0_#000]">
                <ComposerSlashPopover
                    draft={draft}
                    textareaRef={textareaRef}
                    onSelect={setDraft}
                    onExecute={(cmd) => void onInstantCommand(cmd)}
                />
                <ComposerAttachMenu disabled={disabled} isRunning={isRunning} />
                <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (canSend) {
                                void onSubmit(e as unknown as FormEvent);
                            }
                        }
                    }}
                    rows={1}
                    disabled={disabled}
                    placeholder={
                        settings.openRouterApiKey.trim()
                            ? 'Nachricht … oder / für Befehle'
                            : 'API-Key in Einstellungen hinterlegen'
                    }
                    className="min-h-9 min-w-0 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-[14px] leading-snug placeholder:text-[var(--color-ink-muted)] focus:outline-none disabled:opacity-50"
                    style={{ maxHeight: '8rem' }}
                    aria-label="Nachricht"
                />
                {isRunning ? (
                    <button
                        type="button"
                        onClick={stopGeneration}
                        className={`${actionBtn} border-[var(--color-danger)] bg-white text-[var(--color-danger)]`}
                        aria-label="Antwort abbrechen"
                    >
                        Stop
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={!canSend}
                        className={`${actionBtn} ${
                            canSend
                                ? 'bg-[var(--color-accent)] text-black'
                                : 'bg-white text-[var(--color-ink-muted)]'
                        }`}
                    >
                        Senden
                    </button>
                )}
            </div>
            <p className="mt-2 text-[10px] leading-snug text-[var(--color-ink-muted)]">
                `/hilfe` für Befehle · Dateien über + · Enter sendet, Shift+Enter neue Zeile.
            </p>
        </form>
    );
}
