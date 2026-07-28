import { XMLParser } from 'fast-xml-parser';
import type { PasteFinding } from '../_shared/shells';

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
});

function countUrls(node: unknown): number {
    if (!node || typeof node !== 'object') return 0;
    const obj = node as Record<string, unknown>;
    if (Array.isArray(obj.url)) return obj.url.length;
    if (obj.url) return 1;
    return 0;
}

function countSitemaps(node: unknown): number {
    if (!node || typeof node !== 'object') return 0;
    const obj = node as Record<string, unknown>;
    if (Array.isArray(obj.sitemap)) return obj.sitemap.length;
    if (obj.sitemap) return 1;
    return 0;
}

/** Validate sitemap XML and return findings. */
export function analyzeSitemap(input: string): PasteFinding[] {
    const trimmed = input.trim();
    if (!trimmed) {
        return [{ id: 'empty', severity: 'error', title: 'Leere Eingabe', detail: 'XML einfügen.' }];
    }

    const findings: PasteFinding[] = [];

    let parsed: unknown;
    try {
        parsed = parser.parse(trimmed);
    } catch (e) {
        return [
            {
                id: 'parse-error',
                severity: 'error',
                title: 'XML nicht lesbar',
                detail: e instanceof Error ? e.message : 'Ungültiges XML',
            },
        ];
    }

    if (!parsed || typeof parsed !== 'object') {
        return [{ id: 'no-root', severity: 'error', title: 'Kein Wurzelelement' }];
    }

    const root = parsed as Record<string, unknown>;
    const hasUrlset = 'urlset' in root;
    const hasIndex = 'sitemapindex' in root;

    if (!hasUrlset && !hasIndex) {
        findings.push({
            id: 'unknown-root',
            severity: 'error',
            title: 'Unbekanntes Wurzelelement',
            detail: 'Erwartet <urlset> oder <sitemapindex>.',
        });
        return findings;
    }

    if (hasUrlset) {
        const urlset = root.urlset as Record<string, unknown>;
        const xmlns = urlset['@_xmlns'];
        if (xmlns && !String(xmlns).includes('sitemaps.org')) {
            findings.push({
                id: 'xmlns',
                severity: 'warn',
                title: 'Ungewöhnlicher xmlns',
                detail: String(xmlns),
            });
        }
        const urlCount = countUrls(urlset);
        if (urlCount === 0) {
            findings.push({
                id: 'no-urls',
                severity: 'error',
                title: 'Keine <url>-Einträge',
            });
        } else {
            findings.push({
                id: 'url-count',
                severity: 'ok',
                title: `${urlCount} URL${urlCount === 1 ? '' : 's'} gefunden`,
            });
            if (urlCount > 50_000) {
                findings.push({
                    id: 'url-limit',
                    severity: 'warn',
                    title: 'Mehr als 50.000 URLs',
                    detail: 'Google empfiehlt Aufteilung in mehrere Sitemaps.',
                });
            }
        }
        const urls = Array.isArray(urlset.url) ? urlset.url : urlset.url ? [urlset.url] : [];
        for (let i = 0; i < Math.min(urls.length, 5); i++) {
            const u = urls[i] as Record<string, unknown>;
            const loc = u?.loc;
            if (!loc) {
                findings.push({
                    id: `missing-loc-${i}`,
                    severity: 'error',
                    title: `URL #${i + 1} ohne <loc>`,
                });
            }
        }
    }

    if (hasIndex) {
        const index = root.sitemapindex as Record<string, unknown>;
        const count = countSitemaps(index);
        if (count === 0) {
            findings.push({
                id: 'no-sitemaps',
                severity: 'error',
                title: 'Keine <sitemap>-Einträge',
            });
        } else {
            findings.push({
                id: 'sitemap-count',
                severity: 'ok',
                title: `${count} Sitemap${count === 1 ? '' : 's'} im Index`,
            });
        }
    }

    if (findings.every((f) => f.severity === 'ok' || f.severity === 'info')) {
        findings.unshift({
            id: 'valid',
            severity: 'ok',
            title: 'XML-Struktur gültig',
        });
    }

    return findings;
}
