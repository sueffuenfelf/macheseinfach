import {
    type AreaId,
    areas,
    getAreaBySlug,
    getStoryBySlug,
    getTool,
    getToolBySlug,
    type StoryId,
    stories,
    type ToolId,
    toolsForStory,
} from '../data/catalog';
import { getVariantStoryBySlug, isVariantStorySlug } from '../data/catalog/variant-stories';
import { getVariantBySlug } from '../tools/variant-registry';

export type AppPage = 'home' | 'area' | 'story' | 'tool' | 'favorites' | 'settings' | 'search' | 'vorhaben';

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

export function vorhabenPath(areaSlug?: string): string {
    if (!areaSlug?.trim()) return '/vorhaben';
    return `/vorhaben?bereich=${encodeURIComponent(areaSlug.trim())}`;
}

export function parseVorhabenAreaParam(search: string): string {
    return new URLSearchParams(search).get('bereich')?.trim() ?? '';
}

export function parseSearchQuery(search: string): string {
    return new URLSearchParams(search).get('q')?.trim() ?? '';
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
    areaId: AreaId | null;
    storyId: StoryId | null;
    toolId: ToolId | null;
    variantSlug: string | null;
    tags: string[];
};

function homeRoute(): ParsedRoute {
    return {
        page: 'home',
        areaId: null,
        storyId: null,
        toolId: null,
        variantSlug: null,
        tags: [],
    };
}

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
        return homeRoute();
    }
    if (pathname === '/favoriten') {
        return {
            page: 'favorites',
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
            areaId: null,
            storyId: null,
            toolId: null,
            variantSlug: null,
            tags: [],
        };
    }
    if (pathname === '/vorhaben') {
        return {
            page: 'vorhaben',
            areaId: null,
            storyId: null,
            toolId: null,
            variantSlug: null,
            tags: [],
        };
    }
    if (pathname.match(/^\/arbeitsbereich\/([^/]+)$/)) {
        return homeRoute();
    }

    const redirect = getRedirectTarget(pathname, search);
    if (redirect) {
        return parsePathname(redirect, '');
    }

    const toolShortcut = pathname.match(/^\/tool\/([^/]+)$/);
    if (toolShortcut) {
        const tool = getToolBySlug(toolShortcut[1]);
        if (!tool) return homeRoute();
        const areaId = tool.areas[0] ?? null;
        const storyId = tool.storyIds[0] ?? null;
        return {
            page: 'tool',
            areaId,
            storyId,
            toolId: tool.id,
            variantSlug: null,
            tags: [],
        };
    }

    const bereichMatch = pathname.match(/^\/bereich\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?$/);
    if (!bereichMatch) {
        return homeRoute();
    }

    const [, areaSlug, storySlug, toolSlug] = bereichMatch;
    const area = getAreaBySlug(areaSlug);
    if (!area) return homeRoute();

    if (!storySlug) {
        return {
            page: 'area',
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
                areaId: area.id,
                storyId: story.id as StoryId,
                toolId: tool.id,
                variantSlug: storySlug,
                tags: [],
            };
        }
    }

    // Allow tools listed on the flow (steps ∪ recommended) even if tool.storyIds
    // does not yet include this story (cross-area side-quests / P3 pilots).
    const flowToolIds = new Set([
        ...story.steps.map((s) => s.toolId),
        ...(story.recommended ?? []).map((r) => r.toolId),
    ]);
    const onThisFlow = flowToolIds.has(tool.id);

    if (
        (!tool.storyIds.includes(story.id as StoryId) && !onThisFlow) ||
        (!tool.areas.includes(area.id) && !onThisFlow)
    ) {
        const storyTools = toolsForStory(story.id as StoryId);
        if (storyTools.length === 1) {
            return {
                page: 'tool',
                areaId: area.id,
                storyId: story.id as StoryId,
                toolId: storyTools[0].id,
                variantSlug: null,
                tags,
            };
        }
        return {
            page: 'story',
            areaId: area.id,
            storyId: story.id as StoryId,
            toolId: null,
            variantSlug: null,
            tags,
        };
    }

    return {
        page: 'tool',
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
