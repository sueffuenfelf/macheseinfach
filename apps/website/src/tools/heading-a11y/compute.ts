import type { PasteFinding } from '../_shared/shells';
import { extractHeadings } from '../_shared/seo/html';

export function analyzeHeadingA11y(input: string): PasteFinding[] {
    const trimmed = input.trim();
    if (!trimmed) return [{ id: 'empty', severity: 'error', title: 'Keine Eingabe' }];
    const headings = extractHeadings(trimmed);
    if (!headings.length) {
        return [{ id: 'none', severity: 'warn', title: 'Keine Überschriften', detail: 'HTML mit h1–h6 einfügen.' }];
    }
    const findings: PasteFinding[] = [];
    const h1s = headings.filter((h) => h.level === 1);
    if (h1s.length === 0) findings.push({ id: 'no-h1', severity: 'error', title: 'Kein H1 — Seitentitel fehlt' });
    else if (h1s.length > 1) findings.push({ id: 'multi-h1', severity: 'warn', title: `${h1s.length} H1-Elemente` });
    else findings.push({ id: 'h1', severity: 'ok', title: 'Eine H1 vorhanden' });
    let prev = 0;
    for (const h of headings) {
        if (prev > 0 && h.level > prev + 1) {
            findings.push({
                id: `skip-${h.level}-${h.text.slice(0, 8)}`,
                severity: 'warn',
                title: `Ebene übersprungen: H${prev} → H${h.level}`,
                detail: `"${h.text}" — fehlende Zwischenüberschrift.`,
            });
        }
        if (!h.text.trim()) {
            findings.push({ id: 'empty-h', severity: 'error', title: `Leere H${h.level}` });
        }
        prev = h.level;
    }
    findings.push({
        id: 'outline', severity: 'info', title: 'Gliederung',
        detail: headings.map((h) => `${'  '.repeat(h.level - 1)}H${h.level}: ${h.text}`).join('\n'),
    });
    return findings;
}
