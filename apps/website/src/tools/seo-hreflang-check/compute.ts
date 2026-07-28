import type { PasteFinding } from '../_shared/shells';
import { extractHreflangLinks } from '../_shared/seo/html';

const VALID_LANG = /^[a-z]{2}(-[a-z]{2})?$/i;

/** Check hreflang alternate links in HTML. */
export function analyzeHreflang(input: string): PasteFinding[] {
    const trimmed = input.trim();
    if (!trimmed) {
        return [{ id: 'empty', severity: 'error', title: 'Leere Eingabe' }];
    }

    const links = extractHreflangLinks(trimmed);
    if (links.length === 0) {
        return [
            {
                id: 'none',
                severity: 'warn',
                title: 'Keine hreflang-Links gefunden',
                detail: '<link rel="alternate" hreflang="…" href="…">',
            },
        ];
    }

    const findings: PasteFinding[] = [
        {
            id: 'count',
            severity: 'ok',
            title: `${links.length} hreflang-Link${links.length === 1 ? '' : 's'}`,
        },
    ];

    const langs = new Set<string>();
    const hasXDefault = links.some((l) => l.hreflang === 'x-default');

    for (const link of links) {
        const { hreflang, href } = link;
        findings.push({
            id: `lang-${hreflang}`,
            severity: 'info',
            title: `${hreflang} → ${href}`,
        });

        if (langs.has(hreflang)) {
            findings.push({
                id: `dup-${hreflang}`,
                severity: 'error',
                title: `Doppeltes hreflang: ${hreflang}`,
            });
        }
        langs.add(hreflang);

        if (hreflang !== 'x-default' && !VALID_LANG.test(hreflang)) {
            findings.push({
                id: `invalid-${hreflang}`,
                severity: 'warn',
                title: `Ungewöhnliches hreflang: ${hreflang}`,
                detail: 'Erwartet z. B. de, de-DE, en-GB oder x-default.',
            });
        }

        if (!href.startsWith('http://') && !href.startsWith('https://')) {
            findings.push({
                id: `relative-${hreflang}`,
                severity: 'warn',
                title: `Relative URL für ${hreflang}`,
                detail: href,
            });
        }
    }

    if (!hasXDefault && links.length > 1) {
        findings.push({
            id: 'no-x-default',
            severity: 'info',
            title: 'Kein x-default',
            detail: 'Optional, aber empfohlen als Fallback.',
        });
    }

    const deLinks = links.filter((l) => l.hreflang === 'de' || l.hreflang === 'de-de');
    if (deLinks.length === 0 && links.some((l) => l.hreflang.startsWith('de'))) {
        /* has de-* variant */
    } else if (deLinks.length === 0 && links.length > 0) {
        findings.push({
            id: 'no-de',
            severity: 'info',
            title: 'Kein de/de-DE Eintrag',
            detail: 'Für DACH-Sites oft sinnvoll.',
        });
    }

    return findings;
}
