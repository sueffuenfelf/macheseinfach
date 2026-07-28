import type { ReactNode } from 'react';
import type { ToolDefinition } from '../../../data/catalog/types';

/**
 * Thin layout helper for file → settings → download tools.
 * Prefer existing `_shared/image/*` and `_shared/pdf/*` pipelines for real work —
 * this shell only standardizes page chrome so category fleets stay consistent.
 */
export type FilePipelineToolShellProps = {
    tool: ToolDefinition;
    /** Dropzone / file picker region */
    dropzone: ReactNode;
    /** Optional settings panel (quality, pages, …) */
    settings?: ReactNode;
    /** Preview or progress */
    preview?: ReactNode;
    /** Primary actions (download, continue) */
    actions?: ReactNode;
    intro?: string;
};

export function FilePipelineToolShell({
    tool: _tool,
    dropzone,
    settings,
    preview,
    actions,
    intro,
}: FilePipelineToolShellProps) {
    return (
        <div className="ms-animate-fade mx-auto w-full max-w-3xl space-y-4 px-4 py-6 md:px-6">
            {intro ? (
                <p className="text-[14px] leading-snug text-[var(--color-ink-soft)]">{intro}</p>
            ) : null}
            {dropzone}
            {settings}
            {preview}
            {actions}
        </div>
    );
}
