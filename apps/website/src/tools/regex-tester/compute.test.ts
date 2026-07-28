import { describe, expect, test } from 'bun:test';
import { generateRegexTest } from './compute';

describe('regex-tester', () => {
    test('finds digits', () => {
        const out = generateRegexTest({
            pattern: '\\d+',
            flags: 'g',
            text: 'a 12 b 3',
        });
        expect(out?.kind).toBe('code');
        if (out?.kind === 'code') {
            expect(out.content).toContain('Match @');
            expect(out.content).toContain('"12"');
        }
    });

    test('invalid pattern', () => {
        const out = generateRegexTest({ pattern: '(', flags: 'g', text: 'x' });
        if (out?.kind === 'text') expect(out.content).toContain('Fehler');
    });
});
