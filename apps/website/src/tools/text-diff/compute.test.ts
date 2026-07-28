import { describe, expect, test } from 'bun:test';
import { generateTextDiff } from './compute';

describe('text-diff', () => {
    test('produces patch with changes', () => {
        const out = generateTextDiff({ a: 'eins\nzwei\n', b: 'eins\ndrei\n' });
        expect(out?.kind).toBe('code');
        if (out?.kind === 'code') {
            expect(out.content).toContain('-zwei');
            expect(out.content).toContain('+drei');
        }
    });

    test('identical texts', () => {
        const out = generateTextDiff({ a: 'same', b: 'same' });
        expect(out?.kind).toBe('code');
        if (out?.kind === 'code') {
            expect(out.content).toContain('−0 / +0');
        }
    });
});
