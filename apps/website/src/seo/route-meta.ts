import {
    areaOrder,
    areas,
    getTool,
    stories,
    type AreaId,
    type StoryId,
    type ToolDefinition,
    type ToolId,
} from '../data/catalog';
import { buildConversionVariants } from '../tools/_shared/image/variants';
import type { ToolVariant } from '../tools/types';
import type { ParsedRoute } from '../routing/paths';
import { getVariantBySlug } from '../tools/variant-registry';
import { DEFAULT_DESCRIPTION, isIndexingDisallowed, isRouteIndexable, SITE_NAME, SITE_URL } from './site-config';

export type RouteMeta = {
    path: string;
    title: string;
    description: string;
    h1?: string;
    canonical: string;
    variant?: ToolVariant;
    noindex?: boolean;
    jsonLd?: Record<string, unknown>[];
};

export function absoluteUrl(path: string, siteUrl: string): string {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${siteUrl}${normalized}`;
}

function toolDescription(tool: ReturnType<typeof getTool>): string {
    if (tool.sub.trim()) return tool.sub;
    return `${tool.pain} ${tool.solution}`.trim();
}

function breadcrumbJsonLd(
    items: { name: string; url: string }[],
): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

function webApplicationJsonLd(meta: RouteMeta): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: meta.variant?.seo.h1 ?? meta.h1 ?? meta.title,
        description: meta.description,
        url: meta.canonical,
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Any',
        inLanguage: 'de-DE',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'EUR',
        },
    };
}

function webPageJsonLd(meta: RouteMeta): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: meta.h1 ?? meta.title,
        description: meta.description,
        url: meta.canonical,
        inLanguage: 'de-DE',
        isPartOf: {
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL,
        },
    };
}

export function metaForVariant(variant: ToolVariant, siteUrl: string): RouteMeta {
    const path = `/bereich/bilder/${variant.slug}/image-convert`;
    const canonical = absoluteUrl(path, siteUrl);
    const meta: RouteMeta = {
        path,
        title: variant.seo.title,
        description: variant.seo.description,
        h1: variant.seo.h1,
        canonical,
        variant,
    };
    meta.jsonLd = [
        webApplicationJsonLd(meta),
        breadcrumbJsonLd([
            { name: 'Start', url: absoluteUrl('/', siteUrl) },
            { name: areas.bilder.label, url: absoluteUrl(`/bereich/${areas.bilder.slug}`, siteUrl) },
            { name: variant.seo.h1, url: canonical },
        ]),
    ];
    return meta;
}

function resolveTool(
    toolId: ToolId,
    catalogs?: Readonly<Record<string, ToolDefinition>>,
): ToolDefinition | undefined {
    return catalogs?.[toolId] ?? getTool(toolId);
}

export function metaForTool(
    areaId: AreaId,
    storyId: StoryId,
    toolId: ToolId,
    siteUrl: string,
    catalogs?: Readonly<Record<string, ToolDefinition>>,
): RouteMeta {
    const area = areas[areaId];
    const story = stories[storyId];
    const tool = resolveTool(toolId, catalogs);
    const toolSlug = tool?.slug ?? toolId;
    const path = `/bereich/${area.slug}/${story.slug}/${toolSlug}`;
    const canonical = absoluteUrl(path, siteUrl);
    const meta: RouteMeta = {
        path,
        title: tool ? `${tool.title} — ${SITE_NAME}` : `${story.outcome} — ${SITE_NAME}`,
        description: tool ? toolDescription(tool) : story.situation,
        h1: tool?.title ?? story.outcome,
        canonical,
    };
    meta.jsonLd = [
        webApplicationJsonLd(meta),
        breadcrumbJsonLd([
            { name: 'Start', url: absoluteUrl('/', siteUrl) },
            { name: area.label, url: absoluteUrl(`/bereich/${area.slug}`, siteUrl) },
            { name: story.outcome, url: absoluteUrl(`/bereich/${area.slug}/${story.slug}`, siteUrl) },
            { name: meta.h1 ?? story.outcome, url: canonical },
        ]),
    ];
    return meta;
}

export function resolveRouteMeta(route: ParsedRoute, siteUrl: string): RouteMeta {
    const base = (path: string) => absoluteUrl(path, siteUrl);

    if (route.page === 'home') {
        const path = '/';
        const meta: RouteMeta = {
            path,
            title: `${SITE_NAME} — Tools lokal im Browser`,
            description: DEFAULT_DESCRIPTION,
            h1: SITE_NAME,
            canonical: base(path),
            jsonLd: [
                {
                    '@context': 'https://schema.org',
                    '@type': 'WebSite',
                    name: SITE_NAME,
                    url: base('/'),
                    description: DEFAULT_DESCRIPTION,
                    inLanguage: 'de-DE',
                },
            ],
        };
        return meta;
    }

    if (route.page === 'settings') {
        return {
            path: '/einstellungen',
            title: `Einstellungen — ${SITE_NAME}`,
            description: 'App-Einstellungen — nur lokal im Browser.',
            canonical: base('/einstellungen'),
            noindex: true,
        };
    }

    if (route.page === 'search') {
        return {
            path: '/suche',
            title: `Suche — ${SITE_NAME}`,
            description:
                'Finde Tools, Vorhaben und Bild-Varianten — lokal im Browser, ohne Upload.',
            h1: 'Suche',
            canonical: base('/suche'),
        };
    }

    if (route.page === 'vorhaben') {
        return {
            path: '/vorhaben',
            title: `Vorhaben — ${SITE_NAME}`,
            description:
                'Alle Multi-Tool-Vorhaben auf macheseinfach — Schritt für Schritt im Browser.',
            h1: 'Vorhaben',
            canonical: base('/vorhaben'),
        };
    }

    if (route.page === 'area' && route.areaId) {
        const area = areas[route.areaId];
        const path = `/bereich/${area.slug}`;
        const canonical = base(path);
        const meta: RouteMeta = {
            path,
            title: `${area.label} — ${SITE_NAME}`,
            description: area.description,
            h1: area.label,
            canonical,
        };
        if (route.tags.length > 0) {
            meta.noindex = true;
        } else {
            meta.jsonLd = [
                webPageJsonLd(meta),
                breadcrumbJsonLd([
                    { name: 'Start', url: base('/') },
                    { name: area.label, url: canonical },
                ]),
            ];
        }
        return meta;
    }

    if (route.page === 'story' && route.areaId && route.storyId) {
        const area = areas[route.areaId];
        const story = stories[route.storyId];
        const path = `/bereich/${area.slug}/${story.slug}`;
        const canonical = base(path);
        const meta: RouteMeta = {
            path,
            title: `${story.outcome} — ${SITE_NAME}`,
            description: story.situation,
            h1: story.outcome,
            canonical,
        };
        if (route.tags.length > 0) {
            meta.noindex = true;
        } else {
            meta.jsonLd = [
                webPageJsonLd(meta),
                breadcrumbJsonLd([
                    { name: 'Start', url: base('/') },
                    { name: area.label, url: base(`/bereich/${area.slug}`) },
                    { name: story.outcome, url: canonical },
                ]),
            ];
        }
        return meta;
    }

    if (route.page === 'tool' && route.areaId && route.storyId && route.toolId) {
        if (route.variantSlug) {
            const variant = getVariantBySlug(route.variantSlug);
            if (variant) {
                return metaForVariant(variant, siteUrl);
            }
        }
        return metaForTool(route.areaId, route.storyId, route.toolId, siteUrl);
    }

    return {
        path: '/',
        title: `${SITE_NAME} — Tools lokal im Browser`,
        description: DEFAULT_DESCRIPTION,
        canonical: base('/'),
    };
}

/** All indexable routes for static HTML shells and sitemap. */
export function collectStaticRoutes(
    siteUrl: string,
    catalogs?: Readonly<Record<string, ToolDefinition>>,
): RouteMeta[] {
    const routes: RouteMeta[] = [
        resolveRouteMeta({ page: 'home', areaId: null, storyId: null, toolId: null, variantSlug: null, tags: [] }, siteUrl),
        resolveRouteMeta({ page: 'search', areaId: null, storyId: null, toolId: null, variantSlug: null, tags: [] }, siteUrl),
        resolveRouteMeta({ page: 'vorhaben', areaId: null, storyId: null, toolId: null, variantSlug: null, tags: [] }, siteUrl),
    ];

    for (const areaId of areaOrder) {
        const area = areas[areaId];
        routes.push(
            resolveRouteMeta(
                { page: 'area', areaId, storyId: null, toolId: null, variantSlug: null, tags: [] },
                siteUrl,
            ),
        );

        for (const storyId of area.storyIds) {
            const story = stories[storyId];
            if (story.status === 'planned' && story.steps.length === 0) continue;

            routes.push(
                resolveRouteMeta(
                    {
                        page: 'story',
                        areaId,
                        storyId,
                        toolId: null,
                        variantSlug: null,
                        tags: [],
                    },
                    siteUrl,
                ),
            );

            for (const toolId of story.steps.map((step) => step.toolId)) {
                routes.push(metaForTool(areaId, storyId, toolId, siteUrl, catalogs));
            }
        }
    }

    for (const variant of buildConversionVariants()) {
        routes.push(metaForVariant(variant, siteUrl));
    }

    return routes;
}

export function buildSitemapXml(routes: readonly RouteMeta[]): string {
    const indexable = routes.filter((route) => isRouteIndexable(route.noindex));
    const urls = indexable
        .map(
            (route) => `  <url>
    <loc>${route.canonical}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route.path === '/' ? '1.0' : route.variant ? '0.8' : '0.6'}</priority>
  </url>`,
        )
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function buildRobotsTxt(siteUrl: string): string {
    if (isIndexingDisallowed()) {
        return `User-agent: *
Disallow: /
`;
    }

    return `User-agent: *
Allow: /

Sitemap: ${absoluteUrl('/sitemap.xml', siteUrl)}
`;
}
