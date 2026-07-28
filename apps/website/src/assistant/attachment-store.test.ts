import { describe, expect, test } from 'bun:test';
import type { ChatAttachment } from '@macheseinfach/assistant-core';
import {
    AssistantAttachmentStore,
    AssistantBlobStore,
    resetAssistantAttachmentMemory,
    saveFileAttachment,
    saveTextAttachment,
} from './attachment-service';
import { resetAssistantIdbMemory } from './assistant-idb';

describe('Assistant attachment store', () => {
    test('save and load text attachment', async () => {
        resetAssistantAttachmentMemory();
        resetAssistantIdbMemory();
        const store = new AssistantAttachmentStore();
        const attachment = await saveTextAttachment({
            store,
            text: 'Hallo Welt',
            name: 'Notiz',
            source: 'user_prompt',
        });
        expect(attachment.kind).toBe('text');
        expect(store.get(attachment.id)?.text).toBe('Hallo Welt');
    });

    test('save file attachment with blob store', async () => {
        resetAssistantAttachmentMemory();
        resetAssistantIdbMemory();
        const store = new AssistantAttachmentStore();
        const blobs = new AssistantBlobStore();
        const file = new File(['pdf-bytes'], 'test.pdf', { type: 'application/pdf' });
        const attachment = await saveFileAttachment({
            store,
            blobs,
            threadId: 'thread-1',
            file,
            source: 'user_upload',
        });
        expect(attachment.kind).toBe('file');
        expect(attachment.blobKey).toBeTruthy();
        const stored = await blobs.get(attachment.blobKey!);
        expect(stored?.size).toBe(file.size);
    });

    test('listByThread returns linked attachments', () => {
        resetAssistantAttachmentMemory();
        const store = new AssistantAttachmentStore();
        const a: ChatAttachment = {
            id: 'a1',
            kind: 'text',
            name: 'x',
            text: 'y',
            createdAt: 1,
            source: 'user_upload',
        };
        store.save(a);
        const listed = store.listByIds(['a1', 'missing']);
        expect(listed).toHaveLength(1);
        expect(listed[0]?.id).toBe('a1');
    });
});
