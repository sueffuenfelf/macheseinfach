/** @deprecated Import from `./route-meta` — kept for existing imports. */
export {
    absoluteUrl,
    buildRobotsTxt,
    buildSitemapXml,
    collectStaticRoutes,
    metaForTool,
    metaForVariant,
    resolveRouteMeta,
    type RouteMeta,
} from './route-meta';

/** @deprecated Use jsonLd from RouteMeta.jsonLd */
export function jsonLdWebApplication(
    meta: import('./route-meta').RouteMeta,
): Record<string, unknown> {
    const existing = meta.jsonLd?.find((entry) => entry['@type'] === 'WebApplication');
    if (existing) return existing;
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
