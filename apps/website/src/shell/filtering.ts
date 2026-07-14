import {
    areas,
    getTool,
    storiesInArea,
    toolMatchesTags,
    toolsForStory,
    toolsInArea,
    type AreaId,
    type ToolId,
    type UserStory,
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

export function storyMatchesQuery(story: UserStory, normalizedQuery: string): boolean {
    if (!normalizedQuery) return true;
    const firstTool = toolsForStory(story.id)[0];
    const toolTag = firstTool?.shortTitle ?? 'geplant';
    const haystack = `${story.role} ${story.want} ${story.outcome} ${toolTag}`.toLowerCase();
    if (haystack.includes(normalizedQuery)) return true;
    return toolsForStory(story.id).some(
        (tool) =>
            tool.shortTitle.toLowerCase().includes(normalizedQuery) ||
            tool.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)),
    );
}

export function areaHasMatchingTools(areaId: AreaId, activeTags: readonly string[]): boolean {
    return toolsInArea(areaId).some((t) => toolMatchesTags(t, activeTags));
}

export function filterVisibleAreas(
    areaIds: readonly AreaId[],
    activeTags: readonly string[],
    query: string,
): AreaId[] {
    const normalizedQuery = query.trim().toLowerCase();
    return areaIds.filter(
        (id) => areaHasMatchingTools(id, activeTags) && areaMatchesQuery(id, normalizedQuery),
    );
}

export function filterVisibleStories(
    storyList: readonly UserStory[],
    activeTags: readonly string[],
    query: string,
): UserStory[] {
    const normalizedQuery = query.trim().toLowerCase();
    return storyList.filter((story) => {
        const tools = toolsForStory(story.id);
        if (!tools.some((t) => toolMatchesTags(t, activeTags))) return false;
        return storyMatchesQuery(story, normalizedQuery);
    });
}

export function storiesForAreaFiltered(
    areaId: AreaId,
    activeTags: readonly string[],
    query: string,
): UserStory[] {
    const areaStories = storiesInArea(areaId).filter((story) => story.areaIds.includes(areaId));
    return filterVisibleStories(areaStories, activeTags, query);
}

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
        return (
            tool.shortTitle.toLowerCase().includes(normalizedQuery) ||
            tool.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
        );
    });
}

export function filterToolsForStory(
    storyId: UserStory['id'],
    activeTags: readonly string[],
    query: string,
) {
    const normalizedQuery = query.trim().toLowerCase();
    return toolsForStory(storyId).filter((tool) => {
        if (!toolMatchesTags(tool, activeTags)) return false;
        if (!normalizedQuery) return true;
        return (
            tool.shortTitle.toLowerCase().includes(normalizedQuery) ||
            tool.sub.toLowerCase().includes(normalizedQuery) ||
            tool.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
        );
    });
}
