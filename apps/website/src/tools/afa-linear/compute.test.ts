import { describe, expect, test } from 'bun:test';
import { computeAfaLinear } from './compute';

describe('afa-linear compute', () => {
    test('1200 over 3 years', () => {
        const result = computeAfaLinear({ cost: '1200', years: '3' });
        expect(result.error).toBeUndefined();
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel['AfA pro Jahr']).toBe('400,00\u00a0€');
        expect(String(byLabel['AfA pro Monat'])).toContain('33,33');
    });

    test('missing cost yields error', () => {
        expect(computeAfaLinear({ cost: '', years: '5' }).error).toBeTruthy();
    });

    test('zero years yields error', () => {
        expect(computeAfaLinear({ cost: '100', years: '0' }).error).toBeTruthy();
    });
});
