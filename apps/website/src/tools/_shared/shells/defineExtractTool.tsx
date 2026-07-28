import type { ToolDefinition } from '../../../data/catalog/types';
import { defineTool, type ToolCatalogInput, type ToolModule } from '../../types';
import { ExtractToolShell } from './ExtractToolShell';
import type { ExtractField } from './types';

export type ExtractToolDefinition = {
    catalog: ToolCatalogInput;
    extract: (input: { text?: string; file?: File }) => ExtractField[] | Promise<ExtractField[]>;
    mode?: 'text' | 'file' | 'both';
    accept?: string;
    placeholder?: string;
    submitLabel?: string;
    emptyHint?: string;
};

export function defineExtractTool(def: ExtractToolDefinition, expectedId?: string): ToolModule {
    function Page({ tool }: { tool: ToolDefinition }) {
        return (
            <ExtractToolShell
                tool={tool}
                extract={def.extract}
                mode={def.mode}
                accept={def.accept}
                placeholder={def.placeholder}
                submitLabel={def.submitLabel}
                emptyHint={def.emptyHint}
            />
        );
    }
    return defineTool({ catalog: def.catalog, page: Page }, expectedId);
}
