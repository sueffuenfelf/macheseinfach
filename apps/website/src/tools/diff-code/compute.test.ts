import { describe, expect, test } from 'bun:test';
import { generateCodeDiff } from './compute';

describe('diff-code', () => {
    test('shows added line', () => {
        const out = generateCodeDiff({ a: 'a\n', b: 'a\nb\n' });
        expect(out?.kind).toBe('code');
        if (out?.kind === 'code') {
            expect(out.content).toContain('+b');
            expect(out.content).toContain('Code-Diff');
        }
    });
});
