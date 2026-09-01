import type { ReactNode } from 'react';
import type { ToolDefinition } from '../../../data/catalog/types';
import { ToolStickyFooterLayout } from '../ToolStickyFooter';

export type EditorToolShellProps = {
    tool: ToolDefinition;
    children: ReactNode;
    footer?: ReactNode;
    toolbar?: ReactNode;
    maxWidthClass?: string;
    dropzone?: ReactNode;
    fileInputKey?: string;
    contextInject?: { fileInputKey?: string };
};

export function EditorToolShell({
    children,
    footer,
    toolbar,
    maxWidthClass = 'max-w-[1040px]',
    dropzone,
}: EditorToolShellProps) {
    return (
        <ToolStickyFooterLayout footer={footer} maxWidthClass={maxWidthClass}>
            {toolbar ? <div className="mb-3">{toolbar}</div> : null}
            {dropzone ? (
                <div className="mb-3" data-testid="editor-dropzone">
                    {dropzone}
                </div>
            ) : null}
            {children}
        </ToolStickyFooterLayout>
    );
}
