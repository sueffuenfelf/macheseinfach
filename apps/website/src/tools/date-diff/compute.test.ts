import { describe, expect, test } from 'bun:test';
import { computeDateDiff } from './compute';

describe('date-diff', () => {
    test('same day', () => {
        const result = computeDateDiff({ a: '2026-01-01', b: '2026-01-01', inclusive: 'no' });
        expect(result.error).toBeUndefined();
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel['Differenz (Tage)']).toBe('0');
    });

    test('forward week', () => {
        const result = computeDateDiff({ a: '2026-01-01', b: '2026-01-08', inclusive: 'no' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel['Differenz (Tage)']).toBe('7');
    });

    test('inclusive span', () => {
        const result = computeDateDiff({ a: '2026-01-01', b: '2026-01-03', inclusive: 'yes' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel['Spanne inkl. beider Tage']).toBe('3');
    });
});
