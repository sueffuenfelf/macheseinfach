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
import { getVariantStoryBySlug, isVariantStorySlug } from '../data/catalog/variant-stories';
import { getVariantBySlug } from '../tools/variant-registry';

export type AppPage =
    | 'home'
    | 'workspace'
    | 'area'
    | 'story'
    | 'tool'
    | 'favorites'
    | 'settings'
    | 'search';

export function homePath(): string {
    return '/';
}

export function favoritesPath(): string {
    return '/favoriten';
}

export function settingsPath(): string {
    return '/einstellungen';
}

export function searchPath(query?: string): string {
    if (!query?.trim()) return '/suche';
    return `/suche?q=${encodeURIComponent(query.trim())}`;
}

export function parseSearchQuery(search: string): string {
    return new URLSearchParams(search).get('q')?.trim() ?? '';
}

export function workspacePath(workspaceId: string): string {
    return `/arbeitsbereich/${workspaceId}`;
}

export function newWorkspacePath(template?: string): string {
    if (!template?.trim()) return '/arbeitsbereich/neu';
    return `/arbeitsbereich/neu?template=${encodeURIComponent(template)}`;
}

export function parseWorkspaceTemplate(search: string): string | null {
    const template = new URLSearchParams(search).get('template');
    return template?.trim() || null;
}

export function areaPath(areaId: AreaId): string {
    return `/bereich/${areas[areaId].slug}`;
}

export function storyPath(areaId: AreaId, storyId: StoryId, tags?: readonly string[]): string {
    const base = `/bereich/${areas[areaId].slug}/${stories[storyId].slug}`;
    if (!tags?.length) return base;
    return `${base}?tags=${encodeURIComponent(tags.join(','))}`;
}

export function variantPath(areaId: AreaId, variantSlug: string, toolId: ToolId): string {
    const tool = getTool(toolId);
    return `/bereich/${areas[areaId].slug}/${variantSlug}/${tool.slug}`;
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
    variantSlug: string | null;
    tags: string[];
};

function resolveStoryFromSlug(storySlug: string) {
    const catalogStory = getStoryBySlug(storySlug);
    if (catalogStory) return catalogStory;
    return getVariantStoryBySlug(storySlug);
}

/** Legacy redirects — `/tool/heic-convert` and variant shortlinks */
export function getRedirectTarget(pathname: string, search: string): string | null {
    const toolShortcut = pathname.match(/^\/tool\/([^/]+)$/);
    if (!toolShortcut) return null;

    const slug = toolShortcut[1];

    if (slug === 'heic-convert') {
        const params = new URLSearchParams(search);
        const to = params.get('to');
        if (to === 'png') return variantPath('bilder', 'heic-zu-png', 'image-convert');
        return variantPath('bilder', 'heic-zu-jpg', 'image-convert');
    }

    const variant = getVariantBySlug(slug);
    if (variant) {
        return variantPath('bilder', variant.slug, variant.toolId);
    }

    return null;
}

export function parsePathname(pathname: string, search: string): ParsedRoute {
    const tags = parseTagsParam(new URLSearchParams(search).get('tags'));

    if (pathname === '/' || pathname === '') {
        return {
            page: 'home',
            workspaceId: null,
            areaId: null,
            storyId: null,
            toolId: null,
            variantSlug: null,
            tags: [],
        };
    }
    if (pathname === '/favoriten') {
        return {
            page: 'favorites',
            workspaceId: null,
            areaId: null,
            storyId: null,
            toolId: null,
            variantSlug: null,
            tags: [],
        };
    }
    if (pathname === '/einstellungen') {
        return {
            page: 'settings',
            workspaceId: null,
            areaId: null,
            storyId: null,
            toolId: null,
            variantSlug: null,
            tags: [],
        };
    }
    if (pathname === '/suche') {
        return {
            page: 'search',
            workspaceId: null,
            areaId: null,
            storyId: null,
            toolId: null,
            variantSlug: null,
            tags: [],
        };
    }
    const workspaceMatch = pathname.match(/^\/arbeitsbereich\/([^/]+)$/);
    if (workspaceMatch) {
        return {
            page: 'workspace',
            workspaceId: workspaceMatch[1],
            areaId: null,
            storyId: null,
            toolId: null,
            variantSlug: null,
            tags: [],
        };
    }

    const redirect = getRedirectTarget(pathname, search);
    if (redirect) {
        return parsePathname(redirect, '');
    }

    const toolShortcut = pathname.match(/^\/tool\/([^/]+)$/);
    if (toolShortcut) {
        const tool = getToolBySlug(toolShortcut[1]);
        if (!tool)
            return {
                page: 'home',
                workspaceId: null,
                areaId: null,
                storyId: null,
                toolId: null,
                variantSlug: null,
                tags: [],
            };
        const areaId = tool.areas[0] ?? null;
        const storyId = tool.storyIds[0] ?? null;
        return {
            page: 'tool',
            workspaceId: null,
            areaId,
            storyId,
            toolId: tool.id,
            variantSlug: null,
            tags: [],
        };
    }

    const bereichMatch = pathname.match(/^\/bereich\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?$/);
    if (!bereichMatch) {
        return {
            page: 'home',
            workspaceId: null,
            areaId: null,
            storyId: null,
            toolId: null,
            variantSlug: null,
            tags: [],
        };
    }

    const [, areaSlug, storySlug, toolSlug] = bereichMatch;
    const area = getAreaBySlug(areaSlug);
    if (!area)
        return {
            page: 'home',
            workspaceId: null,
            areaId: null,
            storyId: null,
            toolId: null,
            variantSlug: null,
            tags: [],
        };

    if (!storySlug) {
        return {
            page: 'area',
            workspaceId: null,
            areaId: area.id,
            storyId: null,
            toolId: null,
            variantSlug: null,
            tags,
        };
    }

    const story = resolveStoryFromSlug(storySlug);
    if (!story || !story.areaIds.includes(area.id)) {
        return {
            page: 'area',
            workspaceId: null,
            areaId: area.id,
            storyId: null,
            toolId: null,
            variantSlug: null,
            tags,
        };
    }

    if (!toolSlug) {
        return {
            page: 'story',
            workspaceId: null,
            areaId: area.id,
            storyId: story.id as StoryId,
            toolId: null,
            variantSlug: isVariantStorySlug(storySlug) ? storySlug : null,
            tags,
        };
    }

    const tool = getToolBySlug(toolSlug);
    if (!tool) {
        return {
            page: 'story',
            workspaceId: null,
            areaId: area.id,
            storyId: story.id as StoryId,
            toolId: null,
            variantSlug: null,
            tags,
        };
    }

    const isVariantRoute = isVariantStorySlug(storySlug);
    if (isVariantRoute) {
        const variant = getVariantBySlug(storySlug);
        if (variant && variant.toolId === tool.id && tool.areas.includes(area.id)) {
            return {
                page: 'tool',
                workspaceId: null,
                areaId: area.id,
                storyId: story.id as StoryId,
                toolId: tool.id,
                variantSlug: storySlug,
                tags: [],
            };
        }
    }

    if (!tool.storyIds.includes(story.id as StoryId) || !tool.areas.includes(area.id)) {
        const storyTools = toolsForStory(story.id as StoryId);
        if (storyTools.length === 1) {
            return {
                page: 'tool',
                workspaceId: null,
                areaId: area.id,
                storyId: story.id as StoryId,
                toolId: storyTools[0].id,
                variantSlug: null,
                tags,
            };
        }
        return {
            page: 'story',
            workspaceId: null,
            areaId: area.id,
            storyId: story.id as StoryId,
            toolId: null,
            variantSlug: null,
            tags,
        };
    }

    return {
        page: 'tool',
        workspaceId: null,
        areaId: area.id,
        storyId: story.id as StoryId,
        toolId: tool.id,
        variantSlug: isVariantRoute ? storySlug : null,
        tags: [],
    };
}

export function isTagFilterRoute(page: AppPage): boolean {
    return page === 'area' || page === 'story';
}

export { getVariantBySlug };
