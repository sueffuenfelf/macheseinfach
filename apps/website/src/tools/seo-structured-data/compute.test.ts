import { describe, expect, test } from 'bun:test';
import { analyzeStructuredData } from './compute';

describe('seo-structured-data', () => {
    test('valid LocalBusiness with missing address', () => {
        const json = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Test',
        });
        const findings = analyzeStructuredData(json);
        expect(findings.some((f) => f.title.includes('LocalBusiness'))).toBe(true);
        expect(findings.some((f) => f.title.includes('address'))).toBe(true);
    });

    test('syntax error', () => {
        const findings = analyzeStructuredData('{ invalid');
        expect(findings.some((f) => f.severity === 'error')).toBe(true);
    });
});
