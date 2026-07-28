import { describe, expect, test } from 'bun:test';
import { computeWorkingHours } from './compute';

describe('working-hours', () => {
    test('standard shift', () => {
        const result = computeWorkingHours({ start: '09:00', end: '17:00', breakMin: '30' });
        const netto = result.rows.find((r) => r.label === 'Netto-Arbeitszeit')?.value as string;
        expect(netto).toContain('7h 30min');
    });

    test('overnight shift', () => {
        const result = computeWorkingHours({ start: '22:00', end: '06:00', breakMin: '0' });
        expect(result.hint).toContain('Folgetag');
        expect(result.heading).toBe('8h 0min');
    });
});
