import { describe, expect, test } from 'bun:test';
import { analyzeQueryString } from './compute';

describe('query-string-parse', () => {
    test('parses raw query', () => {
        const findings = analyzeQueryString('a=1&b=zwei');
        expect(findings.some((f) => f.title === 'a' && f.detail === '1')).toBe(true);
        expect(findings.some((f) => f.title === 'b' && f.detail === 'zwei')).toBe(true);
    });

    test('parses url', () => {
        const findings = analyzeQueryString('https://ex.test/x?q=hi');
        expect(findings.some((f) => f.title === 'q' && f.detail === 'hi')).toBe(true);
    });
});
