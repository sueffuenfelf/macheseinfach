import type { ToolDefinition } from '../../../data/catalog/types';
import { defineTool, type ToolCatalogInput, type ToolModule } from '../../types';
import { CheckToolShell } from './CheckToolShell';
import type { CheckResult, FieldDef, FieldValues } from './types';

export type CheckToolDefinition = {
    catalog: ToolCatalogInput;
    fields: readonly FieldDef[];
    check: (values: FieldValues) => CheckResult | Promise<CheckResult>;
    submitLabel?: string;
    autoCheck?: boolean;
    autoCheckDelayMs?: number;
    trustNote?: string;
};

export function defineCheckTool(def: CheckToolDefinition, expectedId?: string): ToolModule {
    function Page({ tool }: { tool: ToolDefinition }) {
        return (
            <CheckToolShell
                tool={tool}
                fields={def.fields}
                check={def.check}
                submitLabel={def.submitLabel}
                autoCheck={def.autoCheck}
                autoCheckDelayMs={def.autoCheckDelayMs}
                trustNote={def.trustNote}
            />
        );
    }
    return defineTool(
        {
            catalog: def.catalog,
            page: Page,
            shell: { kind: 'check', fields: def.fields, check: def.check },
        },
        expectedId,
    );
}
