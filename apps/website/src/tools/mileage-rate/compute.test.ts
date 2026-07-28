import { describe, expect, test } from 'bun:test';
import { computeMileageRate } from './compute';

describe('mileage-rate compute', () => {
    test('100 km at 0.30', () => {
        const result = computeMileageRate({ km: '100' });
        expect(result.error).toBeUndefined();
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r.value]));
        expect(byLabel.Pauschale).toBe('30,00\u00a0€');
    });

    test('invalid km', () => {
        expect(computeMileageRate({ km: '-5' }).error).toBeTruthy();
    });
});
