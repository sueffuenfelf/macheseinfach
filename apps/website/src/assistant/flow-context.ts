import { stories, type StoryId } from '../data/catalog';
import { flowBlobStore } from '../flow/blob-store';
import { readScalarSlot } from '../flow/scalar-persist';
import type { ActiveFlowContext } from '@macheseinfach/assistant-core';

function slotIsSet(flowId: string, slotId: string): boolean {
    const fromBlob = flowBlobStore.get(flowId, slotId);
    if (fromBlob != null) return true;
    const story = stories[flowId as keyof typeof stories];
    const slotDef = story?.context.slots.find((s) => s.id === slotId);
    if (!slotDef) return false;
    return readScalarSlot(flowId, slotDef) != null;
}

/** Build active Vorhaben summary for the assistant system prompt. */
export function buildActiveFlowContext(storyId: StoryId | null): ActiveFlowContext | undefined {
    if (!storyId) return undefined;
    const story = stories[storyId as keyof typeof stories];
    if (!story?.context) return undefined;

    return {
        id: story.id,
        title: story.title,
        slots: story.context.slots.map((slot) => ({
            id: slot.id,
            label: slot.label,
            status: slotIsSet(story.id, slot.id) ? 'gesetzt' : 'leer',
        })),
    };
}
