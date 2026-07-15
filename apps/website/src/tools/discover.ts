import type { ComponentType } from 'react';
import type { ToolDefinition, ToolId } from '../data/catalog/types';
import type { ToolWidgetDef } from '../shell/widgets/types';
import type { ToolModule } from './types';

const toolPages = new Map<ToolId, ComponentType<{ tool: ToolDefinition }>>();
const discoveredWidgets: ToolWidgetDef[] = [];
const discoveredIds: string[] = [];
const discoveredTools: Record<string, ToolDefinition> = {};

/**
 * Vite compile-time discovery — `import.meta.glob` is replaced statically at build/dev.
 * It is NOT a runtime API; never guard it with typeof checks (that always fails in the browser).
 */
const modules = import.meta.glob<{ default: ToolModule }>('./*/config.ts', { eager: true });

for (const [path, loaded] of Object.entries(modules)) {
    const match = /^\.\/([^/]+)\/config\.ts$/.exec(path);
    if (!match) continue;

    const folderId = match[1];
    const module = loaded?.default;
    if (!module) {
        throw new Error(`Tool config "${path}" has no default export.`);
    }

    const catalog = module.catalog;
    if (catalog.id !== folderId) {
        throw new Error(`Tool config id mismatch in "${path}": expected "${folderId}", got "${catalog.id}".`);
    }

    discoveredIds.push(folderId);
    discoveredTools[folderId] = { ...catalog, id: folderId };
    if (module.page) {
        toolPages.set(folderId, module.page);
    }

    if (module.widgets?.length) {
        for (const widget of module.widgets) {
            discoveredWidgets.push({
                ...widget,
                toolId: widget.toolId ?? folderId,
            });
        }
    }
}

export type DiscoveryValidationResult = {
    ok: boolean;
    issues: string[];
};

/** Ensures Vite glob discovery produced tools and widgets — catches silent regressions early. */
export function validateDiscovery(): DiscoveryValidationResult {
    const issues: string[] = [];

    if (discoveredIds.length === 0) {
        issues.push(
            'Zero tools discovered. import.meta.glob must be processed by Vite (vite dev / vite build).',
        );
        return { ok: false, issues };
    }

    if (discoveredWidgets.length === 0) {
        issues.push('Zero widgets discovered. Each tools/<id>/config.ts should export widgets[].');
    }

    const widgetIds = new Set<string>();
    for (const widget of discoveredWidgets) {
        if (widgetIds.has(widget.id)) {
            issues.push(`Duplicate widget id "${widget.id}".`);
        }
        widgetIds.add(widget.id);

        if (!widget.toolId || !discoveredTools[widget.toolId]) {
            issues.push(`Widget "${widget.id}" references unknown tool "${widget.toolId ?? '(missing)'}".`);
        }
    }

    for (const toolId of discoveredIds) {
        const widgetCount = discoveredWidgets.filter((widget) => widget.toolId === toolId).length;
        if (widgetCount === 0) {
            issues.push(`Tool "${toolId}" has no widgets — add widgets[] to tools/${toolId}/config.ts.`);
        }
    }

    return { ok: issues.length === 0, issues };
}

export function assertDiscoveryValid(): void {
    const result = validateDiscovery();
    if (!result.ok) {
        throw new Error(`Tool discovery validation failed:\n${result.issues.map((i) => `  - ${i}`).join('\n')}`);
    }
}

assertDiscoveryValid();

export const discoveredToolIds = discoveredIds as readonly string[];
export const tools = discoveredTools as Record<ToolId, ToolDefinition>;
export const discoveredWidgetCount = discoveredWidgets.length;

export function getToolPage(id: ToolId): ComponentType<{ tool: ToolDefinition }> | undefined {
    return toolPages.get(id);
}

export function registerDiscoveredWidgets(registerWidget: (widget: ToolWidgetDef) => void): void {
    for (const widget of discoveredWidgets) {
        registerWidget(widget);
    }
}

export function listDiscoveredWidgets(): readonly ToolWidgetDef[] {
    return discoveredWidgets;
}
