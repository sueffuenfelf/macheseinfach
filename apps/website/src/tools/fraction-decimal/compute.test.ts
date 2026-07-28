import { describe, expect, test } from 'bun:test';
import { computeFractionDecimal } from './compute';

describe('fraction-decimal', () => {
    test('fraction to decimal', () => {
        const result = computeFractionDecimal({ mode: 'to-decimal', input: '3/4' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, String(r.value)]));
        expect(byLabel.Dezimal).toBe('0,75');
    });

    test('decimal to fraction', () => {
        const result = computeFractionDecimal({ mode: 'to-fraction', input: '0,75' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel.Bruch).toBe('3/4');
    });
});
