import { describe, expect, test } from 'bun:test';
import { computeWithdrawalPeriod } from './compute';

describe('withdrawal-period', () => {
    test('14 days from start', () => {
        const result = computeWithdrawalPeriod({ startDate: '2026-01-01', days: '14' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel['Letzter Tag der Frist']).toContain('15. Januar 2026');
    });
});
