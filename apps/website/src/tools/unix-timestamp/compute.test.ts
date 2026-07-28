import { describe, expect, test } from 'bun:test';
import { computeUnixTimestamp } from './compute';

describe('unix-timestamp', () => {
    test('seconds to date', () => {
        const result = computeUnixTimestamp({ mode: 'to-date', timestamp: '0' });
        expect(result.error).toBeUndefined();
        const utc = result.rows.find((r) => r.label === 'UTC')?.value as string;
        expect(utc).toBe('1970-01-01T00:00:00.000Z');
    });

    test('date to seconds', () => {
        const result = computeUnixTimestamp({
            mode: 'to-ts',
            date: '2026-01-01',
            time: '00:00',
        });
        expect(result.error).toBeUndefined();
        const unix = result.rows.find((r) => r.label === 'Unix (Sekunden)')?.value as string;
        expect(Number(unix)).toBeGreaterThan(0);
    });
});
