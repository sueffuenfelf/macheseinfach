import type { ToolId } from '../../data/catalog/types';
import { registerDiscoveredWidgets } from '../../tools/discover';
import type { ToolWidgetDef } from './types';

const widgets = new Map<string, ToolWidgetDef>();

export function registerToolWidget(def: ToolWidgetDef): void {
    widgets.set(def.id, def);
}

/** Eager registration — runs once when this module loads, after discover.ts validated the glob. */
registerDiscoveredWidgets(registerToolWidget);

export function listToolWidgets(): ToolWidgetDef[] {
    return [...widgets.values()];
}

export function getToolWidget(widgetId: string): ToolWidgetDef | undefined {
    return widgets.get(widgetId);
}

export function listWidgetsForTool(toolId: ToolId): ToolWidgetDef[] {
    return listToolWidgets().filter((widget) => widget.toolId === toolId);
}

/** Prefer compact/quick widgets over launcher-only tiles when adding from a tool page. */
export function getPreferredWidgetForTool(toolId: ToolId): ToolWidgetDef | undefined {
    const matches = listWidgetsForTool(toolId);
    if (matches.length === 0) return undefined;
    const compact = matches.find((widget) => widget.id.includes('-quick') || widget.id.includes('-mini'));
    return compact ?? matches[0];
}
