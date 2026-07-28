import type { ReactNode } from 'react';
import type { ToolDefinition } from '../../../data/catalog/types';
import { FlowBoundChip } from '../../../flow/FlowBoundChip';
import { useFlowContext } from '../../../flow/FlowContextProvider';
import { chipLabelFromSlot, decodeFile } from '../../../flow/slot-codec';
import { useFlowInput } from '../../../flow/useFlowInput';

/**
 * Thin layout helper for file → settings → download tools.
 * Prefer existing `_shared/image/*` and `_shared/pdf/*` pipelines for real work —
 * this shell only standardizes page chrome so category fleets stay consistent.
 *
 * When `fileInputKey` is bound and the slot is filled, `dropzone` is hidden
 * and a Vorhaben chip is shown instead (no dual local mirror).
 */
export type FilePipelineToolShellProps = {
    tool: ToolDefinition;
    /** Dropzone / file picker region — omitted when flow-bound + filled */
    dropzone: ReactNode;
    /** Optional settings panel (quality, pages, …) */
    settings?: ReactNode;
    /** Preview or progress */
    preview?: ReactNode;
    /** Primary actions (download, continue) */
    actions?: ReactNode;
    intro?: string;
    /**
     * stepBindings input key (default `file`).
     * Maps to `stepBindings[toolId][fileInputKey]`.
     */
    fileInputKey?: string;
    /** Alias used by plan docs — same as fileInputKey */
    contextInject?: { fileInputKey?: string };
};

export function FilePipelineToolShell({
    tool,
    dropzone,
    settings,
    preview,
    actions,
    intro,
    fileInputKey,
    contextInject,
}: FilePipelineToolShellProps) {
    const inputKey = fileInputKey ?? contextInject?.fileInputKey ?? 'file';
    const file = useFlowInput(tool.id, inputKey, decodeFile);
    const ctx = useFlowContext();

    const bound =
        file.source === 'flow'
            ? {
                  label: (() => {
                      const raw = ctx?.getSlot(file.slotId) ?? null;
                      return raw ? chipLabelFromSlot(raw) : file.value.name;
                  })(),
                  onEdit: file.editInFlow,
              }
            : null;

    return (
        <div className="ms-animate-fade mx-auto w-full max-w-3xl space-y-4 px-4 py-6 md:px-6">
            {intro ? (
                <p className="text-[14px] leading-snug text-[var(--color-ink-soft)]">{intro}</p>
            ) : null}
            {bound ? (
                <FlowBoundChip label={bound.label} onEdit={bound.onEdit} />
            ) : (
                <div data-flow-source="local" data-testid="file-pipeline-dropzone">
                    {dropzone}
                </div>
            )}
            {settings}
            {preview}
            {actions}
        </div>
    );
}

/** Hook helper for pipeline tools that need the effective File. */
export function usePipelineFile(
    toolId: string,
    fileInputKey = 'file',
): {
    source: 'flow' | 'local';
    file: File | null;
    setFile: (f: File | null) => void;
    editInFlow?: () => void;
} {
    const input = useFlowInput(toolId, fileInputKey, decodeFile);
    if (input.source === 'flow') {
        return {
            source: 'flow',
            file: input.value,
            setFile: () => {
                /* locked — use editInFlow */
            },
            editInFlow: input.editInFlow,
        };
    }
    return {
        source: 'local',
        file: input.value,
        setFile: input.setValue,
    };
}
