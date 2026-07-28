import { afterEach, describe, expect, test } from 'bun:test';
import type { FlowSlotDef } from '../data/catalog/types';
import { FlowBlobStore } from './blob-store';
import { isFlowWorkspaceEnabled } from './feature-flag';
import {
    clearScalarSlot,
    persistScalarSlot,
    readScalarSlot,
    resolvePersistPolicy,
} from './scalar-persist';

describe('isFlowWorkspaceEnabled', () => {
    test('defaults to true', () => {
        expect(isFlowWorkspaceEnabled()).toBe(true);
    });
});

describe('resolvePersistPolicy', () => {
    test('password always never', () => {
        const slot: FlowSlotDef = {
            id: 'pw',
            kind: 'password',
            label: 'Passwort',
            persist: 'session-scalar',
        };
        expect(resolvePersistPolicy(slot)).toBe('never');
    });

    test('text defaults to session-scalar', () => {
        const slot: FlowSlotDef = { id: 't', kind: 'text', label: 'Text' };
        expect(resolvePersistPolicy(slot)).toBe('session-scalar');
    });

    test('file defaults to memory', () => {
        const slot: FlowSlotDef = { id: 'f', kind: 'file', label: 'Datei' };
        expect(resolvePersistPolicy(slot)).toBe('memory');
    });
});

describe('scalar persist', () => {
    const flowId = 'story-test-scalar';
    const textSlot: FlowSlotDef = { id: 'note', kind: 'text', label: 'Notiz' };
    const passwordSlot: FlowSlotDef = {
        id: 'secret',
        kind: 'password',
        label: 'Geheim',
        persist: 'never',
    };

    afterEach(() => {
        clearScalarSlot(flowId, textSlot.id);
        clearScalarSlot(flowId, passwordSlot.id);
    });

    test('persists session-scalar text', () => {
        persistScalarSlot(flowId, textSlot, { kind: 'text', value: 'hallo' });
        expect(readScalarSlot(flowId, textSlot)).toEqual({ kind: 'text', value: 'hallo' });
    });

    test('never persists password', () => {
        persistScalarSlot(flowId, passwordSlot, { kind: 'password', value: 's3cret' });
        expect(readScalarSlot(flowId, passwordSlot)).toBeNull();
    });
});

describe('FlowBlobStore', () => {
    test('stores file and revokes object URL on clear', () => {
        const store = new FlowBlobStore();
        const file = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });
        const set = store.set('flow-a', 'source', {
            kind: 'file',
            file,
            name: file.name,
            byteSize: file.size,
        });
        expect(set?.kind).toBe('file');
        if (set?.kind === 'file') {
            expect(set.objectUrl).toBeTruthy();
        }
        store.clearSlot('flow-a', 'source');
        expect(store.get('flow-a', 'source')).toBeNull();
    });

    test('clearFlow removes all slots for flowId', () => {
        const store = new FlowBlobStore();
        const file = new File(['x'], 'a.png', { type: 'image/png' });
        store.set('flow-b', 'photo', {
            kind: 'image',
            file,
            name: file.name,
            byteSize: file.size,
        });
        store.set('flow-other', 'photo', {
            kind: 'image',
            file,
            name: file.name,
            byteSize: file.size,
        });
        store.clearFlow('flow-b');
        expect(store.get('flow-b', 'photo')).toBeNull();
        expect(store.get('flow-other', 'photo')).not.toBeNull();
        store.clearFlow('flow-other');
    });
});
