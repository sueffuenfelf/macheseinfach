import type { FlowDefinition, FlowSlotDef, FlowStep, ToolId } from '../data/catalog/types';
import type { FlowSlotValue } from './context-types';
import { DEFAULT_MAX_FILE_BYTES } from './context-types';
import { isFlowWorkspaceEnabled } from './feature-flag';

/** Multi-step Vorhaben use the split workspace when the flag is on. 1-step stays on legacy UI. */
export function shouldUseFlowWorkspace(flow: FlowDefinition | null | undefined): boolean {
    if (!flow) return false;
    return isFlowWorkspaceEnabled() && flow.steps.length >= 2;
}

export function firstRequiredStep(flow: FlowDefinition): FlowStep {
    const required = flow.steps.find((s) => !s.optional);
    if (required) return required;
    const first = flow.steps[0];
    if (!first) {
        throw new Error(`Flow ${flow.id} has no steps`);
    }
    return first;
}

export function stepIndexForTool(flow: FlowDefinition, toolId: ToolId): number {
    return flow.steps.findIndex((s) => s.toolId === toolId);
}

export function isSideQuestTool(flow: FlowDefinition, toolId: ToolId): boolean {
    if (flow.steps.some((s) => s.toolId === toolId)) return false;
    return (flow.recommended ?? []).some((r) => r.toolId === toolId);
}

export function nextStepAfter(flow: FlowDefinition, toolId: ToolId): FlowStep | null {
    const idx = stepIndexForTool(flow, toolId);
    if (idx < 0) return null;
    return flow.steps[idx + 1] ?? null;
}

/** Required steps only — optional + recommended excluded from progress. */
export function requiredSteps(flow: FlowDefinition): readonly FlowStep[] {
    return flow.steps.filter((s) => !s.optional);
}

export function stepProgress(
    flow: FlowDefinition,
    visitedOrSuccess: ReadonlySet<ToolId>,
): { done: number; total: number } {
    const req = requiredSteps(flow);
    const done = req.filter((s) => visitedOrSuccess.has(s.toolId)).length;
    return { done, total: req.length };
}

export function isSlotFilled(value: FlowSlotValue): boolean {
    if (value == null) return false;
    switch (value.kind) {
        case 'files':
            return value.files.length > 0;
        case 'text':
        case 'multiline':
        case 'iban':
        case 'url':
        case 'date':
        case 'password':
        case 'enum':
            return value.value.trim().length > 0;
        case 'json':
            return value.raw.trim().length > 0;
        case 'currency':
            return Number.isFinite(value.value);
        case 'file':
        case 'image':
            return Boolean(value.file);
        default:
            return false;
    }
}

export function missingRequiredSlots(
    slots: readonly FlowSlotDef[],
    getSlot: (slotId: string) => FlowSlotValue,
): FlowSlotDef[] {
    return slots.filter((s) => s.required && !isSlotFilled(getSlot(s.id)));
}

export function hasAnySlotSet(
    slots: readonly FlowSlotDef[],
    getSlot: (slotId: string) => FlowSlotValue,
): boolean {
    return slots.some((s) => isSlotFilled(getSlot(s.id)));
}

/** Returns DE error message or null if ok. */
export function validateFileForSlot(slot: FlowSlotDef, file: File): string | null {
    const max = slot.accept?.maxBytes ?? DEFAULT_MAX_FILE_BYTES;
    if (file.size > max) {
        const mb = Math.round(max / (1024 * 1024));
        return `Datei zu groß (max. ${mb} MB)`;
    }

    const accept = slot.accept;
    if (!accept) return null;

    const nameLower = file.name.toLowerCase();
    const extOk =
        !accept.ext?.length || accept.ext.some((ext) => nameLower.endsWith(ext.toLowerCase()));

    const mimeOk =
        !accept.mime?.length ||
        accept.mime.some((pattern) => {
            if (pattern.endsWith('/*')) {
                const prefix = pattern.slice(0, -1);
                return file.type.startsWith(prefix);
            }
            return file.type === pattern;
        });

    if (accept.ext?.length && accept.mime?.length) {
        if (!extOk && !mimeOk) {
            return `Dateityp nicht erlaubt (${accept.ext.join(', ')})`;
        }
        return null;
    }
    if (accept.ext?.length && !extOk) {
        return `Dateityp nicht erlaubt (${accept.ext.join(', ')})`;
    }
    if (accept.mime?.length && !mimeOk) {
        return `Dateityp nicht erlaubt (${accept.mime.join(', ')})`;
    }
    return null;
}
