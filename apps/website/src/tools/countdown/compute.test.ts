import { describe, expect, test } from 'bun:test';
import { computeCountdown } from './compute';

describe('countdown', () => {
    test('future days', () => {
        const result = computeCountdown({
            target: '2026-01-08',
            reference: '2026-01-01',
        });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel.Tage).toBe('7');
        expect(result.heading).toBe('Noch 7 Tage');
    });

    test('past days', () => {
        const result = computeCountdown({
            target: '2026-01-01',
            reference: '2026-01-08',
        });
        expect(result.heading).toBe('Vor 7 Tagen');
    });
});
