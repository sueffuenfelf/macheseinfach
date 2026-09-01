import { describe, expect, test, afterEach } from 'bun:test';
import { tools } from '../data/catalog';
import { injectSeoHead } from './head-tags';
import { loadToolCatalogs } from './generate-routes';
import {
    buildRobotsTxt,
    buildSitemapXml,
    collectStaticRoutes,
    metaForToolShortcut,
    resolveRouteMeta,
} from './route-meta';
import { isIndexingDisallowed, SITE_URL } from './site-config';

const SAMPLE_HTML = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <title>fallback</title>
    <meta name="description" content="fallback description" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

const originalDisallowFlag = process.env.FF_DISALLOW_INDEXING;

afterEach(() => {
    if (originalDisallowFlag === undefined) {
        delete process.env.FF_DISALLOW_INDEXING;
    } else {
        process.env.FF_DISALLOW_INDEXING = originalDisallowFlag;
    }
});

describe('route meta', () => {
    test('collectStaticRoutes includes hubs, remaining categories, variants, and tool shortcuts', () => {
        const catalogs = loadToolCatalogs();
        const routes = collectStaticRoutes(SITE_URL, catalogs);
        const paths = routes.map((route) => route.path);

        expect(paths).toContain('/');
        expect(paths).toContain('/suche');
        expect(paths).toContain('/bereich/bilder');
        expect(paths).toContain('/bereich/dokumente');
        expect(paths).toContain('/bereich/text');
        expect(paths).toContain('/bereich/zeit');
        expect(paths).toContain('/bereich/einheiten');
        expect(paths).toContain('/bereich/web');
        expect(paths).toContain('/bereich/bilder/format-aendern');
        expect(paths).toContain('/bereich/bilder/heic-zu-png/image-convert');
        expect(paths).toContain('/tool/image-convert');
        expect(paths).not.toContain('/tool/ocr-local');
        expect(paths).not.toContain('/tool/epc-read');

        expect(paths).not.toContain('/vorhaben');
        expect(paths.some((path) => path.startsWith('/bereich/wohnen'))).toBe(false);
        expect(paths.some((path) => path.startsWith('/bereich/buchhaltung'))).toBe(false);
        expect(paths).not.toContain('/bereich/bilder/portal-foto');
        expect(paths.every((path) => !path.includes('/vorhaben'))).toBe(true);

        const variantRoutes = routes.filter((route) => route.variant);
        expect(variantRoutes.length).toBe(8);

        for (const tool of Object.values(catalogs)) {
            if (tool.maturity === 'planned') continue;
            expect(paths).toContain(`/tool/${tool.slug}`);
        }
    });

    test('tool shortcut meta uses catalog title and sub when tools are discovered', () => {
        const meta = metaForToolShortcut('image-convert', SITE_URL, tools);
        expect(meta.path).toBe('/tool/image-convert');
        expect(meta.jsonLd?.length).toBeGreaterThan(0);
        if (Object.keys(tools).length > 0) {
            expect(meta.title.toLowerCase()).toContain('bild');
            expect(meta.description.length).toBeGreaterThan(10);
        }
    });

    test('user pages are noindex and excluded from sitemap candidates', () => {
        const routes = collectStaticRoutes(SITE_URL, tools);
        expect(routes.some((route) => route.path === '/favoriten')).toBe(false);
        expect(routes.some((route) => route.path === '/einstellungen')).toBe(false);
    });
});

describe('indexing policy', () => {
    test('disallows indexing by default', () => {
        delete process.env.FF_DISALLOW_INDEXING;
        expect(isIndexingDisallowed()).toBe(true);

        const meta = metaForToolShortcut('image-convert', SITE_URL, tools);
        const html = injectSeoHead(SAMPLE_HTML, meta);
        expect(html).toContain('content="noindex, nofollow"');

        const routes = collectStaticRoutes(SITE_URL, tools);
        expect(buildSitemapXml(routes)).not.toContain('<loc>');
        expect(buildRobotsTxt(SITE_URL)).toContain('Disallow: /');
    });

    test('allows indexing when FF_DISALLOW_INDEXING=false', () => {
        process.env.FF_DISALLOW_INDEXING = 'false';
        expect(isIndexingDisallowed()).toBe(false);

        const meta = metaForToolShortcut('image-convert', SITE_URL, tools);
        const html = injectSeoHead(SAMPLE_HTML, meta);
        expect(html).toContain('content="index, follow"');

        const routes = collectStaticRoutes(SITE_URL, tools);
        expect(buildSitemapXml(routes)).toContain('<loc>');
        expect(buildRobotsTxt(SITE_URL)).toContain('Sitemap:');
        expect(buildRobotsTxt(SITE_URL)).toContain('Allow: /');
    });
});

describe('head injection', () => {
    test('injectSeoHead replaces fallback description with page-specific text', () => {
        process.env.FF_DISALLOW_INDEXING = 'false';
        const meta = metaForToolShortcut('image-convert', SITE_URL, tools);
        const html = injectSeoHead(SAMPLE_HTML, meta);

        expect(html).toContain(`<title>${meta.title}</title>`);
        expect(html).toContain(`content="${meta.description}"`);
        expect(html).not.toContain('fallback description');
        expect(html).toContain('<noscript>');
        expect(html).toContain('application/ld+json');
    });

    test('homepage is included with canonical and og tags', () => {
        process.env.FF_DISALLOW_INDEXING = 'false';
        const routes = collectStaticRoutes(SITE_URL, tools);
        const home = routes.find((route) => route.path === '/');
        expect(home).toBeDefined();
        const html = injectSeoHead(SAMPLE_HTML, home!);
        expect(html).toContain(`href="${SITE_URL}/"`);
        expect(html).toContain('og:site_name');
    });
});
