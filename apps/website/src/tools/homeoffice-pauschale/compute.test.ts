import { describe, expect, test } from 'bun:test';
import { computeHomeofficePauschale } from './compute';

describe('homeoffice-pauschale compute', () => {
    test('180 days', () => {
        const result = computeHomeofficePauschale({ year: '2026', days: '180' });
        expect(result.error).toBeUndefined();
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel.Pauschale).toBe('1.080,00\u00a0€');
    });

    test('caps at 210 days', () => {
        const result = computeHomeofficePauschale({ year: '2025', days: '250' });
        expect(result.tone).toBe('warn');
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel['Tage angesetzt']).toBe('210');
        expect(byLabel.Pauschale).toBe('1.260,00\u00a0€');
    });

    test('invalid days', () => {
        expect(computeHomeofficePauschale({ year: '2026', days: '-1' }).error).toBeTruthy();
    });
});
