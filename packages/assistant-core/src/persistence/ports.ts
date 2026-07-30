import type { AssistantThread, AssistantSettings, ChatAttachment } from '../types';

export type ThreadIndexEntry = {
    id: string;
    title: string;
    updatedAt: number;
};

export interface AssistantSettingsStore {
    get(): AssistantSettings | null;
    set(settings: AssistantSettings): void;
}

export interface ThreadIndexStore {
    list(): ThreadIndexEntry[];
    upsert(entry: ThreadIndexEntry): void;
    remove(threadId: string): void;
}

export interface ThreadStore {
    get(threadId: string): AssistantThread | null;
    save(thread: AssistantThread): void;
    delete(threadId: string): void;
}

export interface BlobStore {
    get(key: string): Promise<Blob | null>;
    put(key: string, blob: Blob): Promise<void>;
    delete(key: string): Promise<void>;
}

export interface AttachmentStore {
    get(attachmentId: string): ChatAttachment | null;
    save(attachment: ChatAttachment): void;
    delete(attachmentId: string): void;
    listByThread(threadId: string): ChatAttachment[];
}

export interface AssistantPersistence {
    settings: AssistantSettingsStore;
    threadIndex: ThreadIndexStore;
    threads: ThreadStore;
    blobs: BlobStore;
    attachments: AttachmentStore;
}
