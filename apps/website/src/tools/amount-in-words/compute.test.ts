import { describe, expect, test } from 'bun:test';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { computeAmountInWords, formatAmountInWordsDe } from './compute';

function run(patch: Partial<FieldValues>): CalcResult {
    return computeAmountInWords({ amount: '', ...patch });
}

describe('amount-in-words compute', () => {
    test('formatAmountInWordsDe — whole euros', () => {
        expect(formatAmountInWordsDe(1)).toBe('ein Euro');
        expect(formatAmountInWordsDe(21)).toBe('einundzwanzig Euro');
        expect(formatAmountInWordsDe(100)).toBe('einhundert Euro');
    });

    test('formatAmountInWordsDe — with cents', () => {
        expect(formatAmountInWordsDe(123.45)).toBe(
            'einhundertdreiundzwanzig Euro und fünfundvierzig Cent',
        );
        expect(formatAmountInWordsDe(42.99)).toBe(
            'zweiundvierzig Euro und neunundneunzig Cent',
        );
    });

    test('shell compute capitalizes result', () => {
        const result = run({ amount: '123,45' });
        expect(result.error).toBeUndefined();
        expect(result.rows[0]?.value).toBe(
            'Einhundertdreiundzwanzig Euro und fünfundvierzig Cent',
        );
    });

    test('invalid amount yields error', () => {
        const result = run({ amount: 'abc' });
        expect(result.error).toBeTruthy();
        expect(result.rows).toEqual([]);
    });
});
