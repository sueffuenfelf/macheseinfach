import type { ToolId } from '../data/catalog/types';
import { useFlowContext } from './FlowContextProvider';
import { decodeFormString } from './slot-codec';
import { resolveBindingSlotId } from './useFlowInput';

/**
 * Merge flow-filled slot values into local form state for compute/check/generate.
 * Does not own local edits — shells keep useState for unbound / empty-slot fields.
 */
export function useFlowMergedFieldValues(
    toolId: ToolId,
    fieldIds: readonly string[],
    local: Record<string, string>,
): Record<string, string> {
    const ctx = useFlowContext();
    if (!ctx) return local;

    const merged = { ...local };
    for (const fieldId of fieldIds) {
        const slotId = resolveBindingSlotId(ctx.stepBindings, toolId, fieldId);
        if (!slotId) continue;
        const decoded = decodeFormString(ctx.getSlot(slotId));
        if (decoded != null) merged[fieldId] = decoded;
    }
    return merged;
}
