import { describe, expect, test } from 'bun:test';
import { computeRentVsBuy } from './compute';

describe('rent-vs-buy', () => {
    test('computes rent total', () => {
        const result = computeRentVsBuy({
            rent: '1000',
            price: '300000',
            equity: '60000',
            years: '10',
            ratePct: '3',
        });
        expect(result.error).toBeUndefined();
        const byLabel = Object.fromEntries(
            result.rows.map((r) => [r.label, String(r.value).replace(/\u00a0/g, ' ')]),
        );
        expect(byLabel['Miete über 10 Jahre']).toBe('120.000,00 €');
    });
});
