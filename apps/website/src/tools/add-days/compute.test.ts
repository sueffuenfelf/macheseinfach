import { describe, expect, test } from 'bun:test';
import { computeAddDays } from './compute';

describe('add-days', () => {
    test('add 14 days', () => {
        const result = computeAddDays({ start: '2026-01-01', amount: '14', unit: 'days' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel.Ergebnis).toContain('15. Januar 2026');
    });

    test('add one month from jan 31', () => {
        const result = computeAddDays({ start: '2026-01-31', amount: '1', unit: 'months' });
        expect(result.error).toBeUndefined();
    });
});
