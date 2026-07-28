import { describe, expect, test } from 'bun:test';
import { computeAge } from './compute';

describe('age-calculator', () => {
    test('exact birthday', () => {
        const result = computeAge({ birth: '2000-01-01', reference: '2026-01-01' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel.Alter).toBe('26 Jahre, 0 Monate, 0 Tage');
    });

    test('partial year', () => {
        const result = computeAge({ birth: '2000-06-15', reference: '2026-01-01' });
        expect(result.heading).toBe('25 Jahre');
    });
});
