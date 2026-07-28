import type { PasteFinding } from '../_shared/shells';

/** Parse a query string or full URL into key/value findings. */
export function analyzeQueryString(input: string): PasteFinding[] {
    const trimmed = input.trim();
    if (!trimmed) {
        return [
            {
                id: 'empty',
                severity: 'info',
                title: 'Leere Eingabe',
                detail: 'Query-String oder URL mit ?… einfügen.',
            },
        ];
    }

    let search = trimmed;
    try {
        if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('//')) {
            const url = new URL(trimmed.startsWith('//') ? `https:${trimmed}` : trimmed);
            search = url.search.startsWith('?') ? url.search.slice(1) : url.search;
            if (!search && url.hash.includes('?')) {
                search = url.hash.slice(url.hash.indexOf('?') + 1);
            }
        } else if (trimmed.includes('?')) {
            search = trimmed.slice(trimmed.indexOf('?') + 1);
        } else if (trimmed.startsWith('?')) {
            search = trimmed.slice(1);
        }
    } catch {
        return [
            {
                id: 'url-error',
                severity: 'error',
                title: 'URL nicht lesbar',
                detail: 'Als Query-String ohne Schema versuchen (a=1&b=2).',
            },
        ];
    }

    if (!search) {
        return [
            {
                id: 'no-query',
                severity: 'warn',
                title: 'Keine Query-Parameter',
                detail: 'URL ohne ?… oder leerer Query-Teil.',
            },
        ];
    }

    const params = new URLSearchParams(search);
    const findings: PasteFinding[] = [
        {
            id: 'count',
            severity: 'ok',
            title: `${[...params.keys()].length} Parameter`,
        },
    ];

    for (const [key, value] of params.entries()) {
        findings.push({
            id: `p-${key}-${findings.length}`,
            severity: 'info',
            title: key || '(leer)',
            detail: value,
        });
    }

    return findings;
}
