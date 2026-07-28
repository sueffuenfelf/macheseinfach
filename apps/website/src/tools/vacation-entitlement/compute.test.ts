import { describe, expect, test } from 'bun:test';
import { computeVacationEntitlement } from './compute';

describe('vacation-entitlement', () => {
    test('half year 5-day week', () => {
        const result = computeVacationEntitlement({ workDaysPerWeek: '5', months: '6' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel['Anteiliger Anspruch (ca.)']).toBe('10 Tage');
    });
});
