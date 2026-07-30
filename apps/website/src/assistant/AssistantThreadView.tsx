import { useEffect, useRef, useState } from 'react';
import type { ChatAttachment, StoredMessage } from '@macheseinfach/assistant-core';
import { useToast } from '../shell/toast';
import { useAssistant } from './AssistantProvider';
import { AssistantMarkdown } from './AssistantMarkdown';
import {
    getAttachmentObjectUrl,
    revokeAttachmentObjectUrl,
} from './attachment-service';
import { getAssistantPersistence } from './persistence';
import { looksSensitiveContent } from './sensitive-content';

const TOOL_LABELS: Record<string, string> = {
    list_areas: 'Bereiche auflisten',
    get_area: 'Bereich laden',
    list_flows: 'Vorhaben auflisten',
    get_flow: 'Vorhaben laden',
    search_tools: 'Tools suchen',
    get_tool: 'Tool-Details',
    list_favorites: 'Favoriten',
    request_user_input: 'Eingabe anfordern',
    attach_from_chat: 'Anhang referenzieren',
    run_tool: 'Tool ausführen',
    open_flow: 'Vorhaben öffnen',
    open_tool: 'Tool öffnen',
};

async function copyText(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        try {
            const area = document.createElement('textarea');
            area.value = text;
            area.setAttribute('readonly', '');
            area.style.position = 'fixed';
            area.style.left = '-9999px';
            document.body.appendChild(area);
            area.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(area);
            return ok;
        } catch {
            return false;
        }
    }
}

function MessageActions({
    content,
    showRegenerate,
}: {
    content: string;
    showRegenerate?: boolean;
}) {
    const { toast } = useToast();
    const { regenerateLast, canRegenerate, isRunning } = useAssistant();
    const [copied, setCopied] = useState(false);

    if (!content.trim()) return null;

    return (
        <div className="mt-1 flex flex-wrap items-center gap-1">
            <button
                type="button"
                onClick={async () => {
                    const ok = await copyText(content);
                    if (ok) {
                        setCopied(true);
                        toast({ message: 'In die Zwischenablage kopiert', variant: 'success' });
                        window.setTimeout(() => setCopied(false), 1600);
                    } else {
                        toast({ message: 'Kopieren fehlgeschlagen', variant: 'error' });
                    }
                }}
                className="ms-focus rounded-[6px] border border-black/30 bg-white px-2 py-1 font-display text-[11px] font-semibold"
            >
                {copied ? 'Kopiert' : 'Kopieren'}
            </button>
            {showRegenerate && canRegenerate && !isRunning ? (
                <button
                    type="button"
                    onClick={() => void regenerateLast()}
                    className="ms-focus rounded-[6px] border border-black/30 bg-white px-2 py-1 font-display text-[11px] font-semibold"
                >
                    Erneut generieren
                </button>
            ) : null}
        </div>
    );
}

function isImageMime(mime?: string): boolean {
    return Boolean(mime?.startsWith('image/'));
}

function MessageAttachments({ attachmentIds }: { attachmentIds: string[] }) {
    const persistence = getAssistantPersistence();
    const [items, setItems] = useState<
        Array<{ attachment: ChatAttachment; previewUrl?: string }>
    >([]);
    const previewIdsRef = useRef<string[]>([]);

    useEffect(() => {
        let cancelled = false;
        const previousIds = previewIdsRef.current;
        for (const id of previousIds) revokeAttachmentObjectUrl(id);
        previewIdsRef.current = [];

        async function load() {
            const loaded: Array<{ attachment: ChatAttachment; previewUrl?: string }> = [];
            const previewIds: string[] = [];
            for (const id of attachmentIds) {
                const attachment = persistence.attachments.get(id);
                if (!attachment) continue;
                let previewUrl: string | undefined;
                if (attachment.kind === 'file' && attachment.blobKey && isImageMime(attachment.mime)) {
                    const blob = await persistence.blobs.get(attachment.blobKey);
                    if (blob) {
                        previewUrl = getAttachmentObjectUrl(attachment.id, blob);
                        previewIds.push(attachment.id);
                    }
                }
                loaded.push({ attachment, previewUrl });
            }
            previewIdsRef.current = previewIds;
            if (!cancelled) setItems(loaded);
        }

        void load();
        return () => {
            cancelled = true;
            for (const id of previewIdsRef.current) revokeAttachmentObjectUrl(id);
            previewIdsRef.current = [];
        };
    }, [attachmentIds, persistence.attachments, persistence.blobs]);

    if (!items.length) return null;

    return (
        <div className="mb-2 flex flex-col gap-2">
            {items.map(({ attachment, previewUrl }) => (
                <div
                    key={attachment.id}
                    className="overflow-hidden rounded-[8px] border border-black/20 bg-white/60"
                >
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt={attachment.name}
                            className="max-h-48 w-full object-contain"
                        />
                    ) : (
                        <div className="px-2 py-1.5 text-[12px]">
                            <span className="font-medium">{attachment.name}</span>
                            <span className="ml-1 text-[var(--color-ink-muted)]">
                                {attachment.kind === 'file' ? 'Datei' : 'Text'}
                            </span>
                        </div>
                    )}
                    {previewUrl ? (
                        <p className="truncate border-t border-black/10 px-2 py-1 text-[11px] text-[var(--color-ink-muted)]">
                            {attachment.name}
                        </p>
                    ) : null}
                </div>
            ))}
        </div>
    );
}

function MessageBubble({
    message,
    isLastAssistant,
}: {
    message: StoredMessage;
    isLastAssistant?: boolean;
}) {
    const isUser = message.role === 'user';
    const content = message.content ?? '';
    const attachmentIds = message.attachmentIds ?? [];
    const displayContent =
        attachmentIds.length && content === 'Siehe Anhang.' ? '' : content;
    const sensitive = isUser && displayContent && looksSensitiveContent(displayContent);

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[90%]">
                <div
                    className={`rounded-[12px] border-2 border-black px-3 py-2 text-[14px] leading-relaxed shadow-brutal-sm ${
                        isUser ? 'bg-[var(--color-accent)]' : 'bg-white'
                    }`}
                >
                    {attachmentIds.length ? (
                        <MessageAttachments attachmentIds={attachmentIds} />
                    ) : null}
                    {displayContent ? (
                        isUser ? (
                            <span className="whitespace-pre-wrap">{displayContent}</span>
                        ) : (
                            <AssistantMarkdown content={displayContent} />
                        )
                    ) : null}
                </div>
                {!isUser ? (
                    <MessageActions content={content} showRegenerate={isLastAssistant} />
                ) : null}
                {sensitive ? (
                    <p
                        className="mt-1 rounded-[8px] border border-[var(--color-danger)] bg-[#fff5f5] px-2 py-1 text-[11px] leading-snug text-[var(--color-ink-soft)]"
                        role="note"
                    >
                        Enthält möglicherweise sensible Daten — wird an OpenRouter gesendet.
                    </p>
                ) : null}
            </div>
        </div>
    );
}

function StreamingBubble({ content }: { content: string }) {
    return (
        <div className="flex justify-start">
            <div className="max-w-[90%] rounded-[12px] border-2 border-black bg-white px-3 py-2 text-[14px] leading-relaxed shadow-brutal-sm">
                <AssistantMarkdown content={content} />
                <span
                    className="ml-0.5 inline-block h-4 w-1 animate-pulse bg-[var(--color-ink-muted)]"
                    aria-hidden
                />
            </div>
        </div>
    );
}

function ToolStepCards() {
    const { toolSteps } = useAssistant();
    if (!toolSteps.length) return null;

    return (
        <div className="space-y-2 px-1 py-2">
            {toolSteps.map((step, index) => (
                <div
                    key={step.id}
                    className={`rounded-[10px] border-2 border-black px-3 py-2 shadow-[2px_2px_0_#000] ${
                        step.status === 'error'
                            ? 'bg-[#fff5f5]'
                            : step.status === 'running'
                              ? 'bg-[var(--color-chip)]'
                              : 'bg-white'
                    }`}
                >
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--color-ink-muted)]">
                            Schritt {index + 1} · {TOOL_LABELS[step.name] ?? 'Aktion'}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--color-ink-soft)]">
                            {step.name}
                        </span>
                    </div>
                    {step.summary ? (
                        <p className="mt-1 text-[12px] leading-snug text-[var(--color-ink-soft)]">
                            {step.summary}
                        </p>
                    ) : null}
                    <p className="mt-1 text-[11px] font-medium text-[var(--color-ink-muted)]">
                        {step.status === 'running'
                            ? 'Läuft …'
                            : step.status === 'error'
                              ? 'Fehler / abgebrochen'
                              : 'Fertig'}
                    </p>
                </div>
            ))}
        </div>
    );
}

function TypingIndicator() {
    return (
        <p
            className="mt-3 flex items-center justify-center gap-1 text-[12px] text-[var(--color-ink-muted)]"
            role="status"
            aria-live="polite"
        >
            <span className="inline-flex gap-1" aria-hidden>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-ink-muted)]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-ink-muted)] [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-ink-muted)] [animation-delay:240ms]" />
            </span>
            <span>Assistent denkt nach …</span>
        </p>
    );
}

export function AssistantThreadView() {
    const { thread, isRunning, streamingContent, toolSteps } = useAssistant();
    const bottomRef = useRef<HTMLDivElement>(null);

    // Scroll when transcript/stream/tools change (intentional deps beyond React Compiler hints).
    // biome-ignore lint/correctness/useExhaustiveDependencies: scroll triggers on chat activity
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [thread.messages.length, isRunning, streamingContent, toolSteps.length]);

    const visibleMessages = thread.messages.filter((m) => m.role !== 'tool');
    const lastAssistantId = [...visibleMessages].reverse().find((m) => m.role === 'assistant')?.id;
    const showTyping = isRunning && !streamingContent && toolSteps.length === 0;

    return (
        <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3"
            aria-live="polite"
            aria-relevant="additions text"
        >
            {visibleMessages.length === 0 && !streamingContent ? (
                <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 px-2 text-center">
                    <p className="font-display text-[15px] font-bold">Womit kann ich helfen?</p>
                    <p className="max-w-[300px] text-[13px] text-[var(--color-ink-soft)]">
                        Frag nach Tools, Bereichen oder Favoriten — z. B. „Finde ein IBAN-Tool“.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {visibleMessages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isLastAssistant={msg.id === lastAssistantId}
                        />
                    ))}
                </div>
            )}
            {streamingContent ? (
                <div className="mt-3">
                    <StreamingBubble content={streamingContent} />
                </div>
            ) : null}
            <ToolStepCards />
            {showTyping ? <TypingIndicator /> : null}
            <div ref={bottomRef} />
        </div>
    );
}
