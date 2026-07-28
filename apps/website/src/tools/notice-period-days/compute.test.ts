import { describe, expect, test } from 'bun:test';
import { computeNoticePeriod } from './compute';

describe('notice-period-days', () => {
    test('four weeks to month end', () => {
        const result = computeNoticePeriod({ noticeDate: '2026-01-15', weeks: '4' });
        expect(result.error).toBeUndefined();
        const endRow = result.rows.find((r) => r.label === 'Ende des Monats')?.value as string;
        expect(endRow).toContain('Februar');
    });
});
