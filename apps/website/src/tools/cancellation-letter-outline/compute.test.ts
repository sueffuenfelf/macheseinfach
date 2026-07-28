import { describe, expect, test } from 'bun:test';
import { generateCancellationLetterOutline } from './compute';

describe('cancellation-letter-outline', () => {
    test('rent outline mentions wohnung', () => {
        const result = generateCancellationLetterOutline({ contractType: 'rent' });
        expect(result?.content).toContain('Wohnung');
    });
});
