import { describe, expect, test } from 'bun:test';
import { computeCommuteAllowance } from './compute';

describe('commute-allowance compute', () => {
    test('2026 flat 0.38', () => {
        const result = computeCommuteAllowance({ year: '2026', km: '10', days: '200' });
        expect(result.error).toBeUndefined();
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        // 10 * 0.38 * 200 = 760
        expect(byLabel.Jahresbetrag).toBe('760,00\u00a0€');
    });

    test('2025 tiered rates', () => {
        const result = computeCommuteAllowance({ year: '2025', km: '25', days: '200' });
        expect(result.error).toBeUndefined();
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        // (20*0.30 + 5*0.38) * 200 = (6 + 1.9) * 200 = 1580
        expect(byLabel.Jahresbetrag).toBe('1.580,00\u00a0€');
    });

    test('invalid km', () => {
        expect(computeCommuteAllowance({ year: '2026', km: '0', days: '200' }).error).toBeTruthy();
    });
});
