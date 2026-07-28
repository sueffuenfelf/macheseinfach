import { describe, expect, test } from 'bun:test';
import { computeDeHolidays } from './compute';

describe('de-holidays', () => {
    test('new year is holiday', () => {
        const result = computeDeHolidays({
            mode: 'date',
            date: '2026-01-01',
            region: 'NW',
            year: '2026',
        });
        expect(result.heading).toBe('Feiertag');
    });

    test('regular day', () => {
        const result = computeDeHolidays({
            mode: 'date',
            date: '2026-03-10',
            region: 'NW',
            year: '2026',
        });
        expect(result.heading).toBe('Kein Feiertag');
    });

    test('year list', () => {
        const result = computeDeHolidays({
            mode: 'year',
            year: '2026',
            region: 'BE',
            date: '',
        });
        expect(result.rows.length).toBeGreaterThan(5);
    });
});
