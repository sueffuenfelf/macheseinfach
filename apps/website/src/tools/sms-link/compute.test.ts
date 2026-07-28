import { describe, expect, test } from 'bun:test';
import { generateSmsLink } from './compute';

describe('sms-link', () => {
    test('builds sms uri', () => {
        const result = generateSmsLink({ phone: '0151 12345678', message: 'Test' });
        expect(result?.content).toContain('sms:+4915112345678');
        expect(result?.content).toContain('body=');
    });
});
