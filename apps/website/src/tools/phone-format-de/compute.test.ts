import { describe, expect, test } from 'bun:test';
import { generatePhoneFormatDe } from './compute';

describe('phone-format-de', () => {
    test('formats german mobile', () => {
        const result = generatePhoneFormatDe({ phone: '0151 12345678' });
        expect(result?.content).toContain('+4915112345678');
    });
});
