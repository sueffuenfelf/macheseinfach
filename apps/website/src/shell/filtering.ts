import {
    type AreaId,
    areas,
    getTool,
    type ToolDefinition,
    type ToolId,
    toolMatchesTags,
    toolsInArea,
} from '../data/catalog';

export function areaMatchesQuery(areaId: AreaId, normalizedQuery: string): boolean {
    if (!normalizedQuery) return true;
    const area = areas[areaId];
    if (area.label.toLowerCase().includes(normalizedQuery)) return true;
    if (area.description.toLowerCase().includes(normalizedQuery)) return true;
    return toolsInArea(areaId).some(
        (tool) =>
            tool.shortTitle.toLowerCase().includes(normalizedQuery) ||
            tool.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ||
            tool.keywords.some((k) => k.includes(normalizedQuery)),
    );
}

export function toolMatchesQuery(tool: ToolDefinition, normalizedQuery: string): boolean {
    if (!normalizedQuery) return true;
    return (
        tool.shortTitle.toLowerCase().includes(normalizedQuery) ||
        tool.title.toLowerCase().includes(normalizedQuery) ||
        tool.sub.toLowerCase().includes(normalizedQuery) ||
        tool.pain.toLowerCase().includes(normalizedQuery) ||
        tool.solution.toLowerCase().includes(normalizedQuery) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ||
        tool.keywords.some((keyword) => keyword.includes(normalizedQuery))
    );
}

export { toolMatchesTags };

export function filterRecentTools(
    toolIds: readonly ToolId[],
    activeTags: readonly string[],
    query: string,
): ToolId[] {
    const normalizedQuery = query.trim().toLowerCase();
    return toolIds.filter((toolId) => {
        const tool = getTool(toolId);
        if (!toolMatchesTags(tool, activeTags)) return false;
        if (!normalizedQuery) return true;
        return toolMatchesQuery(tool, normalizedQuery);
    });
}
