import { describe, expect, test } from 'bun:test';
import { checkRetentionPeriod } from './compute';

describe('retention-period-hint', () => {
    test('invoice is 10 years', () => {
        const result = checkRetentionPeriod({ documentType: 'invoice' });
        expect(result.ok).toBe(true);
        expect(result.heading).toContain('10');
    });
});
