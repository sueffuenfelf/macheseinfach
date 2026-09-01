import { DEFAULT_DESCRIPTION, robotsDirectiveForRoute, SITE_NAME, SITE_URL } from './site-config';
import type { RouteMeta } from './route-meta';

export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function defaultOgImage(): string {
    return `${SITE_URL}/brand/logo.svg`;
}

/** HTML head tags shared by build-time injection and react-helmet. */
export function buildHeadTags(meta: RouteMeta): string[] {
    const title = escapeHtml(meta.title);
    const description = escapeHtml(meta.description);
    const canonical = escapeHtml(meta.canonical);
    const ogImage = escapeHtml(defaultOgImage());
    const robots = robotsDirectiveForRoute(meta.noindex);

    const tags = [
        `<title>${title}</title>`,
        `<meta name="description" content="${description}" />`,
        `<meta name="robots" content="${robots}" />`,
        `<link rel="canonical" href="${canonical}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
        `<meta property="og:locale" content="de_DE" />`,
        `<meta property="og:title" content="${title}" />`,
        `<meta property="og:description" content="${description}" />`,
        `<meta property="og:url" content="${canonical}" />`,
        `<meta property="og:image" content="${ogImage}" />`,
        `<meta name="twitter:card" content="summary" />`,
        `<meta name="twitter:title" content="${title}" />`,
        `<meta name="twitter:description" content="${description}" />`,
    ];

    for (const schema of meta.jsonLd ?? []) {
        tags.push(`<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
    }

    return tags;
}

/** Minimal visible content for non-JS crawlers in static HTML shells. */
export function buildNoscriptBlock(meta: RouteMeta): string {
    const heading = escapeHtml(meta.h1 ?? meta.title);
    const description = escapeHtml(meta.description);
    return `<noscript><main><h1>${heading}</h1><p>${description}</p></main></noscript>`;
}

export function stripExistingSeoHead(html: string): string {
    return html
        .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
        .replace(/<meta\s+name="description"[\s\S]*?\/?>\s*/gi, '')
        .replace(/<meta\s+name="robots"[\s\S]*?\/?>\s*/gi, '')
        .replace(/<link\s+rel="canonical"[\s\S]*?\/?>\s*/gi, '')
        .replace(/<meta\s+property="og:[^"]*"[\s\S]*?\/?>\s*/gi, '')
        .replace(/<meta\s+name="twitter:[^"]*"[\s\S]*?\/?>\s*/gi, '')
        .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '');
}

export function injectSeoHead(html: string, meta: RouteMeta): string {
    const headTags = buildHeadTags(meta).join('\n    ');
    const noscript = buildNoscriptBlock(meta);

    const cleaned = stripExistingSeoHead(html);
    const withHead = cleaned.replace('</head>', `    ${headTags}\n  </head>`);

    if (withHead.includes('<noscript>')) {
        return withHead.replace(/<noscript>[\s\S]*?<\/noscript>/, noscript);
    }

    return withHead.replace('<div id="root"></div>', `${noscript}\n    <div id="root"></div>`);
}

export { DEFAULT_DESCRIPTION };
