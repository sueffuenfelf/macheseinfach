import { areaOrder, areas, stories } from '../data/catalog';
import type { AreaId, StoryId, ToolId } from '../data/catalog/types';
import { buildConversionVariants } from '../tools/_shared/image/variants';
import type { ToolVariant } from '../tools/types';
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from './site-config';

export type RouteMeta = {
    path: string;
    title: string;
    description: string;
    h1?: string;
    canonical: string;
    variant?: ToolVariant;
};

export function absoluteUrl(path: string): string {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${SITE_URL}${normalized}`;
}

export function metaForVariant(variant: ToolVariant): RouteMeta {
    return {
        path: `/bereich/bilder/${variant.slug}/image-convert`,
        title: variant.seo.title,
        description: variant.seo.description,
        h1: variant.seo.h1,
        canonical: absoluteUrl(`/bereich/bilder/${variant.slug}/image-convert`),
        variant,
    };
}

export function metaForTool(areaId: AreaId, storyId: StoryId, toolId: ToolId): RouteMeta {
    const area = areas[areaId];
    const story = stories[storyId];
    const path = `/bereich/${area.slug}/${story.slug}/${toolId}`;
    return {
        path,
        title: `${story.outcome} — ${SITE_NAME}`,
        description: story.situation,
        h1: story.outcome,
        canonical: absoluteUrl(path),
    };
}

/** All routes to pre-render and include in sitemap. */
export function collectStaticRoutes(): RouteMeta[] {
    const routes: RouteMeta[] = [
        {
            path: '/',
            title: `${SITE_NAME} — Tools lokal im Browser`,
            description: DEFAULT_DESCRIPTION,
            canonical: absoluteUrl('/'),
        },
        {
            path: '/favoriten',
            title: `Favoriten — ${SITE_NAME}`,
            description: DEFAULT_DESCRIPTION,
            canonical: absoluteUrl('/favoriten'),
        },
        {
            path: '/einstellungen',
            title: `Einstellungen — ${SITE_NAME}`,
            description: DEFAULT_DESCRIPTION,
            canonical: absoluteUrl('/einstellungen'),
        },
        {
            path: '/suche',
            title: `Suche — ${SITE_NAME}`,
            description: 'Finde Tools, Situationen und Bild-Varianten — lokal im Browser, ohne Upload.',
            canonical: absoluteUrl('/suche'),
        },
    ];

    for (const areaId of areaOrder) {
        const area = areas[areaId];
        routes.push({
            path: `/bereich/${area.slug}`,
            title: `${area.label} — ${SITE_NAME}`,
            description: area.description,
            canonical: absoluteUrl(`/bereich/${area.slug}`),
        });

        for (const storyId of area.storyIds) {
            const story = stories[storyId];
            if (story.status === 'planned' && story.toolIds.length === 0) continue;

            routes.push({
                path: `/bereich/${area.slug}/${story.slug}`,
                title: `${story.outcome} — ${SITE_NAME}`,
                description: story.situation,
                h1: story.outcome,
                canonical: absoluteUrl(`/bereich/${area.slug}/${story.slug}`),
            });

            for (const toolId of story.toolIds) {
                routes.push(metaForTool(areaId, storyId, toolId));
            }
        }
    }

    for (const variant of buildConversionVariants()) {
        routes.push(metaForVariant(variant));
    }

    return routes;
}

export function jsonLdWebApplication(meta: RouteMeta): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: meta.variant?.seo.h1 ?? meta.h1 ?? meta.title,
        description: meta.description,
        url: meta.canonical,
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'EUR',
        },
    };
}

export function buildSitemapXml(routes: readonly RouteMeta[]): string {
    const urls = routes
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

export function buildRobotsTxt(): string {
    return `User-agent: *
Allow: /

Sitemap: ${absoluteUrl('/sitemap.xml')}
`;
}
