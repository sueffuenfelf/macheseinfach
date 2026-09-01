import {
    areaOrder,
    areas,
    getTool,
    tools as catalogTools,
    type AreaId,
    type ToolDefinition,
    type ToolId,
} from '../data/catalog';
import { buildConversionVariants } from '../tools/_shared/image/variants';
import type { ToolVariant } from '../tools/types';
import type { ParsedRoute } from '../routing/paths';
import { getVariantBySlug } from '../tools/variant-registry';
import {
    DEFAULT_DESCRIPTION,
    IMPRINT_PATH,
    isIndexingDisallowed,
    isRouteIndexable,
    PRIVACY_PATH,
    SITE_NAME,
    SITE_URL,
} from './site-config';

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
    const combined = `${tool.pain} ${tool.solution}`.trim();
    if (combined) return combined;
    return `${tool.title} — lokal im Browser, ohne Upload.`;
}

function breadcrumbJsonLd(items: { name: string; url: string }[]): Record<string, unknown> {
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
            {
                name: areas.bilder.label,
                url: absoluteUrl(`/bereich/${areas.bilder.slug}`, siteUrl),
            },
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
    _areaId: AreaId,
    toolId: ToolId,
    siteUrl: string,
    catalogs?: Readonly<Record<string, ToolDefinition>>,
): RouteMeta {
    return metaForToolShortcut(toolId, siteUrl, catalogs);
}

/** Standalone tool shortlink SEO (`/tool/:slug`). */
export function metaForToolShortcut(
    toolId: ToolId,
    siteUrl: string,
    catalogs?: Readonly<Record<string, ToolDefinition>>,
): RouteMeta {
    const tool = resolveTool(toolId, catalogs);
    const toolSlug = tool?.slug ?? toolId;
    const path = `/tool/${toolSlug}`;
    const canonical = absoluteUrl(path, siteUrl);
    const areaId = tool?.areas[0];
    const area = areaId ? areas[areaId] : null;
    const meta: RouteMeta = {
        path,
        title: tool ? `${tool.title} — ${SITE_NAME}` : `${toolId} — ${SITE_NAME}`,
        description: tool ? toolDescription(tool) : DEFAULT_DESCRIPTION,
        h1: tool?.title,
        canonical,
    };
    const crumbs = [{ name: 'Start', url: absoluteUrl('/', siteUrl) }];
    if (area) {
        crumbs.push({ name: area.label, url: absoluteUrl(`/bereich/${area.slug}`, siteUrl) });
    }
    crumbs.push({ name: tool?.title ?? toolId, url: canonical });
    meta.jsonLd = [webApplicationJsonLd(meta), breadcrumbJsonLd(crumbs)];
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

    if (route.page === 'legal') {
        const isPrivacy = route.legalKind === 'privacy';
        const path = isPrivacy ? PRIVACY_PATH : IMPRINT_PATH;
        const title = isPrivacy ? `Datenschutz — ${SITE_NAME}` : `Impressum — ${SITE_NAME}`;
        const description = isPrivacy
            ? 'Datenschutzhinweise für macheseinfa.ch — Verarbeitung lokal im Browser, ohne Nutzerkonto.'
            : 'Impressum von macheseinfa.ch — Angaben zum Anbieter gemäß DDG.';
        return {
            path,
            title,
            description,
            h1: isPrivacy ? 'Datenschutz' : 'Impressum',
            canonical: base(path),
            noindex: true,
        };
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
            description: 'Finde Tools und Bild-Varianten — lokal im Browser, ohne Upload.',
            h1: 'Suche',
            canonical: base('/suche'),
        };
    }

    if (route.page === 'conversion' && route.areaId) {
        const area = areas[route.areaId];
        const path = `/bereich/${area.slug}/format-aendern`;
        const canonical = base(path);
        const meta: RouteMeta = {
            path,
            title: `Bildformat ändern — ${SITE_NAME}`,
            description: 'HEIC, PNG, JPG und WebP lokal im Browser umwandeln.',
            h1: 'Bildformat ändern',
            canonical,
        };
        meta.jsonLd = [
            webPageJsonLd(meta),
            breadcrumbJsonLd([
                { name: 'Start', url: base('/') },
                { name: area.label, url: base(`/bereich/${area.slug}`) },
                { name: 'Bildformat ändern', url: canonical },
            ]),
        ];
        return meta;
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

    if (route.page === 'tool' && route.toolId) {
        if (route.variantSlug) {
            const variant = getVariantBySlug(route.variantSlug);
            if (variant) {
                return metaForVariant(variant, siteUrl);
            }
        }
        return metaForToolShortcut(route.toolId, siteUrl);
    }

    return {
        path: '/',
        title: `${SITE_NAME} — Tools lokal im Browser`,
        description: DEFAULT_DESCRIPTION,
        canonical: base('/'),
    };
}

function isPublishedTool(
    toolId: string,
    catalogs?: Readonly<Record<string, ToolDefinition>>,
): boolean {
    const tool = resolveTool(toolId, catalogs);
    if (!tool) return false;
    return Boolean(tool.slug && tool.title && toolDescription(tool).length >= 8);
}

/** All prerendered routes (legal pages included, marked noindex). */
export function collectStaticRoutes(
    siteUrl: string,
    catalogs?: Readonly<Record<string, ToolDefinition>>,
): RouteMeta[] {
    const routes: RouteMeta[] = [
        resolveRouteMeta(
            {
                page: 'home',
                areaId: null,
                toolId: null,
                variantSlug: null,
                tags: [],
            },
            siteUrl,
        ),
        resolveRouteMeta(
            {
                page: 'search',
                areaId: null,
                toolId: null,
                variantSlug: null,
                tags: [],
            },
            siteUrl,
        ),
        resolveRouteMeta(
            {
                page: 'legal',
                areaId: null,
                toolId: null,
                variantSlug: null,
                tags: [],
                legalKind: 'imprint',
            },
            siteUrl,
        ),
        resolveRouteMeta(
            {
                page: 'legal',
                areaId: null,
                toolId: null,
                variantSlug: null,
                tags: [],
                legalKind: 'privacy',
            },
            siteUrl,
        ),
    ];

    for (const areaId of areaOrder) {
        routes.push(
            resolveRouteMeta(
                { page: 'area', areaId, toolId: null, variantSlug: null, tags: [] },
                siteUrl,
            ),
        );
    }

    routes.push(
        resolveRouteMeta(
            {
                page: 'conversion',
                areaId: 'bilder',
                toolId: null,
                variantSlug: null,
                tags: [],
            },
            siteUrl,
        ),
    );

    const toolSource = catalogs ?? catalogTools;
    for (const toolId of Object.keys(toolSource)) {
        if (!isPublishedTool(toolId, catalogs)) continue;
        routes.push(metaForToolShortcut(toolId as ToolId, siteUrl, catalogs));
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
Disallow: ${IMPRINT_PATH}
Disallow: ${PRIVACY_PATH}

Sitemap: ${absoluteUrl('/sitemap.xml', siteUrl)}
`;
}
