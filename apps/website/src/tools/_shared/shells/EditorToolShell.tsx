import type { ReactNode } from 'react';
import type { ToolDefinition } from '../../../data/catalog/types';
import { ToolStickyFooterLayout } from '../ToolStickyFooter';

/**
 * Thin editor layout: canvas/preview + optional sticky footer.
 * History belongs in `useUndoRedo`; PDF/image engines stay in `_shared/pdf|image`.
 */
export type EditorToolShellProps = {
    tool: ToolDefinition;
    children: ReactNode;
    footer?: ReactNode;
    toolbar?: ReactNode;
    maxWidthClass?: string;
};

export function EditorToolShell({
    tool: _tool,
    children,
    footer,
    toolbar,
    maxWidthClass = 'max-w-[1040px]',
}: EditorToolShellProps) {
    return (
        <ToolStickyFooterLayout footer={footer} maxWidthClass={maxWidthClass}>
            {toolbar ? <div className="mb-3">{toolbar}</div> : null}
            {children}
        </ToolStickyFooterLayout>
    );
}
