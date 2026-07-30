import {
    ASSISTANT_STORAGE_KEYS,
    type AssistantPersistence,
    type AssistantThread,
    type ChatAttachment,
    type ThreadIndexEntry,
} from '@macheseinfach/assistant-core';
import type {
    AssistantSettingsStore,
    ThreadIndexStore,
    ThreadStore,
} from '@macheseinfach/assistant-core';
import { AssistantAttachmentStore, AssistantBlobStore } from './attachment-service';
import { readAssistantSettings, writeAssistantSettings } from './settings';

const THREADS_KEY = ASSISTANT_STORAGE_KEYS.idbThreads;

function readThreadsMap(): Record<string, AssistantThread> {
    try {
        const raw = localStorage.getItem(THREADS_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as Record<string, AssistantThread>;
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function writeThreadsMap(map: Record<string, AssistantThread>): void {
    try {
        localStorage.setItem(THREADS_KEY, JSON.stringify(map));
    } catch {
        /* quota */
    }
}

class LocalAssistantSettingsStore implements AssistantSettingsStore {
    get() {
        return readAssistantSettings();
    }

    set(settings: ReturnType<typeof readAssistantSettings>) {
        writeAssistantSettings(settings);
    }
}

class LocalThreadIndexStore implements ThreadIndexStore {
    list(): ThreadIndexEntry[] {
        try {
            const raw = localStorage.getItem(ASSISTANT_STORAGE_KEYS.threadIndex);
            if (!raw) return [];
            const parsed = JSON.parse(raw) as ThreadIndexEntry[];
            return Array.isArray(parsed)
                ? [...parsed].sort((a, b) => b.updatedAt - a.updatedAt)
                : [];
        } catch {
            return [];
        }
    }

    upsert(entry: ThreadIndexEntry): void {
        const list = this.list().filter((e) => e.id !== entry.id);
        list.unshift(entry);
        try {
            localStorage.setItem(ASSISTANT_STORAGE_KEYS.threadIndex, JSON.stringify(list));
        } catch {
            /* quota */
        }
    }

    remove(threadId: string): void {
        const list = this.list().filter((e) => e.id !== threadId);
        try {
            localStorage.setItem(ASSISTANT_STORAGE_KEYS.threadIndex, JSON.stringify(list));
        } catch {
            /* quota */
        }
    }
}

class LocalThreadStore implements ThreadStore {
    get(threadId: string): AssistantThread | null {
        const map = readThreadsMap();
        const thread = map[threadId];
        return thread ? structuredClone(thread) : null;
    }

    save(thread: AssistantThread): void {
        const map = readThreadsMap();
        map[thread.id] = structuredClone(thread);
        writeThreadsMap(map);
    }

    delete(threadId: string): void {
        const map = readThreadsMap();
        delete map[threadId];
        writeThreadsMap(map);
    }
}

let persistenceSingleton: AssistantPersistence | null = null;

export function getAssistantPersistence(): AssistantPersistence {
    if (!persistenceSingleton) {
        const threads = new LocalThreadStore();
        persistenceSingleton = {
            settings: new LocalAssistantSettingsStore(),
            threadIndex: new LocalThreadIndexStore(),
            threads,
            blobs: new AssistantBlobStore(),
            attachments: new AssistantAttachmentStore(
                (threadId) => threads.get(threadId)?.attachmentIds ?? [],
            ),
        };
    }
    return persistenceSingleton;
}

export function createThread(title = 'Neuer Chat'): AssistantThread {
    const now = Date.now();
    return {
        id: crypto.randomUUID(),
        title,
        createdAt: now,
        updatedAt: now,
        messages: [],
        attachmentIds: [],
    };
}

export function listThreadAttachments(thread: AssistantThread): ChatAttachment[] {
    return getAssistantPersistence().attachments.listByThread(thread.id);
}
