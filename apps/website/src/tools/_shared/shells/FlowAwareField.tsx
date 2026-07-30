import type { ToolId } from '../../../data/catalog/types';
import { FlowBoundChip } from '../../../flow/FlowBoundChip';
import { decodeFormString } from '../../../flow/slot-codec';
import { useFlowInput } from '../../../flow/useFlowInput';
import { FieldRenderer } from './fields';
import type { FieldDef } from './types';

type FlowAwareFieldProps = {
    toolId: ToolId;
    field: FieldDef;
    /** Local form value (used when source === 'local') */
    value: string;
    onChange: (next: string) => void;
    idPrefix?: string;
};

/**
 * Field control that hides the primary input when the flow slot is filled.
 */
export function FlowAwareField({ toolId, field, value, onChange, idPrefix }: FlowAwareFieldProps) {
    const input = useFlowInput(toolId, field.id, decodeFormString);

    if (input.source === 'flow') {
        return <FlowBoundChip label={input.value} onEdit={input.editInFlow} />;
    }

    return (
        <div data-flow-source="local" data-flow-field={field.id}>
            <FieldRenderer
                field={field}
                value={value}
                onChange={(next) => {
                    input.setValue(next.trim().length > 0 ? next : null);
                    onChange(next);
                }}
                idPrefix={idPrefix}
            />
        </div>
    );
}
