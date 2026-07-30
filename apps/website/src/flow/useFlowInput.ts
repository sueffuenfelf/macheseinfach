import { useCallback, useState } from 'react';
import { consumeToolFilePrefill } from '../assistant/tool-prefill';
import type { FlowStepBindings, ToolId } from '../data/catalog/types';
import type { FlowSlotValue } from './context-types';
import { useFlowContext } from './FlowContextProvider';
import { decodeFile, encodeForSlot } from './slot-codec';

export type ToolInputSource<T> =
    | {
          source: 'flow';
          value: T;
          locked: true;
          slotId: string;
          editInFlow: () => void;
      }
    | {
          source: 'local';
          value: T | null;
          setValue: (v: T | null) => void;
      };

export type FlowBindingMeta = {
    toolId: ToolId;
    inputKey: string;
    slotId: string;
    slotLabel: string | null;
};

/**
 * Resolve binding for a tool input key from stepBindings (no React).
 * Used by hooks and tests.
 */
export function resolveBindingSlotId(
    stepBindings: FlowStepBindings | undefined,
    toolId: ToolId,
    inputKey: string,
): string | undefined {
    return stepBindings?.[toolId]?.[inputKey];
}

/**
 * Pflicht-Hook für Shells und Bespoke-Tools.
 * Fallback local nur wenn: kein Provider ODER kein Binding ODER Slot leer
 *   (dann: lokales Input sichtbar; bei setValue optional zurück in Slot schreiben wenn Binding existiert).
 *
 * Pre-filled slots (local still null) → locked Chip path.
 * Active local edits keep the input visible even after write-through (avoids mid-keystroke Chip flip).
 */
export function useFlowInput<T>(
    toolId: ToolId,
    inputKey: string,
    decode: (slot: FlowSlotValue) => T | null,
): ToolInputSource<T> {
    const ctx = useFlowContext();
    const [local, setLocal] = useState<T | null>(() => {
        if (decode === decodeFile) {
            return (consumeToolFilePrefill(toolId) as T | null) ?? null;
        }
        return null;
    });

    const slotId = resolveBindingSlotId(ctx?.stepBindings, toolId, inputKey);

    const writeThrough = useCallback(
        (v: T | null) => {
            setLocal(v);
            if (!ctx || !slotId) return;
            if (v == null) {
                ctx.clearSlot(slotId);
                return;
            }
            ctx.setSlot(slotId, encodeForSlot(ctx.schema, slotId, v));
        },
        [ctx, slotId],
    );

    if (ctx && slotId) {
        const raw = ctx.getSlot(slotId);
        const value = raw ? decode(raw) : null;
        // Filled from Vorhaben (or another tool) and user hasn't started a local edit session
        if (value != null && local == null) {
            return {
                source: 'flow',
                value,
                locked: true,
                slotId,
                editInFlow: () => ctx.focusSlotEditor(slotId),
            };
        }
        return {
            source: 'local',
            value: local,
            setValue: writeThrough,
        };
    }

    return {
        source: 'local',
        value: local,
        setValue: setLocal,
    };
}

/** Read binding meta without consuming slot value. */
export function useOptionalFlowBinding(toolId: ToolId, inputKey: string): FlowBindingMeta | null {
    const ctx = useFlowContext();
    const slotId = resolveBindingSlotId(ctx?.stepBindings, toolId, inputKey);
    if (!ctx || !slotId) return null;
    const slot = ctx.schema.slots.find((s) => s.id === slotId);
    return {
        toolId,
        inputKey,
        slotId,
        slotLabel: slot?.label ?? null,
    };
}

/** Direct slot access for Flow UI (ContextBar), not Tools. */
export function useFlowSlot(slotId: string): {
    value: FlowSlotValue;
    setValue: (v: FlowSlotValue) => void;
    clear: () => void;
    focusEditor: () => void;
} | null {
    const ctx = useFlowContext();
    if (!ctx) return null;
    return {
        value: ctx.getSlot(slotId),
        setValue: (v) => ctx.setSlot(slotId, v),
        clear: () => ctx.clearSlot(slotId),
        focusEditor: () => ctx.focusSlotEditor(slotId),
    };
}
