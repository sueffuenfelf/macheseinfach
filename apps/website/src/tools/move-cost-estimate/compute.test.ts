import { describe, expect, test } from 'bun:test';
import { computeMoveCost } from './compute';

describe('move-cost-estimate', () => {
    test('mid service produces span', () => {
        const result = computeMoveCost({ sqm: '50', km: '20', level: 'mid' });
        expect(result.error).toBeUndefined();
        expect(result.rows.length).toBe(4);
        const mid = result.rows.find((r) => r.label === 'Spanne Mitte');
        expect(String(mid?.value)).toMatch(/€/);
    });
});
