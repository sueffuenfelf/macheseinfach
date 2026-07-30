type FlowBoundChipProps = {
    /** Display label — typically filename or scalar preview */
    label: string;
    onEdit: () => void;
};

/**
 * Shown when a tool input is filled from Vorhaben context.
 * Primary input for that slot must NOT render alongside this chip.
 */
export function FlowBoundChip({ label, onEdit }: FlowBoundChipProps) {
    return (
        <div
            className="flex flex-wrap items-center gap-2 rounded-md border-2 border-black bg-white px-3 py-2 text-sm shadow-[2px_2px_0_#000]"
            data-testid="flow-bound-chip"
            data-flow-source="flow"
        >
            <span className="min-w-0 flex-1 break-all">Aus Vorhaben: {label}</span>
            <button type="button" className="ms-btn shrink-0" onClick={onEdit}>
                Ändern
            </button>
        </div>
    );
}
