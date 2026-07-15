import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import {
    buildRobotsTxt,
    buildSitemapXml,
    collectStaticRoutes,
    jsonLdWebApplication,
    type RouteMeta,
} from './src/seo/static-routes';
import { SITE_URL } from './src/seo/site-config';

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function injectHead(html: string, meta: RouteMeta): string {
    const title = escapeHtml(meta.title);
    const description = escapeHtml(meta.description);
    const canonical = escapeHtml(meta.canonical);
    const ogImage = escapeHtml(`${SITE_URL}/brand/logo.svg`);

    const headTags = [
        `<title>${title}</title>`,
        `<meta name="description" content="${description}" />`,
        `<link rel="canonical" href="${canonical}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:title" content="${title}" />`,
        `<meta property="og:description" content="${description}" />`,
        `<meta property="og:url" content="${canonical}" />`,
        `<meta property="og:image" content="${ogImage}" />`,
        `<meta name="twitter:card" content="summary" />`,
        `<meta name="twitter:title" content="${title}" />`,
        `<meta name="twitter:description" content="${description}" />`,
    ];

    if (meta.variant) {
        headTags.push(
            `<script type="application/ld+json">${JSON.stringify(jsonLdWebApplication(meta))}</script>`,
        );
    }

    const injected = headTags.join('\n    ');

    return html
        .replace(/<title>[^<]*<\/title>/, injected)
        .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, '');
}

function routeOutFile(distDir: string, routePath: string): string {
    if (routePath === '/') return path.join(distDir, 'index.html');
    const segments = routePath.replace(/^\//, '').split('/');
    return path.join(distDir, ...segments, 'index.html');
}

/** Pre-renders route HTML shells + sitemap.xml + robots.txt at build time. */
export function staticSeoPlugin(): Plugin {
    return {
        name: 'macheseinfach-static-seo',
        apply: 'build',
        closeBundle() {
            const distDir = path.resolve(process.cwd(), 'dist');
            const templatePath = path.join(distDir, 'index.html');
            if (!fs.existsSync(templatePath)) {
                console.warn('[static-seo] dist/index.html not found — skipping prerender');
                return;
            }

            const template = fs.readFileSync(templatePath, 'utf8');
            const routes = collectStaticRoutes();

            for (const route of routes) {
                if (route.path === '/') continue;
                const html = injectHead(template, route);
                const outFile = routeOutFile(distDir, route.path);
                fs.mkdirSync(path.dirname(outFile), { recursive: true });
                fs.writeFileSync(outFile, html, 'utf8');
            }

            fs.writeFileSync(path.join(distDir, 'sitemap.xml'), buildSitemapXml(routes), 'utf8');
            fs.writeFileSync(path.join(distDir, 'robots.txt'), buildRobotsTxt(), 'utf8');

            console.info(`[static-seo] ${routes.length} routes · sitemap.xml · robots.txt`);
        },
    };
}
