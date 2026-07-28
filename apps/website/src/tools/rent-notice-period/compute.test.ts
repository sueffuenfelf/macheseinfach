import { describe, expect, test } from 'bun:test';
import { computeRentNoticePeriod } from './compute';

describe('rent-notice-period', () => {
    test('tenant 3-month notice to month end', () => {
        const result = computeRentNoticePeriod({
            role: 'tenant',
            start: '2020-01-01',
            today: '2024-03-01',
        });
        expect(result.error).toBeUndefined();
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, String(r.value)]));
        expect(byLabel['Frist (Monate)']).toBe('3');
        expect(byLabel['Frühestes Ende']).toBe('31.5.2024');
    });

    test('landlord longer tenure needs 9 months', () => {
        const result = computeRentNoticePeriod({
            role: 'landlord',
            start: '2010-01-01',
            today: '2024-01-02',
        });
        expect(result.error).toBeUndefined();
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, String(r.value)]));
        expect(byLabel['Frist (Monate)']).toBe('9');
    });

    test('missing start yields error', () => {
        const result = computeRentNoticePeriod({ role: 'tenant', start: '', today: '2024-01-01' });
        expect(result.error).toBeTruthy();
    });
});
