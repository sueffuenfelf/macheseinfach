import type { PasteFinding } from '../_shared/shells';

const BAD_PATTERNS = [
    { re: /^hier$/i, label: '„hier“' },
    { re: /^klick(en)?\s*(sie|mich)?$/i, label: '„klicken“' },
    { re: /^mehr$/i, label: '„mehr“' },
    { re: /^weiter$/i, label: '„weiter“' },
    { re: /^link$/i, label: '„Link“' },
    { re: /^read\s+more$/i, label: '„read more“' },
];

function extractLinks(html: string): { text: string; href?: string }[] {
    const links: { text: string; href?: string }[] = [];
    const re = /<a\s[^>]*href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
        const href = m[1];
        const text = (m[2] ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        if (text) links.push({ text, href });
    }
    return links;
}

export function analyzeLinkText(input: string): PasteFinding[] {
    const trimmed = input.trim();
    if (!trimmed) return [{ id: 'empty', severity: 'error', title: 'Keine Eingabe' }];
    const links = extractLinks(trimmed);
    if (!links.length) {
        return [{ id: 'no-links', severity: 'warn', title: 'Keine Links gefunden', detail: 'HTML mit <a href="…"> einfügen.' }];
    }
    const findings: PasteFinding[] = [
        { id: 'count', severity: 'info', title: `${links.length} Link${links.length === 1 ? '' : 's'} gefunden` },
    ];
    for (const link of links) {
        const bad = BAD_PATTERNS.find((p) => p.re.test(link.text));
        if (bad) {
            findings.push({
                id: `bad-${link.text.slice(0, 12)}`,
                severity: 'warn',
                title: `Unklarer Linktext: „${link.text}“`,
                detail: `Vermeide ${bad.label} — Ziel im Linktext nennen.`,
            });
        } else if (link.text.length < 3) {
            findings.push({
                id: `short-${link.text}`,
                severity: 'warn',
                title: `Sehr kurzer Linktext: „${link.text}“`,
            });
        } else {
            findings.push({
                id: `ok-${link.text.slice(0, 12)}`,
                severity: 'ok',
                title: `„${link.text}“${link.href ? ` → ${link.href}` : ''}`,
            });
        }
    }
    return findings;
}
