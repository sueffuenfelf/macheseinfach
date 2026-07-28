import { describe, expect, test } from 'bun:test';
import { computeLimitationPeriodHint } from './compute';

describe('limitation-period-hint', () => {
    test('event in march 2024 ends dec 2027', () => {
        const result = computeLimitationPeriodHint({ eventDate: '2024-03-15' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel['Regelverjährung endet (ca.)']).toContain('2027');
    });
});
