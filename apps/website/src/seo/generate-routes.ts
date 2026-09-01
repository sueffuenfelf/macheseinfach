/**
 * Build-time route manifest — run before `vite build` so tool catalogs are
 * available without importing browser-only tool dependencies.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ToolDefinition } from '../data/catalog/types';
import { collectStaticRoutes, type RouteMeta } from './route-meta';
import { SITE_URL } from './site-config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const toolsRoot = join(__dirname, '../tools');

function readQuotedField(block: string, field: string): string | undefined {
    const match = block.match(new RegExp(`${field}:\\s*['"]([^'"]+)['"]`));
    return match?.[1];
}

function extractCatalogBlock(source: string): string | null {
    const markers = ['catalog:', 'const catalog ='] as const;
    let braceStart = -1;
    for (const marker of markers) {
        const start = source.indexOf(marker);
        if (start < 0) continue;
        braceStart = source.indexOf('{', start);
        if (braceStart >= 0) break;
    }
    if (braceStart < 0) return null;

    let depth = 0;
    for (let index = braceStart; index < source.length; index += 1) {
        const char = source[index];
        if (char === '{') depth += 1;
        if (char === '}') {
            depth -= 1;
            if (depth === 0) {
                return source.slice(braceStart + 1, index);
            }
        }
    }

    return null;
}

function parseCatalogFromConfig(folderId: string, source: string): ToolDefinition | null {
    const block = extractCatalogBlock(source);
    if (!block) return null;

    const id = readQuotedField(block, 'id') ?? folderId;
    const slug = readQuotedField(block, 'slug');
    const title = readQuotedField(block, 'title');
    const fallbackSub = [readQuotedField(block, 'pain'), readQuotedField(block, 'solution')]
        .filter(Boolean)
        .join(' ');
    const sub = readQuotedField(block, 'sub') ?? (fallbackSub || undefined);
    if (!slug || !title || !sub) return null;

    return {
        id,
        slug,
        shortTitle: readQuotedField(block, 'shortTitle') ?? title,
        title,
        sub,
        pain: readQuotedField(block, 'pain') ?? '',
        solution: readQuotedField(block, 'solution') ?? '',
        trust: readQuotedField(block, 'trust') ?? '',
        tags: [],
        keywords: [],
        fileHints: [],
        command: readQuotedField(block, 'command') ?? '',
        entry: 'form',
        theme: { accent: '#000', accentStrong: '#000', accentSoft: '#eee' },
        maturity: (readQuotedField(block, 'maturity') as ToolDefinition['maturity']) ?? 'stable',
        areas: [],
    };
}

export function loadToolCatalogs(): Record<string, ToolDefinition> {
    const catalogs: Record<string, ToolDefinition> = {};

    for (const dirent of readdirSync(toolsRoot, { withFileTypes: true })) {
        if (!dirent.isDirectory() || dirent.name.startsWith('_')) continue;
        const configPath = join(toolsRoot, dirent.name, 'config.ts');
        try {
            const source = readFileSync(configPath, 'utf8');
            const catalog = parseCatalogFromConfig(dirent.name, source);
            if (catalog) catalogs[catalog.id] = catalog;
            else console.warn(`[seo-routes] skip ${dirent.name}: no catalog block`);
        } catch (error) {
            console.warn(`[seo-routes] skip ${dirent.name}:`, error);
        }
    }

    return catalogs;
}

export function generateRouteManifest(outFile: string): RouteMeta[] {
    const catalogs = loadToolCatalogs();
    const routes = collectStaticRoutes(SITE_URL, catalogs);
    writeFileSync(outFile, JSON.stringify(routes), 'utf8');
    return routes;
}

if (import.meta.main) {
    const outFile = join(__dirname, '.generated-routes.json');
    const routes = generateRouteManifest(outFile);
    console.info(
        `[seo-routes] ${routes.length} routes (${Object.keys(loadToolCatalogs()).length} tools) → ${outFile}`,
    );
}
