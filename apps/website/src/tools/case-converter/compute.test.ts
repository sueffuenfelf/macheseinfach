import { describe, expect, test } from 'bun:test';
import type { FieldValues } from '../_shared/shells';
import { generateCaseConvert } from './compute';

function run(patch: FieldValues) {
    return generateCaseConvert(patch);
}

describe('case-converter', () => {
    test('upper', () => {
        const out = run({ text: 'größe', mode: 'upper' });
        expect(out?.kind).toBe('text');
        if (out?.kind === 'text') expect(out.content).toBe('GRÖSSE');
    });

    test('lower', () => {
        const out = run({ text: 'Hallo WELT', mode: 'lower' });
        expect(out?.kind).toBe('text');
        if (out?.kind === 'text') expect(out.content).toBe('hallo welt');
    });

    test('title', () => {
        const out = run({ text: 'hallo welt', mode: 'title' });
        expect(out?.kind).toBe('text');
        if (out?.kind === 'text') expect(out.content).toBe('Hallo Welt');
    });
});
