import type { PasteFinding } from '../_shared/shells';
import { extractHeadings } from '../_shared/seo/html';

/** Extract H1–H6 outline from HTML paste. */
export function analyzeHeadings(input: string): PasteFinding[] {
    const trimmed = input.trim();
    if (!trimmed) {
        return [{ id: 'empty', severity: 'error', title: 'Leere Eingabe' }];
    }

    const headings = extractHeadings(trimmed);
    if (headings.length === 0) {
        return [
            {
                id: 'no-headings',
                severity: 'warn',
                title: 'Keine Überschriften gefunden',
                detail: 'HTML mit <h1>–<h6> einfügen.',
            },
        ];
    }

    const findings: PasteFinding[] = [
        {
            id: 'count',
            severity: 'ok',
            title: `${headings.length} Überschrift${headings.length === 1 ? '' : 'en'}`,
        },
    ];

    const h1s = headings.filter((h) => h.level === 1);
    if (h1s.length === 0) {
        findings.push({
            id: 'no-h1',
            severity: 'warn',
            title: 'Kein H1',
            detail: 'Jede Seite sollte genau eine H1 haben.',
        });
    } else if (h1s.length > 1) {
        findings.push({
            id: 'multi-h1',
            severity: 'warn',
            title: `${h1s.length} H1-Elemente`,
            detail: 'Mehrere H1 können die Struktur verwässern.',
        });
    } else {
        findings.push({ id: 'h1-ok', severity: 'ok', title: 'Eine H1 gefunden' });
    }

    let prevLevel = 0;
    for (const h of headings) {
        const indent = '  '.repeat(h.level - 1);
        findings.push({
            id: `h${h.level}-${h.text.slice(0, 20)}`,
            severity: 'info',
            title: `${indent}H${h.level}: ${h.text}`,
        });
        if (prevLevel > 0 && h.level > prevLevel + 1) {
            findings.push({
                id: `skip-${h.text.slice(0, 10)}`,
                severity: 'warn',
                title: `Ebene übersprungen vor H${h.level}`,
                detail: `Nach H${prevLevel} direkt H${h.level} — H${prevLevel + 1} fehlt.`,
            });
        }
        prevLevel = h.level;
    }

    return findings;
}
