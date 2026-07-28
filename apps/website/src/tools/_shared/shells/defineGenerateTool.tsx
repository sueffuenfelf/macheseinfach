import type { ToolDefinition } from '../../../data/catalog/types';
import { defineTool, type ToolCatalogInput, type ToolModule } from '../../types';
import { GenerateToolShell } from './GenerateToolShell';
import type { FieldDef, FieldValues, GenerateOutput } from './types';

export type GenerateToolDefinition = {
    catalog: ToolCatalogInput;
    fields: readonly FieldDef[];
    generate: (values: FieldValues) => GenerateOutput | Promise<GenerateOutput>;
    isReady?: (values: FieldValues) => boolean;
    outputTitle?: string;
    emptyHint?: string;
};

export function defineGenerateTool(def: GenerateToolDefinition, expectedId?: string): ToolModule {
    function Page({ tool }: { tool: ToolDefinition }) {
        return (
            <GenerateToolShell
                tool={tool}
                fields={def.fields}
                generate={def.generate}
                isReady={def.isReady}
                outputTitle={def.outputTitle}
                emptyHint={def.emptyHint}
            />
        );
    }
    return defineTool({ catalog: def.catalog, page: Page }, expectedId);
}
