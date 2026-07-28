import type { ReactNode } from 'react';
import type { ToolId } from '../../../data/catalog/types';
import { FlowBoundChip } from '../../../flow/FlowBoundChip';
import { useFlowContext } from '../../../flow/FlowContextProvider';
import { useFlowSession } from '../../../flow/FlowWorkspace';
import { decodeFile } from '../../../flow/slot-codec';
import { useFlowInput } from '../../../flow/useFlowInput';

/**
 * Flow binding helper for image pipeline tools.
 * Filled slot → Chip + File; export can write back into the same slot.
 */
export function useFlowImageFile(toolId: ToolId, inputKey = 'file') {
    const input = useFlowInput(toolId, inputKey, decodeFile);
    const ctx = useFlowContext();
    const session = useFlowSession();

    const boundFile = input.source === 'flow' ? input.value : null;

    function writeBack(blob: Blob, filename: string) {
        if (input.source !== 'flow' || !ctx) return;
        const type = blob.type || 'application/octet-stream';
        const file = new File([blob], filename, { type });
        const slot = ctx.schema.slots.find((s) => s.id === input.slotId);
        const kind = slot?.kind === 'image' ? 'image' : 'file';
        ctx.setSlot(input.slotId, {
            kind,
            file,
            name: file.name,
            byteSize: file.size,
        });
    }

    function reportSuccess() {
        session?.reportToolSuccess(toolId);
    }

    function onLocalFile(file: File | null) {
        if (input.source === 'local') input.setValue(file);
    }

    const chip: ReactNode =
        input.source === 'flow' ? (
            <FlowBoundChip label={input.value.name} onEdit={input.editInFlow} />
        ) : null;

    return {
        bound: input.source === 'flow',
        boundFile,
        chip,
        onLocalFile,
        writeBack,
        reportSuccess,
    };
}
