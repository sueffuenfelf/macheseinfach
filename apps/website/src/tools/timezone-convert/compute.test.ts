import { describe, expect, test } from 'bun:test';
import { computeTimezoneConvert } from './compute';

describe('timezone-convert', () => {
    test('berlin to utc winter', () => {
        const result = computeTimezoneConvert({
            date: '2026-01-15',
            time: '12:00',
            fromZone: 'Europe/Berlin',
            toZone: 'UTC',
        });
        expect(result.error).toBeUndefined();
        const target = result.rows.find((r) => r.label === 'Ziel')?.value as string;
        expect(target).toContain('11:00');
    });
});
