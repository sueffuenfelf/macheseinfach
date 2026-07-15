import type { ComponentType } from 'react';
import type { ToolDefinition } from '../data/catalog/types';
import type { ToolWidgetDef } from '../shell/widgets/types';

export type ToolCatalogInput = ToolDefinition & { id: string };

export type ToolWidgetInput = Omit<ToolWidgetDef, 'toolId'> & {
    toolId?: string;
};

export type ToolModule = {
    catalog: ToolCatalogInput;
    page?: ComponentType<{ tool: ToolDefinition }>;
    widgets?: ToolWidgetInput[];
};

export function defineTool(module: ToolModule, expectedId?: string): ToolModule {
    if (!module.catalog.id.trim()) {
        throw new Error('Tool catalog id must not be empty.');
    }
    if (!module.catalog.slug.trim()) {
        throw new Error(`Tool "${module.catalog.id}" slug must not be empty.`);
    }
    if (expectedId && module.catalog.id !== expectedId) {
        throw new Error(`Tool id mismatch: expected "${expectedId}", got "${module.catalog.id}".`);
    }
    return module;
}
