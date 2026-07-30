import type { ReactNode } from 'react';
import type { ToolDefinition } from '../../../data/catalog/types';
import { FlowBoundChip } from '../../../flow/FlowBoundChip';
import { useFlowContext } from '../../../flow/FlowContextProvider';
import { chipLabelFromSlot, decodeFile } from '../../../flow/slot-codec';
import { useFlowInput } from '../../../flow/useFlowInput';
import { ToolStickyFooterLayout } from '../ToolStickyFooter';

/**
 * Thin editor layout: canvas/preview + optional sticky footer.
 * History belongs in `useUndoRedo`; PDF/image engines stay in `_shared/pdf|image`.
 *
 * When `fileInputKey` is bound and filled, optional `dropzone` is replaced by a Chip.
 */
export type EditorToolShellProps = {
    tool: ToolDefinition;
    children: ReactNode;
    footer?: ReactNode;
    toolbar?: ReactNode;
    maxWidthClass?: string;
    /** Optional upload region — hidden when flow-bound + filled */
    dropzone?: ReactNode;
    /**
     * stepBindings input key (default `file`).
     * Also accepts `pdf` / `image` when tools bind those keys.
     */
    fileInputKey?: string;
    contextInject?: { fileInputKey?: string };
};

export function EditorToolShell({
    tool,
    children,
    footer,
    toolbar,
    maxWidthClass = 'max-w-[1040px]',
    dropzone,
    fileInputKey,
    contextInject,
}: EditorToolShellProps) {
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
        <ToolStickyFooterLayout footer={footer} maxWidthClass={maxWidthClass}>
            {toolbar ? <div className="mb-3">{toolbar}</div> : null}
            {bound ? (
                <div className="mb-3">
                    <FlowBoundChip label={bound.label} onEdit={bound.onEdit} />
                </div>
            ) : dropzone ? (
                <div className="mb-3" data-flow-source="local" data-testid="editor-dropzone">
                    {dropzone}
                </div>
            ) : null}
            {children}
        </ToolStickyFooterLayout>
    );
}
