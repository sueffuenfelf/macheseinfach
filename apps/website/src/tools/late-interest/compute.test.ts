import { describe, expect, test } from 'bun:test';
import { computeLateInterest } from './compute';

describe('late-interest', () => {
    test('computes interest for 1000 EUR over 30 days', () => {
        const result = computeLateInterest({ amount: '1000', days: '30', ratePercent: '8' });
        expect(result.error).toBeUndefined();
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel['Zinsen (ca.)']).toBeTruthy();
    });
});
