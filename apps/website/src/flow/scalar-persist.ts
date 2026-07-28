import type { FlowSlotDef, FlowSlotKind, FlowSlotPersist } from '../data/catalog/types';
import { defaultPersistForKind } from '../data/catalog/types';
import type { FlowSlotValue } from './context-types';

const STORAGE_PREFIX = 'msf.flow.scalar.v1';

/** Fallback when sessionStorage is unavailable (e.g. Bun unit tests). */
const memoryScalars = new Map<string, string>();

function storageKey(flowId: string, slotId: string): string {
    return `${STORAGE_PREFIX}:${flowId}:${slotId}`;
}

function storageGet(key: string): string | null {
    try {
        if (typeof sessionStorage !== 'undefined') {
            return sessionStorage.getItem(key);
        }
    } catch {
        // private mode
    }
    return memoryScalars.get(key) ?? null;
}

function storageSet(key: string, value: string): void {
    try {
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(key, value);
            return;
        }
    } catch {
        // fall through to memory
    }
    memoryScalars.set(key, value);
}

function storageRemove(key: string): void {
    try {
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem(key);
        }
    } catch {
        // ignore
    }
    memoryScalars.delete(key);
}

export function resolvePersistPolicy(slot: FlowSlotDef): FlowSlotPersist {
    if (slot.kind === 'password') return 'never';
    return slot.persist ?? defaultPersistForKind(slot.kind);
}

function isSessionScalarKind(kind: FlowSlotKind): boolean {
    return (
        kind === 'text' ||
        kind === 'multiline' ||
        kind === 'currency' ||
        kind === 'iban' ||
        kind === 'url' ||
        kind === 'date' ||
        kind === 'enum' ||
        kind === 'json'
    );
}

type ScalarPersisted =
    | { kind: 'text' | 'multiline' | 'iban' | 'url' | 'date' | 'enum'; value: string }
    | { kind: 'currency'; value: number; raw?: string }
    | { kind: 'json'; value: unknown; raw: string };

function toPersisted(value: NonNullable<FlowSlotValue>): ScalarPersisted | null {
    switch (value.kind) {
        case 'text':
        case 'multiline':
        case 'iban':
        case 'url':
        case 'date':
        case 'enum':
            return { kind: value.kind, value: value.value };
        case 'currency':
            return { kind: 'currency', value: value.value, raw: value.raw };
        case 'json':
            return { kind: 'json', value: value.value, raw: value.raw };
        default:
            return null;
    }
}

/** Persist scalar slot to sessionStorage. Password and blobs never persist. */
export function persistScalarSlot(flowId: string, slot: FlowSlotDef, value: FlowSlotValue): void {
    const policy = resolvePersistPolicy(slot);
    if (policy === 'never' || slot.kind === 'password') {
        clearScalarSlot(flowId, slot.id);
        return;
    }
    if (policy !== 'session-scalar' || !isSessionScalarKind(slot.kind)) {
        return;
    }

    if (value == null) {
        storageRemove(storageKey(flowId, slot.id));
        return;
    }
    const payload = toPersisted(value);
    if (!payload) return;
    storageSet(storageKey(flowId, slot.id), JSON.stringify(payload));
}

export function readScalarSlot(flowId: string, slot: FlowSlotDef): FlowSlotValue {
    const policy = resolvePersistPolicy(slot);
    if (policy === 'never' || slot.kind === 'password' || !isSessionScalarKind(slot.kind)) {
        return null;
    }

    try {
        const raw = storageGet(storageKey(flowId, slot.id));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as ScalarPersisted;
        if (!parsed || parsed.kind !== slot.kind) return null;
        return parsed as FlowSlotValue;
    } catch {
        return null;
    }
}

export function clearScalarSlot(flowId: string, slotId: string): void {
    storageRemove(storageKey(flowId, slotId));
}

export function clearFlowScalars(flowId: string, slots: readonly FlowSlotDef[]): void {
    for (const slot of slots) {
        clearScalarSlot(flowId, slot.id);
    }
}
