import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import type { FlowContextSchema, FlowSlotDef, FlowStepBindings } from '../data/catalog/types';
import { flowBlobStore } from './blob-store';
import type { FlowSlotValue } from './context-types';
import {
    clearFlowScalars,
    clearScalarSlot,
    persistScalarSlot,
    readScalarSlot,
    resolvePersistPolicy,
} from './scalar-persist';

export type FlowContextApi = {
    flowId: string;
    schema: FlowContextSchema;
    /** toolId → inputKey → slotId — used by useFlowInput */
    stepBindings: FlowStepBindings;
    getSlot: (slotId: string) => FlowSlotValue;
    setSlot: (slotId: string, value: FlowSlotValue) => void;
    clearSlot: (slotId: string) => void;
    clearAll: () => void;
    /** Focus/scroll hook for ContextBar — stub until P2 UI */
    focusSlotEditor: (slotId: string) => void;
    focusedSlotId: string | null;
};

const FlowContext = createContext<FlowContextApi | null>(null);

function slotDef(schema: FlowContextSchema, slotId: string): FlowSlotDef | undefined {
    return schema.slots.find((s) => s.id === slotId);
}

function hydrateFromPersist(
    flowId: string,
    schema: FlowContextSchema,
): Record<string, FlowSlotValue> {
    const initial: Record<string, FlowSlotValue> = {};
    for (const slot of schema.slots) {
        const fromBlob = flowBlobStore.get(flowId, slot.id);
        if (fromBlob != null) {
            initial[slot.id] = fromBlob;
            continue;
        }
        const fromScalar = readScalarSlot(flowId, slot);
        if (fromScalar != null) {
            initial[slot.id] = fromScalar;
        }
    }
    return initial;
}

export type FlowContextProviderProps = {
    flowId: string;
    schema: FlowContextSchema;
    /** Runtime bindings from FlowDefinition.stepBindings */
    stepBindings?: FlowStepBindings;
    /** Optional initial slot values (tests / soft hydrate before persist) */
    initialSlots?: Readonly<Record<string, FlowSlotValue>>;
    children: ReactNode;
};

/**
 * Shared Vorhaben context. Mount once per flowId (key={flowId} on parent).
 * Tool switches must NOT remount this provider.
 */
export function FlowContextProvider({
    flowId,
    schema,
    stepBindings = {},
    initialSlots,
    children,
}: FlowContextProviderProps) {
    const [slots, setSlots] = useState<Record<string, FlowSlotValue>>(() => ({
        ...hydrateFromPersist(flowId, schema),
        ...(initialSlots ?? {}),
    }));
    const [focusedSlotId, setFocusedSlotId] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            // Revoke blob object URLs for this flow on leave/unmount
            flowBlobStore.clearFlow(flowId);
            // Password slots never persist; clear any lingering scalars that are never-policy
            for (const slot of schema.slots) {
                if (resolvePersistPolicy(slot) === 'never') {
                    clearScalarSlot(flowId, slot.id);
                }
            }
        };
    }, [flowId, schema.slots]);

    const getSlot = useCallback((slotId: string): FlowSlotValue => slots[slotId] ?? null, [slots]);

    const setSlot = useCallback(
        (slotId: string, value: FlowSlotValue) => {
            const def = slotDef(schema, slotId);
            if (!def) return;

            const policy = resolvePersistPolicy(def);
            let stored = value;

            if (
                policy === 'memory' ||
                def.kind === 'file' ||
                def.kind === 'files' ||
                def.kind === 'image'
            ) {
                stored = flowBlobStore.set(flowId, slotId, value);
            } else if (value == null) {
                flowBlobStore.clearSlot(flowId, slotId);
            }

            persistScalarSlot(flowId, def, stored);

            setSlots((prev) => {
                if (stored == null) {
                    const next = { ...prev };
                    delete next[slotId];
                    return next;
                }
                return { ...prev, [slotId]: stored };
            });
        },
        [flowId, schema],
    );

    const clearSlot = useCallback(
        (slotId: string) => {
            flowBlobStore.clearSlot(flowId, slotId);
            clearScalarSlot(flowId, slotId);
            setSlots((prev) => {
                const next = { ...prev };
                delete next[slotId];
                return next;
            });
        },
        [flowId],
    );

    const clearAll = useCallback(() => {
        flowBlobStore.clearFlow(flowId);
        clearFlowScalars(flowId, schema.slots);
        setSlots({});
        setFocusedSlotId(null);
    }, [flowId, schema.slots]);

    const focusSlotEditor = useCallback((slotId: string) => {
        setFocusedSlotId(slotId);
    }, []);

    const value = useMemo<FlowContextApi>(
        () => ({
            flowId,
            schema,
            stepBindings,
            getSlot,
            setSlot,
            clearSlot,
            clearAll,
            focusSlotEditor,
            focusedSlotId,
        }),
        [
            clearAll,
            clearSlot,
            flowId,
            focusSlotEditor,
            focusedSlotId,
            getSlot,
            schema,
            setSlot,
            stepBindings,
        ],
    );

    return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlowContext(): FlowContextApi | null {
    return useContext(FlowContext);
}

export function useFlowContextRequired(): FlowContextApi {
    const ctx = useContext(FlowContext);
    if (!ctx) {
        throw new Error('useFlowContextRequired requires FlowContextProvider');
    }
    return ctx;
}
