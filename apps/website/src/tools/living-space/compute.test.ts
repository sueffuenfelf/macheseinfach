import { describe, expect, test } from 'bun:test';
import { computeLivingSpace } from './compute';

describe('living-space', () => {
    test('rectangle', () => {
        const result = computeLivingSpace({ shape: 'rect', w1: '4', l1: '5' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, String(r.value)]));
        expect(byLabel.Fläche).toBe('20 m²');
    });

    test('L-shape sums two rectangles', () => {
        const result = computeLivingSpace({
            shape: 'l',
            w1: '4',
            l1: '5',
            w2: '2',
            l2: '3',
        });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, String(r.value)]));
        expect(byLabel.Summe).toBe('26 m²');
    });
});
