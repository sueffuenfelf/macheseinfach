import type { PasteFinding } from '../_shared/shells';

const REQUIRED_FIELDS: Record<string, string[]> = {
    LocalBusiness: ['name', 'address'],
    Organization: ['name', 'url'],
    WebSite: ['name', 'url'],
    FAQPage: ['mainEntity'],
    Article: ['headline', 'author', 'datePublished'],
    BreadcrumbList: ['itemListElement'],
    Product: ['name', 'offers'],
};

function extractJsonLdBlocks(input: string): string[] {
    const blocks: string[] = [];
    const scriptRe = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let m: RegExpExecArray | null;
    while ((m = scriptRe.exec(input)) !== null) {
        if (m[1]?.trim()) blocks.push(m[1].trim());
    }
    const trimmed = input.trim();
    if (blocks.length === 0 && (trimmed.startsWith('{') || trimmed.startsWith('['))) {
        blocks.push(trimmed);
    }
    return blocks;
}

function checkObject(obj: Record<string, unknown>, findings: PasteFinding[], prefix: string): void {
    const type = obj['@type'];
    const types = Array.isArray(type) ? type : type ? [type] : [];
    if (types.length === 0) {
        findings.push({
            id: `${prefix}-no-type`,
            severity: 'warn',
            title: 'Kein @type',
            detail: 'Schema.org-Typ fehlt.',
        });
        return;
    }
    for (const t of types) {
        const typeName = String(t);
        findings.push({
            id: `${prefix}-type-${typeName}`,
            severity: 'ok',
            title: `@type: ${typeName}`,
        });
        const required = REQUIRED_FIELDS[typeName];
        if (required) {
            for (const field of required) {
                if (!(field in obj)) {
                    findings.push({
                        id: `${prefix}-missing-${field}`,
                        severity: 'warn',
                        title: `${typeName}: „${field}" fehlt`,
                        detail: 'Empfohlenes Pflichtfeld für Rich Results.',
                    });
                }
            }
        }
    }
    if (!obj['@context']) {
        findings.push({
            id: `${prefix}-no-context`,
            severity: 'warn',
            title: '@context fehlt',
            detail: 'Üblich: https://schema.org',
        });
    }
}

/** Parse JSON-LD and report syntax + schema issues. */
export function analyzeStructuredData(input: string): PasteFinding[] {
    const trimmed = input.trim();
    if (!trimmed) {
        return [{ id: 'empty', severity: 'error', title: 'Leere Eingabe' }];
    }

    const blocks = extractJsonLdBlocks(trimmed);
    if (blocks.length === 0) {
        return [
            {
                id: 'no-jsonld',
                severity: 'error',
                title: 'Kein JSON-LD gefunden',
                detail: 'Script-Tag oder rohes JSON einfügen.',
            },
        ];
    }

    const findings: PasteFinding[] = [
        {
            id: 'block-count',
            severity: 'info',
            title: `${blocks.length} JSON-LD-Block${blocks.length === 1 ? '' : 's'}`,
        },
    ];

    blocks.forEach((block, i) => {
        const prefix = `block-${i}`;
        let parsed: unknown;
        try {
            parsed = JSON.parse(block);
        } catch (e) {
            findings.push({
                id: `${prefix}-syntax`,
                severity: 'error',
                title: `Block ${i + 1}: JSON-Syntaxfehler`,
                detail: e instanceof Error ? e.message : 'Ungültiges JSON',
            });
            return;
        }
        findings.push({ id: `${prefix}-syntax-ok`, severity: 'ok', title: `Block ${i + 1}: JSON gültig` });

        if (Array.isArray(parsed)) {
            for (let j = 0; j < parsed.length; j++) {
                const item = parsed[j];
                if (item && typeof item === 'object') {
                    checkObject(item as Record<string, unknown>, findings, `${prefix}-${j}`);
                }
            }
        } else if (parsed && typeof parsed === 'object') {
            const obj = parsed as Record<string, unknown>;
            if (Array.isArray(obj['@graph'])) {
                for (let j = 0; j < (obj['@graph'] as unknown[]).length; j++) {
                    const item = (obj['@graph'] as unknown[])[j];
                    if (item && typeof item === 'object') {
                        checkObject(item as Record<string, unknown>, findings, `${prefix}-g${j}`);
                    }
                }
            } else {
                checkObject(obj, findings, prefix);
            }
        }
    });

    return findings;
}
