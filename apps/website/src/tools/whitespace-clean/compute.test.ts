import { describe, expect, test } from 'bun:test';
import { generateWhitespaceClean } from './compute';

describe('whitespace-clean', () => {
    test('collapse spaces', () => {
        const out = generateWhitespaceClean({ text: 'a   b\t\tc', mode: 'collapse' });
        expect(out?.kind).toBe('text');
        if (out?.kind === 'text') expect(out.content).toBe('a b c');
    });

    test('one-line', () => {
        const out = generateWhitespaceClean({ text: 'a\n\nb  c', mode: 'one-line' });
        expect(out?.kind).toBe('text');
        if (out?.kind === 'text') expect(out.content).toBe('a b c');
    });

    test('blank-lines', () => {
        const out = generateWhitespaceClean({ text: 'a\n\n\n\nb', mode: 'blank-lines' });
        expect(out?.kind).toBe('text');
        if (out?.kind === 'text') expect(out.content).toBe('a\n\nb');
    });
});
