import type { ToolDefinition } from '../../../data/catalog/types';
import { defineTool, type ToolCatalogInput, type ToolModule } from '../../types';
import { CalcToolShell } from './CalcToolShell';
import type { CalcResult, FieldDef, FieldValues } from './types';

export type CalcToolDefinition = {
    catalog: ToolCatalogInput;
    fields: readonly FieldDef[];
    compute: (values: FieldValues) => CalcResult;
    debounceMs?: number;
    intro?: string;
};

/** Wire a calc definition into discovery — no bespoke page component needed. */
export function defineCalcTool(def: CalcToolDefinition, expectedId?: string): ToolModule {
    function Page({ tool }: { tool: ToolDefinition }) {
        return (
            <CalcToolShell
                tool={tool}
                fields={def.fields}
                compute={def.compute}
                debounceMs={def.debounceMs}
                intro={def.intro}
            />
        );
    }
    return defineTool(
        {
            catalog: def.catalog,
            page: Page,
            shell: { kind: 'calc', fields: def.fields, compute: def.compute },
        },
        expectedId,
    );
}
