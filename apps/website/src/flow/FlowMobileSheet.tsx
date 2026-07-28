import type { FlowDefinition, ToolId } from '../data/catalog/types';
import { useDismissLayer } from '../shell/useDismissLayer';
import { FlowStepRail } from './FlowStepRail';

type FlowMobileSheetProps = {
    open: boolean;
    onClose: () => void;
    flow: FlowDefinition;
    activeToolId: ToolId | null;
    successToolIds: ReadonlySet<ToolId>;
    onSelectTool: (toolId: ToolId) => void;
};

/** Bottom sheet for Steps + Recommended on viewports &lt; md. */
export function FlowMobileSheet({
    open,
    onClose,
    flow,
    activeToolId,
    successToolIds,
    onSelectTool,
}: FlowMobileSheetProps) {
    useDismissLayer(open, onClose);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col justify-end md:hidden"
            data-testid="flow-mobile-sheet"
        >
            <button
                type="button"
                className="absolute inset-0 bg-black/40"
                aria-label="Schritte schließen"
                onClick={onClose}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Schritte und Empfehlungen"
                className="relative max-h-[78vh] overflow-y-auto rounded-t-[16px] border-2 border-b-0 border-black bg-[var(--color-canvas)] p-4 shadow-[0_-4px_0_#000]"
            >
                <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="font-display text-[16px] font-bold">Schritte</p>
                    <button type="button" className="ms-btn" onClick={onClose}>
                        Schließen
                    </button>
                </div>
                <FlowStepRail
                    flow={flow}
                    activeToolId={activeToolId}
                    successToolIds={successToolIds}
                    compact
                    onSelectTool={(toolId) => {
                        onSelectTool(toolId);
                        onClose();
                    }}
                />
            </div>
        </div>
    );
}
