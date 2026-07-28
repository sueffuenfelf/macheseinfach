import { describe, expect, test } from 'bun:test';
import { analyzeHeadings } from './compute';

describe('seo-heading-outline', () => {
    test('extracts h1 and h2', () => {
        const findings = analyzeHeadings('<h1>Titel</h1><h2>Kapitel</h2>');
        expect(findings.some((f) => f.title.includes('H1: Titel'))).toBe(true);
        expect(findings.some((f) => f.id === 'h1-ok')).toBe(true);
    });

    test('warns on missing h1', () => {
        const findings = analyzeHeadings('<h2>Nur H2</h2>');
        expect(findings.some((f) => f.id === 'no-h1')).toBe(true);
    });
});
