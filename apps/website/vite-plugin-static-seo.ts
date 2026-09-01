import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { injectSeoHead } from './src/seo/head-tags';
import type { RouteMeta } from './src/seo/route-meta';
import { buildRobotsTxt, buildSitemapXml } from './src/seo/route-meta';
import { isRouteIndexable, SITE_URL } from './src/seo/site-config';

const GENERATED_ROUTES = path.resolve(import.meta.dirname, 'src/seo/.generated-routes.json');

function routeOutFile(distDir: string, routePath: string): string {
    if (routePath === '/') return path.join(distDir, 'index.html');
    const segments = routePath.replace(/^\//, '').split('/');
    return path.join(distDir, ...segments, 'index.html');
}

function loadGeneratedRoutes(): RouteMeta[] {
    if (!fs.existsSync(GENERATED_ROUTES)) {
        throw new Error(
            `[static-seo] Missing ${GENERATED_ROUTES} — run "bun run build:seo-routes" before build`,
        );
    }
    return JSON.parse(fs.readFileSync(GENERATED_ROUTES, 'utf8')) as RouteMeta[];
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
            const routes = loadGeneratedRoutes();

            for (const route of routes) {
                const html = injectSeoHead(template, route);
                const outFile = routeOutFile(distDir, route.path);
                fs.mkdirSync(path.dirname(outFile), { recursive: true });
                fs.writeFileSync(outFile, html, 'utf8');
            }

            fs.writeFileSync(path.join(distDir, 'sitemap.xml'), buildSitemapXml(routes), 'utf8');
            fs.writeFileSync(path.join(distDir, 'robots.txt'), buildRobotsTxt(SITE_URL), 'utf8');

            const indexable = routes.filter((route) => isRouteIndexable(route.noindex));
            console.info(
                `[static-seo] ${routes.length} HTML shells (${indexable.length} in sitemap) · sitemap.xml · robots.txt`,
            );
        },
    };
}
