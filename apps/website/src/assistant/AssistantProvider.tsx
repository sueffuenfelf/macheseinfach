import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import {
    runAssistantTurn,
    type AssistantEvent,
    type AssistantThread,
    type AttachmentRef,
    type ChatAttachment,
    type StoredMessage,
    type ThreadIndexEntry,
    type ToolHit,
    type UserInputRequest,
} from '@macheseinfach/assistant-core';
import { createOpenRouterClient, OpenRouterError } from '@macheseinfach/openrouter';
import { usePlatform } from '../context/PlatformContext';
import { getTool } from '../data/catalog';
import { usePlatformNav } from '../routing/usePlatformNav';
import { useToast } from '../shell/toast';
import {
    AssistantInputRequestModal,
    type InputRequestState,
} from './AssistantInputRequestModal';
import {
    addComposerAttachments,
    createAssistantHost,
    fulfillUserInputRequest,
    removeThreadAttachment,
} from './toolHost';
import { createThread, getAssistantPersistence, listThreadAttachments } from './persistence';
import { buildActiveFlowContext } from './flow-context';
import {
    ASSISTANT_SETTINGS_CHANGED_EVENT,
    readAssistantSettings,
    writeAssistantSettings,
    type AssistantSettings,
} from './settings';

type ToolStep = {
    id: string;
    name: string;
    status: 'running' | 'done' | 'error';
    summary?: string;
};

type AssistantContextValue = {
    settings: AssistantSettings;
    updateSettings: (patch: Partial<AssistantSettings>) => void;
    thread: AssistantThread;
    threads: ThreadIndexEntry[];
    attachments: ChatAttachment[];
    isOpen: boolean;
    isMinimized: boolean;
    isRunning: boolean;
    error: string | null;
    toolSteps: ToolStep[];
    streamingContent: string | null;
    canRetry: boolean;
    canRegenerate: boolean;
    openPanel: () => void;
    closePanel: () => void;
    toggleMinimized: () => void;
    sendMessage: (text: string) => Promise<void>;
    retryTurn: () => Promise<void>;
    regenerateLast: () => Promise<void>;
    stopGeneration: () => void;
    attachFiles: (files: FileList | File[] | null) => Promise<void>;
    removeAttachment: (attachmentId: string) => void;
    clearError: () => void;
    newThread: () => void;
    selectThread: (threadId: string) => void;
    deleteThread: (threadId: string) => void;
    favoriteHits: ToolHit[];
};

const AssistantContext = createContext<AssistantContextValue | null>(null);

function isAbortError(error: unknown): boolean {
    return (
        (error instanceof DOMException && error.name === 'AbortError') ||
        (error instanceof Error && error.name === 'AbortError')
    );
}

function deriveThreadTitle(thread: AssistantThread): string {
    const firstUser = thread.messages.find((m) => m.role === 'user' && m.content?.trim());
    if (firstUser?.content) {
        const trimmed = firstUser.content.trim();
        return trimmed.length > 48 ? `${trimmed.slice(0, 45)}…` : trimmed;
    }
    return 'Neuer Chat';
}

function openRouterErrorDe(error: unknown): string {
    if (error instanceof OpenRouterError) {
        if (error.status === 401) {
            return 'OpenRouter API-Key ungültig oder fehlend. Bitte in den Einstellungen prüfen.';
        }
        if (error.status === 429) {
            return 'Zu viele Anfragen bei OpenRouter. Bitte kurz warten und erneut versuchen.';
        }
        if (error.status === 0 || error.status >= 500) {
            return 'Netzwerkfehler oder OpenRouter nicht erreichbar. Bitte Verbindung prüfen.';
        }
        return `OpenRouter-Fehler (${error.status}): ${error.message}`;
    }
    if (error instanceof Error) {
        if (error.message.toLowerCase().includes('fetch')) {
            return 'Netzwerkfehler — OpenRouter nicht erreichbar.';
        }
        return error.message;
    }
    return 'Unbekannter Fehler bei der Anfrage.';
}

function summarizeToolResult(name: string, result: string): string | undefined {
    if (
        name !== 'run_tool' &&
        name !== 'request_user_input' &&
        name !== 'attach_from_chat' &&
        name !== 'open_tool' &&
        name !== 'open_flow'
    ) {
        return undefined;
    }
    try {
        const parsed = JSON.parse(result) as Record<string, unknown>;
        if (parsed.cancelled === true) return 'Abgebrochen';
        if (typeof parsed.summary === 'string') return parsed.summary;
        if (typeof parsed.error === 'string') return parsed.error;
        if (name === 'request_user_input' && typeof parsed.attachmentId === 'string') {
            return `Anhang ${parsed.name ?? parsed.attachmentId}`;
        }
        if (typeof parsed.ok === 'boolean') {
            return parsed.ok ? 'Erfolgreich' : 'Fehlgeschlagen';
        }
    } catch {
        return undefined;
    }
    return undefined;
}

function loadThreadIndex(persistence: ReturnType<typeof getAssistantPersistence>): ThreadIndexEntry[] {
    return persistence.threadIndex.list();
}

export function AssistantProvider({ children }: { children: ReactNode }) {
    const platform = usePlatform();
    const nav = usePlatformNav();
    const { toast } = useToast();
    const persistence = useMemo(() => getAssistantPersistence(), []);

    const [settings, setSettings] = useState<AssistantSettings>(() => readAssistantSettings());
    const [thread, setThread] = useState<AssistantThread>(() => {
        const existing = persistence.threadIndex.list()[0];
        if (existing) {
            return persistence.threads.get(existing.id) ?? createThread();
        }
        return createThread();
    });
    const [threads, setThreads] = useState<ThreadIndexEntry[]>(() => loadThreadIndex(persistence));
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toolSteps, setToolSteps] = useState<ToolStep[]>([]);
    const [streamingContent, setStreamingContent] = useState<string | null>(null);
    const [canRetry, setCanRetry] = useState(false);
    const [inputRequest, setInputRequest] = useState<InputRequestState | null>(null);
    const threadRef = useRef(thread);
    threadRef.current = thread;
    const abortRef = useRef<AbortController | null>(null);
    const streamingRef = useRef<string | null>(null);
    streamingRef.current = streamingContent;

    const refreshThreadIndex = useCallback(() => {
        setThreads(loadThreadIndex(persistence));
    }, [persistence]);

    const attachments = useMemo(
        () => listThreadAttachments(thread),
        [thread, thread.attachmentIds.length],
    );

    const canRegenerate = useMemo(() => {
        if (isRunning) return false;
        const msgs = thread.messages;
        for (let i = msgs.length - 1; i >= 0; i -= 1) {
            if (msgs[i]?.role === 'assistant' && msgs[i]?.content?.trim()) return true;
            if (msgs[i]?.role === 'user') return false;
        }
        return false;
    }, [isRunning, thread.messages]);

    const updateThreadState = useCallback((next: AssistantThread) => {
        threadRef.current = next;
        setThread(next);
    }, []);

    const persistThread = useCallback(
        (next: AssistantThread) => {
            const titled: AssistantThread = {
                ...next,
                title: deriveThreadTitle(next),
                updatedAt: Date.now(),
            };
            persistence.threads.save(titled);
            persistence.threadIndex.upsert({
                id: titled.id,
                title: titled.title,
                updatedAt: titled.updatedAt,
            });
            updateThreadState(titled);
            refreshThreadIndex();
        },
        [persistence, refreshThreadIndex, updateThreadState],
    );

    const patchThread = useCallback(
        (patch: Partial<AssistantThread>) => {
            const next: AssistantThread = {
                ...threadRef.current,
                ...patch,
                updatedAt: Date.now(),
            };
            updateThreadState(next);
            persistThread(next);
        },
        [persistThread, updateThreadState],
    );

    const favoriteHits = useMemo<ToolHit[]>(() => {
        return platform.favorites
            .map((id) => {
                const t = getTool(id);
                if (!t) return null;
                return {
                    id: t.id,
                    title: t.shortTitle || t.title,
                    sub: t.sub,
                    areaId: t.areas[0],
                    tags: [...t.tags],
                };
            })
            .filter((h): h is ToolHit => h !== null);
    }, [platform.favorites]);

    const activeFlow = useMemo(
        () => buildActiveFlowContext(platform.activeStoryId),
        [platform.activeStoryId],
    );

    const requestUserInput = useCallback(
        (req: UserInputRequest): Promise<AttachmentRef | { cancelled: true }> => {
            return new Promise((resolve) => {
                setInputRequest({
                    request: req,
                    resolve: async (result) => {
                        setInputRequest(null);
                        if ('cancelled' in result) {
                            resolve({ cancelled: true });
                            return;
                        }
                        try {
                            const ref = await fulfillUserInputRequest(
                                {
                                    persistence,
                                    getThread: () => threadRef.current,
                                    updateThread: (patch) => patchThread(patch),
                                },
                                req,
                                result,
                            );
                            resolve(ref);
                        } catch (err) {
                            const msg =
                                err instanceof Error ? err.message : 'Eingabe fehlgeschlagen.';
                            setError(msg);
                            toast({ message: msg, variant: 'error' });
                            resolve({ cancelled: true });
                        }
                    },
                });
            });
        },
        [patchThread, persistence, toast],
    );

    const host = useMemo(
        () =>
            createAssistantHost({
                favoriteIds: platform.favorites,
                selectTool: nav.selectTool,
                navigateToTool: nav.selectTool,
                selectStory: nav.selectStory,
                persistence,
                getThread: () => threadRef.current,
                updateThread: (patch) => patchThread(patch),
                requestUserInput,
            }),
        [
            nav.selectStory,
            nav.selectTool,
            patchThread,
            persistence,
            platform.favorites,
            requestUserInput,
        ],
    );

    const finishAbort = useCallback(() => {
        const partial = streamingRef.current?.trim();
        streamingRef.current = null;
        abortRef.current = null;
        if (partial) {
            const stored: StoredMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `${partial}\n\n_(Antwort abgebrochen)_`,
                createdAt: Date.now(),
            };
            const next: AssistantThread = {
                ...threadRef.current,
                messages: [...threadRef.current.messages, stored],
                updatedAt: Date.now(),
            };
            persistThread(next);
        }
        setStreamingContent(null);
        setIsRunning(false);
        setCanRetry(false);
        setToolSteps((prev) =>
            prev.map((s) =>
                s.status === 'running' ? { ...s, status: 'error', summary: 'Abgebrochen' } : s,
            ),
        );
    }, [persistThread]);

    const reportError = useCallback(
        (err: unknown) => {
            if (isAbortError(err)) {
                finishAbort();
                return;
            }
            const msg = openRouterErrorDe(err);
            setError(msg);
            setCanRetry(true);
            setIsRunning(false);
            setStreamingContent(null);
            abortRef.current = null;
            toast({ message: msg, variant: 'error' });
        },
        [finishAbort, toast],
    );

    const handleEvent = useCallback(
        (event: AssistantEvent) => {
            if (event.type === 'stream') {
                setStreamingContent((prev) => `${prev ?? ''}${event.content}`);
            }
            if (event.type === 'tool_start') {
                setStreamingContent(null);
                setToolSteps((prev) => [
                    ...prev,
                    { id: event.toolCallId, name: event.name, status: 'running' },
                ]);
            }
            if (event.type === 'tool_end') {
                const summary = summarizeToolResult(event.name, event.result);
                let status: ToolStep['status'] = 'done';
                try {
                    const parsed = JSON.parse(event.result) as {
                        ok?: boolean;
                        cancelled?: boolean;
                    };
                    if (parsed.cancelled === true) status = 'error';
                    if (parsed.ok === false) status = 'error';
                } catch {
                    /* ignore */
                }
                setToolSteps((prev) =>
                    prev.map((s) =>
                        s.id === event.toolCallId
                            ? { ...s, status, summary: summary ?? s.summary }
                            : s,
                    ),
                );
            }
            if (
                event.type === 'assistant_message' ||
                event.type === 'tool_end' ||
                event.type === 'done'
            ) {
                const snapshot = structuredClone(threadRef.current);
                threadRef.current = snapshot;
                setThread(snapshot);
                if (event.type === 'done') {
                    persistThread(snapshot);
                }
            }
            if (event.type === 'assistant_message') {
                setStreamingContent(null);
            }
            if (event.type === 'done') {
                setIsRunning(false);
                setCanRetry(false);
                abortRef.current = null;
            }
            if (event.type === 'error') {
                reportError(event.error);
            }
        },
        [persistThread, reportError],
    );

    const runTurn = useCallback(async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const client = createOpenRouterClient({
            apiKey: settings.openRouterApiKey,
            defaultHeaders: {
                'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
                'X-Title': 'macheseinfa.ch Assistent',
            },
        });

        await runAssistantTurn({
            client,
            model: settings.model,
            thread: threadRef.current,
            host,
            favorites: favoriteHits,
            attachments: listThreadAttachments(threadRef.current),
            activeFlow,
            onEvent: handleEvent,
            stream: true,
            signal: controller.signal,
        });
    }, [
        activeFlow,
        favoriteHits,
        handleEvent,
        host,
        settings.model,
        settings.openRouterApiKey,
    ]);

    const sendMessage = useCallback(
        async (text: string) => {
            const trimmed = text.trim();
            if (!trimmed || isRunning) return;

            if (!settings.openRouterApiKey.trim()) {
                const msg =
                    'Bitte zuerst einen OpenRouter API-Key in den Einstellungen hinterlegen.';
                setError(msg);
                toast({ message: msg, variant: 'error' });
                return;
            }

            setError(null);
            setCanRetry(false);
            setToolSteps([]);
            setStreamingContent(null);
            setIsRunning(true);

            const userMessage: StoredMessage = {
                id: crypto.randomUUID(),
                role: 'user',
                content: trimmed,
                createdAt: Date.now(),
                attachmentIds: threadRef.current.attachmentIds.length
                    ? [...threadRef.current.attachmentIds]
                    : undefined,
            };

            const workingThread: AssistantThread = {
                ...threadRef.current,
                messages: [...threadRef.current.messages, userMessage],
                updatedAt: Date.now(),
            };
            threadRef.current = workingThread;
            setThread(workingThread);
            persistThread(workingThread);

            try {
                await runTurn();
            } catch (err) {
                // Abort is handled via the loop's error event → reportError/finishAbort.
                if (!isAbortError(err)) reportError(err);
            }
        },
        [isRunning, persistThread, reportError, runTurn, settings.openRouterApiKey, toast],
    );

    const retryTurn = useCallback(async () => {
        if (!canRetry || isRunning || !settings.openRouterApiKey.trim()) return;
        setError(null);
        setCanRetry(false);
        setToolSteps([]);
        setStreamingContent(null);
        setIsRunning(true);
        try {
            await runTurn();
        } catch (err) {
            if (!isAbortError(err)) reportError(err);
        }
    }, [canRetry, isRunning, reportError, runTurn, settings.openRouterApiKey]);

    const regenerateLast = useCallback(async () => {
        if (isRunning || !settings.openRouterApiKey.trim()) return;
        const msgs = threadRef.current.messages;
        let lastUser = -1;
        for (let i = msgs.length - 1; i >= 0; i -= 1) {
            if (msgs[i]?.role === 'user') {
                lastUser = i;
                break;
            }
        }
        if (lastUser < 0) return;

        const next: AssistantThread = {
            ...threadRef.current,
            messages: msgs.slice(0, lastUser + 1),
            updatedAt: Date.now(),
        };
        persistThread(next);

        setError(null);
        setCanRetry(false);
        setToolSteps([]);
        setStreamingContent(null);
        setIsRunning(true);
        try {
            await runTurn();
        } catch (err) {
            if (!isAbortError(err)) reportError(err);
        }
    }, [isRunning, persistThread, reportError, runTurn, settings.openRouterApiKey]);

    const stopGeneration = useCallback(() => {
        if (!abortRef.current) return;
        abortRef.current.abort();
    }, []);

    const attachFiles = useCallback(
        async (files: FileList | File[] | null) => {
            if (!files?.length) return;
            const list = [...files];
            await addComposerAttachments(
                {
                    persistence,
                    getThread: () => threadRef.current,
                    updateThread: (patch) => patchThread(patch),
                },
                list,
            );
        },
        [patchThread, persistence],
    );

    const removeAttachment = useCallback(
        (attachmentId: string) => {
            removeThreadAttachment(
                {
                    persistence,
                    getThread: () => threadRef.current,
                    updateThread: (patch) => patchThread(patch),
                },
                attachmentId,
            );
        },
        [patchThread, persistence],
    );

    const newThread = useCallback(() => {
        if (isRunning) stopGeneration();
        const next = createThread();
        persistThread(next);
        setError(null);
        setCanRetry(false);
        setToolSteps([]);
        setStreamingContent(null);
    }, [isRunning, persistThread, stopGeneration]);

    const selectThread = useCallback(
        (threadId: string) => {
            if (threadId === threadRef.current.id) return;
            if (isRunning) stopGeneration();
            const loaded = persistence.threads.get(threadId);
            if (!loaded) return;
            updateThreadState(loaded);
            setError(null);
            setCanRetry(false);
            setToolSteps([]);
            setStreamingContent(null);
        },
        [isRunning, persistence.threads, stopGeneration, updateThreadState],
    );

    const deleteThread = useCallback(
        (threadId: string) => {
            if (isRunning && threadRef.current.id === threadId) stopGeneration();
            persistence.threads.delete(threadId);
            persistence.threadIndex.remove(threadId);
            refreshThreadIndex();
            if (threadRef.current.id === threadId) {
                const remaining = persistence.threadIndex.list()[0];
                if (remaining) {
                    const loaded = persistence.threads.get(remaining.id);
                    updateThreadState(loaded ?? createThread());
                } else {
                    persistThread(createThread());
                }
            }
            setError(null);
            setToolSteps([]);
            setStreamingContent(null);
        },
        [
            isRunning,
            persistThread,
            persistence.threadIndex,
            persistence.threads,
            refreshThreadIndex,
            stopGeneration,
            updateThreadState,
        ],
    );

    useEffect(() => {
        const refresh = () => setSettings(readAssistantSettings());
        const onStorage = (e: StorageEvent) => {
            if (e.key === 'msf.assistant.settings' || e.key === 'msf.settings.openRouterApiKey') {
                refresh();
            }
        };
        window.addEventListener('storage', onStorage);
        window.addEventListener(ASSISTANT_SETTINGS_CHANGED_EVENT, refresh);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener(ASSISTANT_SETTINGS_CHANGED_EVENT, refresh);
        };
    }, []);

    const value = useMemo<AssistantContextValue>(
        () => ({
            settings,
            updateSettings: (patch) => {
                const next = writeAssistantSettings(patch);
                setSettings(next);
            },
            thread,
            threads,
            attachments,
            isOpen,
            isMinimized,
            isRunning,
            error,
            toolSteps,
            streamingContent,
            canRetry,
            canRegenerate,
            openPanel: () => {
                setIsOpen(true);
                setIsMinimized(false);
            },
            closePanel: () => setIsOpen(false),
            toggleMinimized: () => setIsMinimized((v) => !v),
            sendMessage,
            retryTurn,
            regenerateLast,
            stopGeneration,
            attachFiles,
            removeAttachment,
            clearError: () => {
                setError(null);
                setCanRetry(false);
            },
            newThread,
            selectThread,
            deleteThread,
            favoriteHits,
        }),
        [
            settings,
            thread,
            threads,
            attachments,
            isOpen,
            isMinimized,
            isRunning,
            error,
            toolSteps,
            streamingContent,
            canRetry,
            canRegenerate,
            sendMessage,
            retryTurn,
            regenerateLast,
            stopGeneration,
            attachFiles,
            removeAttachment,
            newThread,
            selectThread,
            deleteThread,
            favoriteHits,
        ],
    );

    return (
        <AssistantContext.Provider value={value}>
            {children}
            <AssistantInputRequestModal state={inputRequest} />
        </AssistantContext.Provider>
    );
}

export function useAssistant(): AssistantContextValue {
    const ctx = useContext(AssistantContext);
    if (!ctx) throw new Error('useAssistant must be used within AssistantProvider');
    return ctx;
}
