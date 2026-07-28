import { describe, expect, test } from 'bun:test';
import { computeContractPenaltyHint } from './compute';

describe('contract-penalty-hint', () => {
    test('warns on high penalty', () => {
        const result = computeContractPenaltyHint({ contractValue: '10000', penaltyPercent: '20' });
        expect(result.tone).toBe('danger');
    });
});
