import type { ComponentType } from 'react';
import type { ToolDefinition, ToolId } from '../data/catalog/types';
import type { ToolShellRuntime } from './shell-runtime';

export type ToolCatalogInput = ToolDefinition & { id: string };

export type ToolVariant = {
    id: string;
    toolId: ToolId;
    slug: string;
    params: Record<string, string>;
    seo: {
        title: string;
        description: string;
        h1: string;
        keywords: string[];
    };
};

export type ToolModule = {
    catalog: ToolCatalogInput;
    page?: ComponentType<{ tool: ToolDefinition }>;
    variants?: () => ToolVariant[];
    /** Headless execution metadata for calc/check/generate/paste shells. */
    shell?: ToolShellRuntime;
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
