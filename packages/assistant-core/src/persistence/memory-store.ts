import type {
    AssistantPersistence,
    AttachmentStore,
    BlobStore,
    ThreadIndexStore,
    ThreadStore,
    AssistantSettingsStore,
} from './ports';
import type { AssistantSettings, AssistantThread, ChatAttachment } from '../types';
import { ASSISTANT_STORAGE_KEYS } from '../types';

const DEFAULT_SETTINGS: AssistantSettings = {
    layoutMode: 'floating',
    openRouterApiKey: '',
    model: 'anthropic/claude-sonnet-4',
    enabled: false,
};

export class InMemorySettingsStore implements AssistantSettingsStore {
    private value: AssistantSettings | null = null;

    get(): AssistantSettings | null {
        return this.value ? { ...this.value } : null;
    }

    set(settings: AssistantSettings): void {
        this.value = { ...settings };
    }

    reset(): void {
        this.value = null;
    }
}

export class InMemoryThreadIndexStore implements ThreadIndexStore {
    private entries = new Map<string, { id: string; title: string; updatedAt: number }>();

    list() {
        return [...this.entries.values()].sort((a, b) => b.updatedAt - a.updatedAt);
    }

    upsert(entry: { id: string; title: string; updatedAt: number }): void {
        this.entries.set(entry.id, { ...entry });
    }

    remove(threadId: string): void {
        this.entries.delete(threadId);
    }
}

export class InMemoryThreadStore implements ThreadStore {
    private threads = new Map<string, AssistantThread>();

    get(threadId: string): AssistantThread | null {
        const thread = this.threads.get(threadId);
        return thread ? structuredClone(thread) : null;
    }

    save(thread: AssistantThread): void {
        this.threads.set(thread.id, structuredClone(thread));
    }

    delete(threadId: string): void {
        this.threads.delete(threadId);
    }
}

export class InMemoryBlobStore implements BlobStore {
    private blobs = new Map<string, Blob>();

    async get(key: string): Promise<Blob | null> {
        return this.blobs.get(key) ?? null;
    }

    async put(key: string, blob: Blob): Promise<void> {
        this.blobs.set(key, blob);
    }

    async delete(key: string): Promise<void> {
        this.blobs.delete(key);
    }
}

export class InMemoryAttachmentStore implements AttachmentStore {
    private attachments = new Map<string, ChatAttachment>();
    private threadAttachments = new Map<string, Set<string>>();

    get(attachmentId: string): ChatAttachment | null {
        const att = this.attachments.get(attachmentId);
        return att ? { ...att } : null;
    }

    save(attachment: ChatAttachment): void {
        this.attachments.set(attachment.id, { ...attachment });
    }

    delete(attachmentId: string): void {
        this.attachments.delete(attachmentId);
        for (const [threadId, ids] of this.threadAttachments) {
            ids.delete(attachmentId);
            if (ids.size === 0) {
                this.threadAttachments.delete(threadId);
            }
        }
    }

    linkToThread(threadId: string, attachmentId: string): void {
        const ids = this.threadAttachments.get(threadId) ?? new Set();
        ids.add(attachmentId);
        this.threadAttachments.set(threadId, ids);
    }

    listByThread(threadId: string): ChatAttachment[] {
        const ids = this.threadAttachments.get(threadId);
        if (!ids) {
            return [];
        }
        return [...ids]
            .map((id) => this.attachments.get(id))
            .filter((a): a is ChatAttachment => a !== undefined);
    }
}

export function createInMemoryPersistence(): AssistantPersistence {
    return {
        settings: new InMemorySettingsStore(),
        threadIndex: new InMemoryThreadIndexStore(),
        threads: new InMemoryThreadStore(),
        blobs: new InMemoryBlobStore(),
        attachments: new InMemoryAttachmentStore(),
    };
}

export function createDefaultSettings(): AssistantSettings {
    return { ...DEFAULT_SETTINGS };
}

export { ASSISTANT_STORAGE_KEYS };
