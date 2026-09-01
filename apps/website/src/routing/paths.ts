import {
    type AreaId,
    areas,
    getAreaBySlug,
    getTool,
    getToolBySlug,
    type ToolId,
} from '../data/catalog';
import { CONVERSION_HUB_SLUG, isConversionHubSlug } from './conversion-hub';
import { isVariantStorySlug } from '../data/catalog/variant-stories';
import { getVariantBySlug } from '../tools/variant-registry';

export type AppPage = 'home' | 'area' | 'tool' | 'settings' | 'search' | 'conversion';

export function homePath(): string {
    return '/';
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

export function areaPath(areaId: AreaId): string {
    return `/bereich/${areas[areaId].slug}`;
}

export function conversionHubPath(): string {
    return `/bereich/${areas.bilder.slug}/${CONVERSION_HUB_SLUG}`;
}

export function variantPath(areaId: AreaId, variantSlug: string, toolId: ToolId): string {
    const tool = getTool(toolId);
    return `/bereich/${areas[areaId].slug}/${variantSlug}/${tool.slug}`;
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
    toolId: ToolId | null;
    variantSlug: string | null;
    tags: string[];
};

function homeRoute(): ParsedRoute {
    return {
        page: 'home',
        areaId: null,
        toolId: null,
        variantSlug: null,
        tags: [],
    };
}

/**
 * Tool-shortcut aliases only (legacy HEIC links → conversion variants).
 */
export function getRedirectTarget(pathname: string, search: string): string | null {
    const toolShortcut = pathname.match(/^\/tool\/([^/]+)$/);
    if (toolShortcut) {
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

    return null;
}

export function parsePathname(pathname: string, search: string): ParsedRoute {
    const tags = parseTagsParam(new URLSearchParams(search).get('tags'));

    if (pathname === '/' || pathname === '') {
        return homeRoute();
    }
    if (pathname === '/favoriten') {
        return homeRoute();
    }
    if (pathname === '/einstellungen') {
        return {
            page: 'settings',
            areaId: null,
            toolId: null,
            variantSlug: null,
            tags: [],
        };
    }
    if (pathname === '/suche') {
        return {
            page: 'search',
            areaId: null,
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
        return {
            page: 'tool',
            areaId,
            toolId: tool.id,
            variantSlug: null,
            tags: [],
        };
    }

    const bereichMatch = pathname.match(/^\/bereich\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?$/);
    if (!bereichMatch) {
        return homeRoute();
    }

    const [, areaSlug, midSlug, toolSlug] = bereichMatch;
    const area = getAreaBySlug(areaSlug);
    if (!area) return homeRoute();

    if (!midSlug) {
        return {
            page: 'area',
            areaId: area.id,
            toolId: null,
            variantSlug: null,
            tags,
        };
    }

    if (!toolSlug) {
        if (isConversionHubSlug(area.id, midSlug)) {
            return {
                page: 'conversion',
                areaId: area.id,
                toolId: null,
                variantSlug: null,
                tags,
            };
        }
        return {
            page: 'area',
            areaId: area.id,
            toolId: null,
            variantSlug: null,
            tags,
        };
    }

    if (isVariantStorySlug(midSlug)) {
        const tool = getToolBySlug(toolSlug);
        const variant = getVariantBySlug(midSlug);
        if (variant && tool && variant.toolId === tool.id && tool.areas.includes(area.id)) {
            return {
                page: 'tool',
                areaId: area.id,
                toolId: tool.id,
                variantSlug: midSlug,
                tags: [],
            };
        }
    }

    return {
        page: 'area',
        areaId: area.id,
        toolId: null,
        variantSlug: null,
        tags,
    };
}

export function isTagFilterRoute(page: AppPage): boolean {
    return page === 'area';
}

export { getVariantBySlug };
