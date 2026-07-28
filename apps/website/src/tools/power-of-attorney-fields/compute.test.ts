import { describe, expect, test } from 'bun:test';
import { generatePowerOfAttorneyFields } from './compute';

describe('power-of-attorney-fields', () => {
    test('specific type mentions konkrete handlung', () => {
        const result = generatePowerOfAttorneyFields({ type: 'specific' });
        expect(result?.content).toContain('Konkrete Handlung');
    });
});
