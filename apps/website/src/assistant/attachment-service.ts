import type { ChatAttachment } from '@macheseinfach/assistant-core';
import type { AttachmentStore, BlobStore } from '@macheseinfach/assistant-core';
import { idbDeleteBlob, idbGetBlob, idbPutBlob } from './assistant-idb';

const ATTACHMENTS_KEY = 'msf.assistant.attachments';

const objectUrls = new Map<string, string>();
const memoryAttachments = new Map<string, ChatAttachment>();

function readAttachmentMap(): Record<string, ChatAttachment> {
    if (memoryAttachments.size > 0) {
        return Object.fromEntries(memoryAttachments);
    }
    try {
        if (typeof localStorage === 'undefined') return {};
        const raw = localStorage.getItem(ATTACHMENTS_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as Record<string, ChatAttachment>;
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function writeAttachmentMap(map: Record<string, ChatAttachment>): void {
    memoryAttachments.clear();
    for (const [id, att] of Object.entries(map)) {
        memoryAttachments.set(id, att);
    }
    try {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(ATTACHMENTS_KEY, JSON.stringify(map));
    } catch {
        /* quota */
    }
}

/** Test helper — reset attachment memory cache. */
export function resetAssistantAttachmentMemory(): void {
    memoryAttachments.clear();
}

export class AssistantBlobStore implements BlobStore {
    async get(key: string): Promise<Blob | null> {
        return idbGetBlob(key);
    }

    async put(key: string, blob: Blob): Promise<void> {
        await idbPutBlob(key, blob);
    }

    async delete(key: string): Promise<void> {
        await idbDeleteBlob(key);
    }
}

export class AssistantAttachmentStore implements AttachmentStore {
    constructor(
        private readonly getThreadAttachmentIds: (threadId: string) => readonly string[] = () => [],
    ) {}

    get(attachmentId: string): ChatAttachment | null {
        const map = readAttachmentMap();
        const att = map[attachmentId];
        return att ? { ...att } : null;
    }

    save(attachment: ChatAttachment): void {
        const map = readAttachmentMap();
        map[attachment.id] = { ...attachment };
        writeAttachmentMap(map);
    }

    delete(attachmentId: string): void {
        revokeAttachmentObjectUrl(attachmentId);
        const map = readAttachmentMap();
        const existing = map[attachmentId];
        if (existing?.blobKey) {
            void idbDeleteBlob(existing.blobKey);
        }
        delete map[attachmentId];
        writeAttachmentMap(map);
    }

    listByThread(threadId: string): ChatAttachment[] {
        return this.listByIds(this.getThreadAttachmentIds(threadId));
    }

    listByIds(threadAttachmentIds: readonly string[]): ChatAttachment[] {
        const map = readAttachmentMap();
        return threadAttachmentIds
            .map((id) => map[id])
            .filter((a): a is ChatAttachment => a !== undefined)
            .map((a) => ({ ...a }));
    }
}

export function createBlobKey(attachmentId: string): string {
    return `blob:${attachmentId}`;
}

export async function saveFileAttachment(args: {
    store: AttachmentStore;
    blobs: BlobStore;
    threadId: string;
    file: File;
    source: ChatAttachment['source'];
}): Promise<ChatAttachment> {
    const id = crypto.randomUUID();
    const blobKey = createBlobKey(id);
    await args.blobs.put(blobKey, args.file);

    const attachment: ChatAttachment = {
        id,
        kind: 'file',
        name: args.file.name,
        mime: args.file.type || undefined,
        blobKey,
        createdAt: Date.now(),
        source: args.source,
    };
    args.store.save(attachment);
    return attachment;
}

export async function saveTextAttachment(args: {
    store: AttachmentStore;
    text: string;
    name: string;
    source: ChatAttachment['source'];
}): Promise<ChatAttachment> {
    const attachment: ChatAttachment = {
        id: crypto.randomUUID(),
        kind: 'text',
        name: args.name,
        text: args.text,
        createdAt: Date.now(),
        source: args.source,
    };
    args.store.save(attachment);
    return attachment;
}

export function getAttachmentObjectUrl(attachmentId: string, blob: Blob): string {
    revokeAttachmentObjectUrl(attachmentId);
    const url = URL.createObjectURL(blob);
    objectUrls.set(attachmentId, url);
    return url;
}

export function revokeAttachmentObjectUrl(attachmentId: string): void {
    const url = objectUrls.get(attachmentId);
    if (url && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(url);
    }
    objectUrls.delete(attachmentId);
}

export async function attachmentToFile(
    attachment: ChatAttachment,
    blobs: BlobStore,
): Promise<File | null> {
    if (attachment.kind !== 'file' || !attachment.blobKey) return null;
    const blob = await blobs.get(attachment.blobKey);
    if (!blob) return null;
    return new File([blob], attachment.name, {
        type: attachment.mime || blob.type || 'application/octet-stream',
    });
}
