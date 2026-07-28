import type { ToolDefinition } from '../../../data/catalog/types';
import { defineTool, type ToolCatalogInput, type ToolModule } from '../../types';
import { PasteAnalyzeToolShell } from './PasteAnalyzeToolShell';
import type { PasteFinding } from './types';

export type PasteToolDefinition = {
    catalog: ToolCatalogInput;
    analyze: (input: string) => PasteFinding[] | Promise<PasteFinding[]>;
    placeholder?: string;
    submitLabel?: string;
    allowUrl?: boolean;
    urlHint?: string;
    intro?: string;
};

export function definePasteTool(def: PasteToolDefinition, expectedId?: string): ToolModule {
    function Page({ tool }: { tool: ToolDefinition }) {
        return (
            <PasteAnalyzeToolShell
                tool={tool}
                analyze={def.analyze}
                placeholder={def.placeholder}
                submitLabel={def.submitLabel}
                allowUrl={def.allowUrl}
                urlHint={def.urlHint}
                intro={def.intro}
            />
        );
    }
    return defineTool({ catalog: def.catalog, page: Page }, expectedId);
}
