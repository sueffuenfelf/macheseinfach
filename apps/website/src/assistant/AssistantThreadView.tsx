import { useEffect, useRef } from 'react';
import type { StoredMessage } from '@macheseinfach/assistant-core';
import { useAssistant } from './AssistantProvider';
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

function MessageBubble({ message }: { message: StoredMessage }) {
    const isUser = message.role === 'user';
    const content = message.content ?? '';
    const sensitive = isUser && looksSensitiveContent(content);

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[90%]">
                <div
                    className={`rounded-[12px] border-2 border-black px-3 py-2 text-[14px] leading-relaxed shadow-brutal-sm ${
                        isUser ? 'bg-[var(--color-accent)]' : 'bg-white'
                    }`}
                >
                    {content}
                </div>
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
            <div
                className="max-w-[90%] rounded-[12px] border-2 border-black bg-white px-3 py-2 text-[14px] leading-relaxed shadow-brutal-sm"
            >
                {content}
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
                <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-ink-muted)] [animation-delay:120ms]"
                />
                <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-ink-muted)] [animation-delay:240ms]"
                />
            </span>
            <span>Assistent denkt nach …</span>
        </p>
    );
}

export function AssistantThreadView() {
    const { thread, isRunning, streamingContent, toolSteps } = useAssistant();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [thread.messages.length, isRunning, streamingContent, toolSteps.length]);

    const visibleMessages = thread.messages.filter((m) => m.role !== 'tool');
    const showTyping = isRunning && !streamingContent && toolSteps.length === 0;

    return (
        <div
            className="min-h-0 flex-1 overflow-y-auto px-3 py-3"
            aria-live="polite"
            aria-relevant="additions text"
        >
            {visibleMessages.length === 0 && !streamingContent ? (
                <p className="px-1 text-center text-[13px] text-[var(--color-ink-soft)]">
                    Frag nach Tools, Bereichen oder deinen Favoriten — z. B. „Finde ein IBAN-Tool“.
                </p>
            ) : (
                <div className="space-y-3">
                    {visibleMessages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))}
                </div>
            )}
            {streamingContent ? <StreamingBubble content={streamingContent} /> : null}
            <ToolStepCards />
            {showTyping ? <TypingIndicator /> : null}
            <div ref={bottomRef} />
        </div>
    );
}
