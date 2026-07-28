import { useMemo } from 'react';
import type { FlowDefinition, ToolId } from '../data/catalog/types';
import { useFlowContextRequired } from './FlowContextProvider';
import { missingRequiredSlots, nextStepAfter } from './flow-workspace-policy';

type FlowContinueFooterProps = {
    flow: FlowDefinition;
    activeToolId: ToolId | null;
    successToolIds: ReadonlySet<ToolId>;
    onContinue: (toolId: ToolId) => void;
};

/**
 * After tool success (or when next step exists): „Weiter: {label}“.
 * Soft-warn / disable when required context missing.
 */
export function FlowContinueFooter({
    flow,
    activeToolId,
    successToolIds,
    onContinue,
}: FlowContinueFooterProps) {
    const ctx = useFlowContextRequired();

    const next = useMemo(
        () => (activeToolId ? nextStepAfter(flow, activeToolId) : null),
        [activeToolId, flow],
    );

    const missing = missingRequiredSlots(ctx.schema.slots, ctx.getSlot);
    const firstMissing = missing[0] ?? null;
    const softBlocked = Boolean(firstMissing);

    if (!next || !activeToolId) return null;

    const showAfterSuccess = successToolIds.has(activeToolId);
    const label = softBlocked
        ? `Zuerst ${firstMissing?.label ?? 'Eingabe'}`
        : `Weiter: ${next.label}`;

    return (
        <footer
            className="sticky bottom-0 z-20 border-t-2 border-black bg-white px-4 py-3 md:px-5"
            data-testid="flow-continue-footer"
            data-emphasized={showAfterSuccess ? 'true' : undefined}
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[12px] text-[var(--color-ink-soft)]">
                    {showAfterSuccess
                        ? 'Erledigt — weiter zum nächsten Schritt.'
                        : softBlocked
                          ? 'Pflichtfelder in der Ausgangslage fehlen noch.'
                          : 'Zum nächsten Schritt springen.'}
                </p>
                <button
                    type="button"
                    className={`ms-btn ${showAfterSuccess && !softBlocked ? 'bg-black text-white' : ''}`}
                    disabled={softBlocked}
                    aria-disabled={softBlocked}
                    onClick={() => {
                        if (softBlocked) return;
                        onContinue(next.toolId);
                    }}
                >
                    {label}
                </button>
            </div>
        </footer>
    );
}
