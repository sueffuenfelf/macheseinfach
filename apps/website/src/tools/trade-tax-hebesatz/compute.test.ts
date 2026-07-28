import { describe, expect, test } from 'bun:test';
import { computeTradeTaxHebesatz } from './compute';

describe('trade-tax-hebesatz compute', () => {
    test('sole trader with allowance', () => {
        // (50000 - 24500) * 0.035 * 4.00 = 25500 * 0.035 * 4 = 3570
        const result = computeTradeTaxHebesatz({
            profit: '50000',
            hebesatz: '400',
            entity: 'sole',
        });
        expect(result.error).toBeUndefined();
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel['Gewerbesteuer grob']).toBe('3.570,00\u00a0€');
    });

    test('corp no allowance', () => {
        // 50000 * 0.035 * 4 = 7000
        const result = computeTradeTaxHebesatz({
            profit: '50000',
            hebesatz: '400',
            entity: 'corp',
        });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel['Gewerbesteuer grob']).toBe('7.000,00\u00a0€');
    });

    test('below allowance yields zero', () => {
        const result = computeTradeTaxHebesatz({
            profit: '20000',
            hebesatz: '400',
            entity: 'sole',
        });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel['Gewerbesteuer grob']).toBe('0,00\u00a0€');
    });
});
