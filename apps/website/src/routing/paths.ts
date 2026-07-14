import {
    areas,
    getAreaBySlug,
    getStoryBySlug,
    getTool,
    getToolBySlug,
    stories,
    toolsForStory,
    type AreaId,
    type StoryId,
    type ToolId,
} from '../data/catalog';

export type AppPage = 'home' | 'workspace' | 'area' | 'story' | 'tool' | 'favorites' | 'settings';

export function homePath(): string {
    return '/';
}

export function favoritesPath(): string {
    return '/favoriten';
}

export function settingsPath(): string {
    return '/einstellungen';
}

export function workspacePath(workspaceId: string): string {
    return `/arbeitsbereich/${workspaceId}`;
}

export function areaPath(areaId: AreaId): string {
    return `/bereich/${areas[areaId].slug}`;
}

export function storyPath(areaId: AreaId, storyId: StoryId, tags?: readonly string[]): string {
    const base = `/bereich/${areas[areaId].slug}/${stories[storyId].slug}`;
    if (!tags?.length) return base;
    return `${base}?tags=${encodeURIComponent(tags.join(','))}`;
}

export function toolPath(areaId: AreaId, storyId: StoryId, toolId: ToolId): string {
    const tool = getTool(toolId);
    return `/bereich/${areas[areaId].slug}/${stories[storyId].slug}/${tool.slug}`;
}

export function toolShortcutPath(toolId: ToolId): string {
    return `/tool/${getTool(toolId).slug}`;
}

export function parseTagsParam(raw: string | null): string[] {
    if (!raw?.trim()) return [];
    return raw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
}

export function tagsToSearchParam(tags: readonly string[]): string {
    if (tags.length === 0) return '';
    return `tags=${encodeURIComponent(tags.join(','))}`;
}

export type ParsedRoute = {
    page: AppPage;
    workspaceId: string | null;
    areaId: AreaId | null;
    storyId: StoryId | null;
    toolId: ToolId | null;
    tags: string[];
};

export function parsePathname(pathname: string, search: string): ParsedRoute {
    const tags = parseTagsParam(new URLSearchParams(search).get('tags'));

    if (pathname === '/' || pathname === '') {
        return { page: 'home', workspaceId: null, areaId: null, storyId: null, toolId: null, tags: [] };
    }
    if (pathname === '/favoriten') {
        return { page: 'favorites', workspaceId: null, areaId: null, storyId: null, toolId: null, tags: [] };
    }
    if (pathname === '/einstellungen') {
        return { page: 'settings', workspaceId: null, areaId: null, storyId: null, toolId: null, tags: [] };
    }
    const workspaceMatch = pathname.match(/^\/arbeitsbereich\/([^/]+)$/);
    if (workspaceMatch) {
        return {
            page: 'workspace',
            workspaceId: workspaceMatch[1],
            areaId: null,
            storyId: null,
            toolId: null,
            tags: [],
        };
    }

    const toolShortcut = pathname.match(/^\/tool\/([^/]+)$/);
    if (toolShortcut) {
        const tool = getToolBySlug(toolShortcut[1]);
        if (!tool) return { page: 'home', workspaceId: null, areaId: null, storyId: null, toolId: null, tags: [] };
        const areaId = tool.areas[0] ?? null;
        const storyId = tool.storyIds[0] ?? null;
        return { page: 'tool', workspaceId: null, areaId, storyId, toolId: tool.id, tags: [] };
    }

    const bereichMatch = pathname.match(/^\/bereich\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?$/);
    if (!bereichMatch) {
        return { page: 'home', workspaceId: null, areaId: null, storyId: null, toolId: null, tags: [] };
    }

    const [, areaSlug, storySlug, toolSlug] = bereichMatch;
    const area = getAreaBySlug(areaSlug);
    if (!area) return { page: 'home', workspaceId: null, areaId: null, storyId: null, toolId: null, tags: [] };

    if (!storySlug) {
        return { page: 'area', workspaceId: null, areaId: area.id, storyId: null, toolId: null, tags };
    }

    const story = getStoryBySlug(storySlug);
    if (!story || !story.areaIds.includes(area.id)) {
        return { page: 'area', workspaceId: null, areaId: area.id, storyId: null, toolId: null, tags };
    }

    if (!toolSlug) {
        return { page: 'story', workspaceId: null, areaId: area.id, storyId: story.id, toolId: null, tags };
    }

    const tool = getToolBySlug(toolSlug);
    if (!tool || !tool.storyIds.includes(story.id) || !tool.areas.includes(area.id)) {
        const storyTools = toolsForStory(story.id);
        if (storyTools.length === 1) {
            return { page: 'tool', workspaceId: null, areaId: area.id, storyId: story.id, toolId: storyTools[0].id, tags };
        }
        return { page: 'story', workspaceId: null, areaId: area.id, storyId: story.id, toolId: null, tags };
    }

    return { page: 'tool', workspaceId: null, areaId: area.id, storyId: story.id, toolId: tool.id, tags: [] };
}

export function isTagFilterRoute(page: AppPage): boolean {
    return page === 'area' || page === 'story';
}
