import {
    type AreaDefinition,
    allTools,
    areas,
    getTool,
    type ToolDefinition,
    type ToolId,
    toolsInArea,
} from '../data/catalog';
import { toolBelongsToLanding, visibleLandingAreaIds } from './landing-areas';

export const LANDING_TOOL_LIMIT = 24;

export type LandingOptions = {
    areas: AreaDefinition[];
    tools: ToolDefinition[];
};

export function toolMatchesLandingQuery(tool: ToolDefinition, normalizedQuery: string): boolean {
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

export function areaMatchesLandingQuery(area: AreaDefinition, normalizedQuery: string): boolean {
    if (!normalizedQuery) return true;
    if (area.label.toLowerCase().includes(normalizedQuery)) return true;
    if (area.shortLabel.toLowerCase().includes(normalizedQuery)) return true;
    if (area.description.toLowerCase().includes(normalizedQuery)) return true;
    return toolsInArea(area.id).some((tool) => toolMatchesLandingQuery(tool, normalizedQuery));
}

function uniqueTools(tools: readonly ToolDefinition[]): ToolDefinition[] {
    const seen = new Set<string>();
    const next: ToolDefinition[] = [];
    for (const tool of tools) {
        if (seen.has(tool.id)) continue;
        seen.add(tool.id);
        next.push(tool);
    }
    return next;
}

export function resolveLandingOptions(query: string): LandingOptions {
    const normalized = query.trim().toLowerCase();
    const areasOut = visibleLandingAreaIds()
        .map((id) => areas[id])
        .filter((area) => areaMatchesLandingQuery(area, normalized));

    if (!normalized) {
        return { areas: areasOut, tools: [] };
    }

    const tools = uniqueTools(
        allTools.filter(
            (tool) =>
                toolBelongsToLanding(tool) &&
                tool.maturity !== 'planned' &&
                toolMatchesLandingQuery(tool, normalized),
        ),
    )
        .sort((a, b) => a.shortTitle.localeCompare(b.shortTitle, 'de'))
        .slice(0, LANDING_TOOL_LIMIT);

    return { areas: areasOut, tools };
}

export function landingRecentTools(recentIds: readonly ToolId[], query: string): ToolDefinition[] {
    const normalized = query.trim().toLowerCase();
    const out: ToolDefinition[] = [];
    const seen = new Set<string>();

    for (const id of recentIds) {
        const tool = getTool(id);
        if (!tool || !toolBelongsToLanding(tool) || seen.has(tool.id)) continue;
        if (normalized && !toolMatchesLandingQuery(tool, normalized)) continue;
        seen.add(tool.id);
        out.push(tool);
    }

    return out;
}
