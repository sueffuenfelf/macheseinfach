import type { PasteFinding } from '../_shared/shells';

type RobotsRule = {
    userAgent: string;
    allow: string[];
    disallow: string[];
};

function parseRobotsTxt(text: string): { rules: RobotsRule[]; sitemaps: string[] } {
    const rules: RobotsRule[] = [];
    const sitemaps: string[] = [];
    let current: RobotsRule | null = null;

    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.split('#')[0]?.trim() ?? '';
        if (!line) continue;

        const colon = line.indexOf(':');
        if (colon === -1) continue;
        const key = line.slice(0, colon).trim().toLowerCase();
        const value = line.slice(colon + 1).trim();

        if (key === 'user-agent') {
            if (current) rules.push(current);
            current = { userAgent: value, allow: [], disallow: [] };
        } else if (key === 'allow' && current) {
            current.allow.push(value || '/');
        } else if (key === 'disallow' && current) {
            current.disallow.push(value);
        } else if (key === 'sitemap') {
            sitemaps.push(value);
        }
    }
    if (current) rules.push(current);
    return { rules, sitemaps };
}

/** Parse robots.txt and return findings. */
export function analyzeRobotsTxt(input: string): PasteFinding[] {
    const trimmed = input.trim();
    if (!trimmed) {
        return [{ id: 'empty', severity: 'error', title: 'Leere Eingabe' }];
    }

    const { rules, sitemaps } = parseRobotsTxt(trimmed);
    const findings: PasteFinding[] = [];

    if (rules.length === 0) {
        findings.push({
            id: 'no-rules',
            severity: 'warn',
            title: 'Keine User-agent-Regeln',
            detail: 'Ohne Regeln sind alle Pfade erlaubt.',
        });
    } else {
        findings.push({
            id: 'rule-count',
            severity: 'ok',
            title: `${rules.length} User-agent-Block${rules.length === 1 ? '' : 's'}`,
        });
        for (const rule of rules) {
            const blocks = rule.disallow.filter((d) => d !== '');
            const allows = rule.allow;
            findings.push({
                id: `ua-${rule.userAgent}`,
                severity: 'info',
                title: `User-agent: ${rule.userAgent}`,
                detail: `${allows.length} Allow · ${blocks.length} Disallow`,
            });
            if (blocks.includes('/')) {
                findings.push({
                    id: `block-all-${rule.userAgent}`,
                    severity: 'warn',
                    title: `Komplett blockiert: ${rule.userAgent}`,
                    detail: 'Disallow: / verhindert Crawling der ganzen Site.',
                });
            }
        }
    }

    if (sitemaps.length > 0) {
        findings.push({
            id: 'sitemaps',
            severity: 'ok',
            title: `${sitemaps.length} Sitemap${sitemaps.length === 1 ? '' : 's'} deklariert`,
            detail: sitemaps.join('\n'),
        });
    } else {
        findings.push({
            id: 'no-sitemap',
            severity: 'info',
            title: 'Keine Sitemap-Zeile',
            detail: 'Optional, aber hilfreich für Crawler.',
        });
    }

    return findings;
}
