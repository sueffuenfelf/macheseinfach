import { describe, expect, test } from 'bun:test';
import { computeCalendarWeek } from './compute';

describe('calendar-week', () => {
    test('first monday 2026', () => {
        const result = computeCalendarWeek({ date: '2026-01-05' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel['Kalenderwoche (ISO)']).toBe('KW 2');
    });
});
