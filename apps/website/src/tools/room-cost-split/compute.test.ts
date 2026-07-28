import { describe, expect, test } from 'bun:test';
import { computeRoomCostSplit } from './compute';

describe('room-cost-split', () => {
    test('equal split', () => {
        const result = computeRoomCostSplit({ total: '900', people: '3', mode: 'equal' });
        const byLabel = Object.fromEntries(
            result.rows.map((r) => [r.label, String(r.value).replace(/\u00a0/g, ' ')]),
        );
        expect(byLabel['Pro Person']).toBe('300,00 €');
    });

    test('by size', () => {
        const result = computeRoomCostSplit({
            total: '1000',
            people: '2',
            mode: 'by-size',
            sizes: '10, 30',
        });
        const byLabel = Object.fromEntries(
            result.rows.map((r) => [r.label, String(r.value).replace(/\u00a0/g, ' ')]),
        );
        expect(byLabel['Person 1 (10 m²)']).toBe('250,00 €');
        expect(byLabel['Person 2 (30 m²)']).toBe('750,00 €');
    });
});
