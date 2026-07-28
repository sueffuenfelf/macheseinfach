import { describe, expect, test } from 'bun:test';
import { analyzeHreflang } from './compute';

describe('seo-hreflang-check', () => {
    test('finds hreflang links', () => {
        const html = `
            <link rel="alternate" hreflang="de" href="https://beispiel.de/" />
            <link rel="alternate" hreflang="en" href="https://beispiel.de/en/" />
        `;
        const findings = analyzeHreflang(html);
        expect(findings.some((f) => f.id === 'count')).toBe(true);
        expect(findings.some((f) => f.title.includes('de →'))).toBe(true);
    });

    test('warns when none', () => {
        expect(analyzeHreflang('<html></html>')[0]?.id).toBe('none');
    });
});
