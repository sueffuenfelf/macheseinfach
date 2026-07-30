import { describe, expect, test, afterEach } from 'bun:test';
import { tools } from '../data/catalog';
import { injectSeoHead } from './head-tags';
import { buildRobotsTxt, buildSitemapXml, collectStaticRoutes, metaForTool, resolveRouteMeta } from './route-meta';
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
    test('collectStaticRoutes includes hub, variant, and tool routes', () => {
        const routes = collectStaticRoutes(SITE_URL);
        const paths = routes.map((route) => route.path);

        expect(paths).toContain('/');
        expect(paths).toContain('/suche');
        expect(paths).toContain('/vorhaben');
        expect(paths).toContain('/bereich/bilder/bild-konvertieren');
        expect(paths).toContain('/bereich/bilder/heic-zu-png/image-convert');
        expect(paths).toContain('/bereich/bilder/bild-verkleinern/image-compress');
        expect(paths).toContain('/bereich/bilder/bild-metadaten/image-exif-strip');
        expect(paths).toContain('/bereich/wohnen/vermieter-nachweis');
        expect(paths).toContain('/bereich/buchhaltung/freelancer-zahlung');
        expect(paths).toContain('/bereich/bilder/portal-foto');

        const variantRoutes = routes.filter((route) => route.variant);
        expect(variantRoutes.length).toBe(8);
    });

    test('tool meta uses catalog title and sub when tools are discovered', () => {
        const meta = metaForTool('security', 'story-passwort-staerke', 'password-strength', SITE_URL);
        expect(meta.path).toBe('/bereich/security/passwort-staerke/password-strength');
        expect(meta.jsonLd?.length).toBeGreaterThan(0);
        if (Object.keys(tools).length > 0) {
            expect(meta.title).toContain('Passwort-Stärke prüfen');
            expect(meta.description).toContain('Entropie');
        } else {
            expect(meta.title).toContain('Passwort');
        }
    });

    test('user pages are noindex and excluded from sitemap candidates', () => {
        const routes = collectStaticRoutes(SITE_URL);
        expect(routes.some((route) => route.path === '/favoriten')).toBe(false);
        expect(routes.some((route) => route.path === '/einstellungen')).toBe(false);
    });
});

describe('indexing policy', () => {
    test('disallows indexing by default', () => {
        delete process.env.FF_DISALLOW_INDEXING;
        expect(isIndexingDisallowed()).toBe(true);

        const meta = metaForTool('security', 'story-passwort-staerke', 'password-strength', SITE_URL);
        const html = injectSeoHead(SAMPLE_HTML, meta);
        expect(html).toContain('content="noindex, nofollow"');

        const routes = collectStaticRoutes(SITE_URL);
        expect(buildSitemapXml(routes)).not.toContain('<loc>');
        expect(buildRobotsTxt(SITE_URL)).toContain('Disallow: /');
    });

    test('allows indexing when FF_DISALLOW_INDEXING=false', () => {
        process.env.FF_DISALLOW_INDEXING = 'false';
        expect(isIndexingDisallowed()).toBe(false);

        const meta = metaForTool('security', 'story-passwort-staerke', 'password-strength', SITE_URL);
        const html = injectSeoHead(SAMPLE_HTML, meta);
        expect(html).toContain('content="index, follow"');

        const routes = collectStaticRoutes(SITE_URL);
        expect(buildSitemapXml(routes)).toContain('<loc>');
        expect(buildRobotsTxt(SITE_URL)).toContain('Sitemap:');
        expect(buildRobotsTxt(SITE_URL)).toContain('Allow: /');
    });
});

describe('head injection', () => {
    test('injectSeoHead replaces fallback description with page-specific text', () => {
        process.env.FF_DISALLOW_INDEXING = 'false';
        const meta = metaForTool('security', 'story-passwort-staerke', 'password-strength', SITE_URL);
        const html = injectSeoHead(SAMPLE_HTML, meta);

        expect(html).toContain(`<title>${meta.title}</title>`);
        expect(html).toContain(`content="${meta.description}"`);
        expect(html).not.toContain('fallback description');
        expect(html).toContain('<noscript>');
        expect(html).toContain('application/ld+json');
    });

    test('homepage is included with canonical and og tags', () => {
        process.env.FF_DISALLOW_INDEXING = 'false';
        const routes = collectStaticRoutes(SITE_URL);
        const home = routes.find((route) => route.path === '/');
        expect(home).toBeDefined();
        const html = injectSeoHead(SAMPLE_HTML, home!);
        expect(html).toContain(`href="${SITE_URL}/"`);
        expect(html).toContain('og:site_name');
    });
});
