import { describe, expect, test } from 'bun:test';
import { computeBusinessDays } from './compute';

describe('business-days', () => {
    test('one week Mon–Fri', () => {
        const result = computeBusinessDays({
            from: '2026-01-05',
            to: '2026-01-09',
            holidays: 'no',
            region: 'NW',
        });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel.Werktage).toBe('4');
    });

    test('excludes weekend', () => {
        const result = computeBusinessDays({
            from: '2026-01-05',
            to: '2026-01-12',
            holidays: 'no',
            region: 'NW',
        });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel.Werktage).toBe('5');
    });

    test('labour day excluded', () => {
        const without = computeBusinessDays({
            from: '2026-04-30',
            to: '2026-05-04',
            holidays: 'no',
            region: 'NW',
        });
        const withHolidays = computeBusinessDays({
            from: '2026-04-30',
            to: '2026-05-04',
            holidays: 'yes',
            region: 'NW',
        });
        const noHol = Object.fromEntries(without.rows.map((r) => [r.label, r.value]));
        const yesHol = Object.fromEntries(withHolidays.rows.map((r) => [r.label, r.value]));
        expect(Number(noHol.Werktage)).toBeGreaterThan(Number(yesHol.Werktage));
    });
});
