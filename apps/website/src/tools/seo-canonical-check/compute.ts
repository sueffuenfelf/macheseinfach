import type { PasteFinding } from '../_shared/shells';
import { extractCanonicalLinks } from '../_shared/seo/html';

/** Check canonical link tags in HTML paste. */
export function analyzeCanonical(input: string): PasteFinding[] {
    const trimmed = input.trim();
    if (!trimmed) {
        return [{ id: 'empty', severity: 'error', title: 'Leere Eingabe' }];
    }

    const canonicals = extractCanonicalLinks(trimmed);
    const findings: PasteFinding[] = [];

    if (canonicals.length === 0) {
        findings.push({
            id: 'missing',
            severity: 'warn',
            title: 'Kein canonical-Link gefunden',
            detail: '<link rel="canonical" href="…"> fehlt.',
        });
        return findings;
    }

    if (canonicals.length === 1) {
        findings.push({
            id: 'single',
            severity: 'ok',
            title: 'Ein canonical gefunden',
            detail: canonicals[0],
        });
    } else {
        findings.push({
            id: 'multiple',
            severity: 'error',
            title: `${canonicals.length} canonical-Tags`,
            detail: canonicals.join('\n'),
        });
    }

    const unique = new Set(canonicals);
    if (unique.size < canonicals.length) {
        findings.push({
            id: 'duplicate',
            severity: 'error',
            title: 'Doppelte canonical-URLs',
        });
    }

    for (const url of canonicals) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            findings.push({
                id: 'relative',
                severity: 'warn',
                title: 'Relative canonical-URL',
                detail: url,
            });
        }
    }

    return findings;
}
