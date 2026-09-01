import type { ReactNode } from 'react';
import type { ToolDefinition } from '../../../data/catalog/types';
import { consumeToolFilePrefill } from '../../../assistant/tool-prefill';
import { useState } from 'react';

export type FilePipelineToolShellProps = {
    tool: ToolDefinition;
    dropzone: ReactNode;
    settings?: ReactNode;
    preview?: ReactNode;
    actions?: ReactNode;
    intro?: string;
    fileInputKey?: string;
    contextInject?: { fileInputKey?: string };
};

export function FilePipelineToolShell({
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
            <div data-testid="file-pipeline-dropzone">{dropzone}</div>
            {settings}
            {preview}
            {actions}
        </div>
    );
}

/** Hook helper for pipeline tools that need the effective File. */
export function usePipelineFile(
    toolId: string,
    _fileInputKey = 'file',
): {
    source: 'local';
    file: File | null;
    setFile: (f: File | null) => void;
} {
    const [file, setFile] = useState<File | null>(() => consumeToolFilePrefill(toolId));
    return {
        source: 'local',
        file,
        setFile,
    };
}
