import { describe, expect, test } from 'bun:test';
import { computeProbationEnd } from './compute';

describe('probation-end', () => {
    test('6 months probation', () => {
        const result = computeProbationEnd({ startDate: '2026-01-15', months: '6' });
        expect(result.error).toBeUndefined();
        expect(result.rows.length).toBeGreaterThan(0);
    });
});
