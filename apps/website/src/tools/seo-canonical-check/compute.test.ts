import { describe, expect, test } from 'bun:test';
import { analyzeCanonical } from './compute';

describe('seo-canonical-check', () => {
    test('single canonical ok', () => {
        const findings = analyzeCanonical(
            '<link rel="canonical" href="https://beispiel.de/seite" />',
        );
        expect(findings.some((f) => f.id === 'single')).toBe(true);
    });

    test('multiple canonicals error', () => {
        const html =
            '<link rel="canonical" href="https://a.de" /><link rel="canonical" href="https://b.de" />';
        expect(analyzeCanonical(html).some((f) => f.id === 'multiple')).toBe(true);
    });
});
