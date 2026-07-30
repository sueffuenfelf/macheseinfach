import type { FlowSlotValue } from './context-types';

type BlobKey = string;

function key(flowId: string, slotId: string): BlobKey {
    return `${flowId}::${slotId}`;
}

/**
 * In-memory blob/file store keyed by (flowId, slotId).
 * Creates object URLs for file/image slots; revokes on replace, clear, and clearFlow.
 */
export class FlowBlobStore {
    private readonly values = new Map<BlobKey, FlowSlotValue>();
    private readonly objectUrls = new Map<BlobKey, string>();

    get(flowId: string, slotId: string): FlowSlotValue {
        return this.values.get(key(flowId, slotId)) ?? null;
    }

    set(flowId: string, slotId: string, value: FlowSlotValue): FlowSlotValue {
        const k = key(flowId, slotId);
        this.revokeObjectUrl(k);

        if (value == null) {
            this.values.delete(k);
            return null;
        }

        const next = this.withObjectUrl(k, value);
        this.values.set(k, next);
        return next;
    }

    clearSlot(flowId: string, slotId: string): void {
        const k = key(flowId, slotId);
        this.revokeObjectUrl(k);
        this.values.delete(k);
    }

    clearFlow(flowId: string): void {
        const prefix = `${flowId}::`;
        for (const k of [...this.values.keys()]) {
            if (!k.startsWith(prefix)) continue;
            this.revokeObjectUrl(k);
            this.values.delete(k);
        }
    }

    /** Snapshot of non-null slot values for a flow. */
    listSlots(flowId: string): ReadonlyMap<string, NonNullable<FlowSlotValue>> {
        const prefix = `${flowId}::`;
        const out = new Map<string, NonNullable<FlowSlotValue>>();
        for (const [k, v] of this.values) {
            if (!k.startsWith(prefix) || v == null) continue;
            out.set(k.slice(prefix.length), v);
        }
        return out;
    }

    private withObjectUrl(k: BlobKey, value: NonNullable<FlowSlotValue>): FlowSlotValue {
        if (value.kind === 'file' || value.kind === 'image') {
            if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
                const objectUrl = URL.createObjectURL(value.file);
                this.objectUrls.set(k, objectUrl);
                return { ...value, objectUrl };
            }
            return value;
        }
        return value;
    }

    private revokeObjectUrl(k: BlobKey): void {
        const url = this.objectUrls.get(k);
        if (url && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
            URL.revokeObjectURL(url);
        }
        this.objectUrls.delete(k);
    }
}

/** Shared process-wide store (tab session). Providers clear on unmount per flowId. */
export const flowBlobStore = new FlowBlobStore();
